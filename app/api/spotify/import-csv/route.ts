/**
 * POST /api/spotify/import-csv
 *
 * Body (JSON):
 *   {
 *     name: string,                   // playlist name to create
 *     description?: string,
 *     isPublic: boolean,
 *     csv: string                     // raw CSV text
 *   }
 *
 * Workflow:
 *   1. Parse CSV. Detect columns by header (Title, Artist, Album, Spotify URL)
 *      with reasonable case/spelling tolerance.
 *   2. For each row:
 *      a. If a Spotify URL/URI is present, parse the track id and verify it exists.
 *      b. Otherwise, search by title + first artist.
 *   3. De-duplicate URIs while preserving order.
 *   4. Create a new playlist and add the matched tracks in 100-track batches.
 *   5. Return per-row results so the UI can show what matched and what didn't.
 *
 * Performance: lookups happen in small concurrent batches (8 in flight) to
 * stay within Spotify's rate limits while keeping latency reasonable.
 */
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import {
  createPlaylistWithTracks,
  getMe,
  getTrackById,
  parseSpotifyTrackId,
  searchTrack,
  SpotifyApiError,
} from '@/lib/spotify';
import { normalizeHeader, parseCsv } from '@/lib/utils';
import type { ApiError, ImportCsvResponse, ImportRowResult } from '@/types/spotify';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

interface ImportCsvBody {
  name?: string;
  description?: string;
  isPublic?: boolean;
  csv?: string;
}

/** Maximum CSV rows we will process per request — keeps runs under the 60s budget. */
const MAX_ROWS = 1000;
/** Number of track lookups in flight at once. */
const CONCURRENCY = 8;

export async function POST(
  req: Request,
): Promise<NextResponse<ImportCsvResponse | ApiError>> {
  const session = await auth();
  if (!session?.accessToken || session.error === 'RefreshAccessTokenError') {
    return NextResponse.json<ApiError>(
      { error: 'Not authenticated', status: 401 },
      { status: 401 },
    );
  }

  let body: ImportCsvBody;
  try {
    body = (await req.json()) as ImportCsvBody;
  } catch {
    return NextResponse.json<ApiError>(
      { error: 'Invalid JSON body', status: 400 },
      { status: 400 },
    );
  }

  const name = (body.name ?? '').trim();
  if (!name) {
    return NextResponse.json<ApiError>(
      { error: 'Playlist name is required', status: 400 },
      { status: 400 },
    );
  }
  if (typeof body.csv !== 'string' || !body.csv.trim()) {
    return NextResponse.json<ApiError>(
      { error: 'CSV content is required', status: 400 },
      { status: 400 },
    );
  }

  const rows = parseCsv(body.csv);
  if (rows.length === 0) {
    return NextResponse.json<ApiError>(
      { error: 'CSV is empty', status: 400 },
      { status: 400 },
    );
  }

  // Locate columns from the header row using normalized names. We accept
  // common variations such as "song", "track", "name", and "url"/"link".
  const header = rows[0].map((h) => normalizeHeader(h));
  const findCol = (...candidates: string[]): number => {
    for (const candidate of candidates) {
      const idx = header.indexOf(candidate);
      if (idx !== -1) return idx;
    }
    return -1;
  };
  const titleIdx = findCol('title', 'name', 'track', 'song');
  const artistIdx = findCol('artist', 'artists');
  const albumIdx = findCol('album');
  const urlIdx = findCol('spotifyurl', 'url', 'link');

  if (titleIdx === -1 && urlIdx === -1) {
    return NextResponse.json<ApiError>(
      {
        error:
          'CSV needs at least a "Title" column (or a "Spotify URL" column). Headers detected: ' +
          rows[0].join(', '),
        status: 400,
      },
      { status: 400 },
    );
  }

  const dataRows = rows.slice(1, 1 + MAX_ROWS);
  const truncated = rows.length - 1 > MAX_ROWS;

  // First pass: compile parsed rows + immediate URL hits.
  type Job = {
    rowIndex: number;
    title: string;
    artist: string;
    album: string;
    initialUri: string | null;
    initialId: string | null;
  };
  const jobs: Job[] = [];
  for (let i = 0; i < dataRows.length; i++) {
    const r = dataRows[i];
    const title = (titleIdx !== -1 ? r[titleIdx] : '').trim();
    const artist = (artistIdx !== -1 ? r[artistIdx] : '').trim();
    const album = (albumIdx !== -1 ? r[albumIdx] : '').trim();
    const urlCell = (urlIdx !== -1 ? r[urlIdx] : '').trim();
    const id = urlCell ? parseSpotifyTrackId(urlCell) : null;
    if (!title && !id) continue;
    jobs.push({
      rowIndex: i + 2, // 1-based + skipped header
      title,
      artist,
      album,
      initialUri: id ? `spotify:track:${id}` : null,
      initialId: id,
    });
  }

  // Second pass: look up rows that didn't have a URL. We verify URL hits
  // by hitting /tracks/{id} so unavailable/removed tracks are handled.
  const accessToken = session.accessToken;
  async function resolve(job: Job): Promise<ImportRowResult> {
    try {
      if (job.initialId) {
        const track = await getTrackById(accessToken, job.initialId);
        if (track) {
          return {
            rowIndex: job.rowIndex,
            title: job.title || track.name,
            artist: job.artist || track.artists.map((a) => a.name).join(', '),
            uri: track.uri,
            via: 'url',
          };
        }
        // URL was present but track is gone — fall through to search.
      }
      if (job.title) {
        const found = await searchTrack(accessToken, {
          title: job.title,
          artist: job.artist,
          album: job.album,
        });
        if (found) {
          return {
            rowIndex: job.rowIndex,
            title: job.title,
            artist: job.artist,
            uri: found.uri,
            via: 'search',
          };
        }
      }
      return {
        rowIndex: job.rowIndex,
        title: job.title,
        artist: job.artist,
        uri: null,
        via: 'missed',
        note: 'No matching track found on Spotify',
      };
    } catch (err) {
      const note =
        err instanceof SpotifyApiError ? err.message : 'Lookup failed';
      return {
        rowIndex: job.rowIndex,
        title: job.title,
        artist: job.artist,
        uri: null,
        via: 'missed',
        note,
      };
    }
  }

  // Run lookups in bounded-concurrency batches to keep API pressure sane.
  const results: ImportRowResult[] = new Array(jobs.length);
  let cursor = 0;
  async function worker() {
    while (true) {
      const i = cursor++;
      if (i >= jobs.length) return;
      results[i] = await resolve(jobs[i]);
    }
  }
  await Promise.all(
    Array.from({ length: Math.min(CONCURRENCY, jobs.length) }, () => worker()),
  );

  // De-duplicate matched URIs while preserving row order.
  const seen = new Set<string>();
  const uris: string[] = [];
  for (const r of results) {
    if (r.uri && !seen.has(r.uri)) {
      seen.add(r.uri);
      uris.push(r.uri);
    }
  }

  if (uris.length === 0) {
    return NextResponse.json<ApiError>(
      {
        error: truncated
          ? `No tracks matched in the first ${MAX_ROWS} rows of your CSV.`
          : 'No tracks from your CSV could be matched on Spotify.',
        status: 422,
      },
      { status: 422 },
    );
  }

  // Resolve user id once and create the playlist.
  let userId = session.user?.id;
  if (!userId) {
    try {
      const me = await getMe(accessToken);
      userId = me.id;
    } catch (err) {
      const status = err instanceof SpotifyApiError ? err.status : 500;
      const msg = err instanceof Error ? err.message : 'Failed to resolve user';
      return NextResponse.json<ApiError>(
        { error: msg, status },
        { status },
      );
    }
  }

  let playlist;
  try {
    playlist = await createPlaylistWithTracks(accessToken, userId, {
      name,
      description:
        body.description ??
        `Imported from CSV with LikePort${truncated ? ` (first ${MAX_ROWS} rows)` : ''}`,
      isPublic: Boolean(body.isPublic),
      trackUris: uris,
    });
  } catch (err) {
    const status = err instanceof SpotifyApiError ? err.status : 500;
    const msg = err instanceof Error ? err.message : 'Failed to create playlist';
    return NextResponse.json<ApiError>(
      { error: msg, status },
      { status },
    );
  }

  const matched = results.filter((r) => r.uri).length;
  const missed = results.length - matched;

  return NextResponse.json<ImportCsvResponse>({
    playlist,
    matched,
    missed,
    results,
  });
}
