/**
 * Spotify Web API helpers.
 *
 * All requests go through `spotifyFetch`, which handles:
 *   - Bearer auth header
 *   - 429 rate-limit retries (honors Retry-After)
 *   - Friendly error surfacing
 *
 * No SDK is used — just `fetch`.
 */

import type {
  CreatePlaylistResponse,
  PlaylistSummary,
  SpotifyMePlaylistsResponse,
  SpotifyPlaylist,
  SpotifyPlaylistTracksResponse,
  SpotifySavedTracksResponse,
  SpotifyTrackRaw,
  SpotifyUser,
  Track,
} from '@/types/spotify';
import { chunk, sleep } from '@/lib/utils';

const SPOTIFY_API = 'https://api.spotify.com/v1';
/** Max retries for transient 429 / 5xx responses. */
const MAX_RETRIES = 5;

/**
 * Custom error so route handlers can map specific failure modes
 * (auth vs rate-limit vs other) to appropriate HTTP responses.
 */
export class SpotifyApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = 'SpotifyApiError';
  }
}

/**
 * Authenticated fetch wrapper with retry logic.
 *
 * Throws SpotifyApiError on non-2xx responses (after exhausting retries).
 * Returns the parsed JSON body cast to T, or `undefined` for 204 responses.
 */
export async function spotifyFetch<T>(
  accessToken: string,
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const url = path.startsWith('http') ? path : `${SPOTIFY_API}${path}`;
  let attempt = 0;

  // Loop on retryable failures only. Non-retryable failures throw immediately.
  while (true) {
    const res = await fetch(url, {
      ...init,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        ...(init.headers ?? {}),
      },
      // Spotify endpoints should never be cached by Next.
      cache: 'no-store',
    });

    if (res.ok) {
      // 204 No Content — many playlist mutations return empty bodies.
      if (res.status === 204) return undefined as unknown as T;
      const text = await res.text();
      return text ? (JSON.parse(text) as T) : (undefined as unknown as T);
    }

    // 429 = rate limited. Retry-After is in seconds.
    if (res.status === 429 && attempt < MAX_RETRIES) {
      const retryAfter = Number(res.headers.get('Retry-After') ?? '1');
      await sleep((retryAfter + 0.25) * 1000);
      attempt += 1;
      continue;
    }

    // Treat 5xx as transient; back off briefly and retry.
    if (res.status >= 500 && attempt < MAX_RETRIES) {
      await sleep(2 ** attempt * 250);
      attempt += 1;
      continue;
    }

    // Non-retryable: surface a useful message.
    let detail = res.statusText;
    try {
      const body = await res.json();
      if (body?.error?.message) detail = body.error.message;
    } catch {
      // body wasn't JSON, ignore
    }
    throw new SpotifyApiError(detail, res.status);
  }
}

/** Fetch the current user's profile (used to get the user id). */
export async function getMe(accessToken: string): Promise<SpotifyUser> {
  return spotifyFetch<SpotifyUser>(accessToken, '/me');
}

/**
 * Fetch every saved (liked) track for the user by paginating /me/tracks.
 *
 * Spotify returns at most 50 items per page. We loop on `next` until we've
 * captured them all, normalizing each entry into our internal `Track` shape.
 */
export async function getAllLikedTracks(accessToken: string): Promise<Track[]> {
  const tracks: Track[] = [];
  const limit = 50;
  let offset = 0;
  let total = Infinity;

  while (offset < total) {
    const page = await spotifyFetch<SpotifySavedTracksResponse>(
      accessToken,
      `/me/tracks?limit=${limit}&offset=${offset}`,
    );
    total = page.total;

    for (const item of page.items) {
      const t = item.track;
      // Defensive: Spotify can return `null` track entries for unavailable items.
      if (!t || !t.id) continue;
      tracks.push({
        id: t.id,
        name: t.name,
        artists: t.artists.map((a) => a.name),
        album: t.album.name,
        albumArt: t.album.images[0]?.url ?? null,
        addedAt: item.added_at,
        duration_ms: t.duration_ms,
        uri: t.uri,
        spotifyUrl: t.external_urls.spotify,
      });
    }

    offset += page.items.length;
    // If Spotify reports a smaller page than `limit`, we've reached the end.
    if (page.items.length === 0) break;
  }

  return tracks;
}

/**
 * Create a playlist for the user and add `trackUris` to it.
 *
 * Spotify only allows 100 URIs per add-tracks request, so we chunk.
 * Calls are sequential to keep ordering stable and to avoid 429s.
 */
export async function createPlaylistWithTracks(
  accessToken: string,
  userId: string,
  args: {
    name: string;
    description?: string;
    isPublic: boolean;
    trackUris: string[];
  },
): Promise<CreatePlaylistResponse> {
  const playlist = await spotifyFetch<SpotifyPlaylist>(
    accessToken,
    `/users/${encodeURIComponent(userId)}/playlists`,
    {
      method: 'POST',
      body: JSON.stringify({
        name: args.name,
        description: args.description ?? '',
        public: args.isPublic,
      }),
    },
  );

  if (args.trackUris.length > 0) {
    const batches = chunk(args.trackUris, 100);
    for (const batch of batches) {
      await spotifyFetch<{ snapshot_id: string }>(
        accessToken,
        `/playlists/${playlist.id}/tracks`,
        {
          method: 'POST',
          body: JSON.stringify({ uris: batch }),
        },
      );
    }
  }

  return {
    id: playlist.id,
    name: playlist.name,
    url: playlist.external_urls.spotify,
    trackCount: args.trackUris.length,
  };
}

/**
 * Fetch every playlist visible to the current user (owned + followed).
 * Paginates /me/playlists 50 at a time.
 *
 * Defensive against the various shapes Spotify can return: null items,
 * playlists with no images, playlists where the `tracks` field is missing,
 * and so on. Bad entries are skipped rather than throwing.
 */
export async function getAllUserPlaylists(
  accessToken: string,
): Promise<PlaylistSummary[]> {
  const out: PlaylistSummary[] = [];
  const limit = 50;
  let offset = 0;
  let total = Infinity;

  while (offset < total) {
    const page = await spotifyFetch<SpotifyMePlaylistsResponse>(
      accessToken,
      `/me/playlists?limit=${limit}&offset=${offset}`,
    );
    total = typeof page.total === 'number' ? page.total : 0;
    const items = Array.isArray(page.items) ? page.items : [];
    for (const p of items) {
      // Spotify can return `null` items for unavailable/deleted playlists.
      if (!p || typeof p.id !== 'string') continue;
      try {
        out.push({
          id: p.id,
          name: typeof p.name === 'string' ? p.name : '(untitled playlist)',
          description: p.description ?? '',
          owner: p.owner?.display_name ?? p.owner?.id ?? 'Unknown',
          ownerId: p.owner?.id ?? '',
          image: Array.isArray(p.images) ? p.images[0]?.url ?? null : null,
          total: p.tracks?.total ?? 0,
          isPublic: typeof p.public === 'boolean' ? p.public : null,
          collaborative: Boolean(p.collaborative),
          spotifyUrl: p.external_urls?.spotify ?? '',
        });
      } catch {
        // Skip malformed entries instead of failing the whole request.
        continue;
      }
    }
    offset += items.length;
    if (items.length === 0) break;
  }

  return out;
}

/**
 * Fetch every track of a given playlist by paginating /playlists/{id}/tracks.
 *
 * Skips local files and episodes, which Spotify can return inside a
 * playlist but which don't have a useful URI for our exports.
 *
 * Defensive against null/partial entries so a single weird item doesn't
 * break the whole fetch.
 */
export async function getAllPlaylistTracks(
  accessToken: string,
  playlistId: string,
): Promise<Track[]> {
  const tracks: Track[] = [];
  const limit = 100;
  let offset = 0;
  let total = Infinity;

  while (offset < total) {
    // Don't pass a `fields` filter — Spotify's filtered responses sometimes
    // omit details we need (album images, external_urls) and we'd rather
    // pay a slightly larger payload than miss data.
    const page = await spotifyFetch<SpotifyPlaylistTracksResponse>(
      accessToken,
      `/playlists/${encodeURIComponent(
        playlistId,
      )}/tracks?limit=${limit}&offset=${offset}`,
    );
    total = typeof page.total === 'number' ? page.total : 0;
    const items = Array.isArray(page.items) ? page.items : [];

    for (const item of items) {
      const t = item?.track;
      // Skip null entries, episodes, and local files (no usable URI/id).
      if (!t || typeof t.id !== 'string') continue;
      if (t.type === 'episode') continue;
      if (typeof t.uri === 'string' && t.uri.startsWith('spotify:local:')) continue;
      try {
        tracks.push({
          id: t.id,
          name: typeof t.name === 'string' ? t.name : '(unknown track)',
          artists: Array.isArray(t.artists)
            ? t.artists.map((a) => a?.name ?? '').filter(Boolean)
            : [],
          album: t.album?.name ?? '',
          albumArt: Array.isArray(t.album?.images) ? t.album.images[0]?.url ?? null : null,
          addedAt: typeof item.added_at === 'string' ? item.added_at : '',
          duration_ms: typeof t.duration_ms === 'number' ? t.duration_ms : 0,
          uri: t.uri ?? `spotify:track:${t.id}`,
          spotifyUrl: t.external_urls?.spotify ?? `https://open.spotify.com/track/${t.id}`,
        });
      } catch {
        continue;
      }
    }

    offset += items.length;
    if (items.length === 0) break;
  }

  return tracks;
}

/**
 * Extract a Spotify track id from a string. Accepts:
 *   - https://open.spotify.com/track/{id}[?si=...]
 *   - http://open.spotify.com/track/{id}
 *   - spotify:track:{id}
 *   - bare 22-char base62 id
 *
 * Returns null if no track id is recognized.
 */
export function parseSpotifyTrackId(input: string): string | null {
  const s = input.trim();
  if (!s) return null;

  // URI form: spotify:track:abc...
  const uriMatch = s.match(/^spotify:track:([A-Za-z0-9]{22})$/);
  if (uriMatch) return uriMatch[1];

  // Open URL: open.spotify.com/track/abc... or with embed/intl-xx prefixes
  const urlMatch = s.match(
    /https?:\/\/open\.spotify\.com\/(?:[a-z-]+\/)*track\/([A-Za-z0-9]{22})/,
  );
  if (urlMatch) return urlMatch[1];

  // Bare id
  if (/^[A-Za-z0-9]{22}$/.test(s)) return s;
  return null;
}

/**
 * Look up a single track by its id. Returns null on 404 (track removed).
 */
export async function getTrackById(
  accessToken: string,
  trackId: string,
): Promise<SpotifyTrackRaw | null> {
  try {
    return await spotifyFetch<SpotifyTrackRaw>(
      accessToken,
      `/tracks/${encodeURIComponent(trackId)}`,
    );
  } catch (err) {
    if (err instanceof SpotifyApiError && err.status === 404) return null;
    throw err;
  }
}

/**
 * Search Spotify for the best-matching track given a title and artist.
 *
 * We construct a query using Spotify's field filters (`track:` + `artist:`)
 * which are dramatically more accurate than free-text queries, and fall
 * back to a free-text query if the structured one misses.
 */
export async function searchTrack(
  accessToken: string,
  args: { title: string; artist?: string; album?: string },
): Promise<SpotifyTrackRaw | null> {
  const title = args.title.trim();
  if (!title) return null;
  // Use the first listed artist if multiple are comma-separated.
  const primaryArtist = (args.artist ?? '').split(/[,;/]| feat\.| ft\./i)[0]?.trim();

  function buildQuery(structured: boolean): string {
    if (structured) {
      const parts = [`track:${quote(title)}`];
      if (primaryArtist) parts.push(`artist:${quote(primaryArtist)}`);
      return parts.join(' ');
    }
    return [title, primaryArtist].filter(Boolean).join(' ');
  }

  for (const structured of [true, false]) {
    const q = buildQuery(structured);
    const res = await spotifyFetch<{
      tracks: { items: SpotifyTrackRaw[] };
    }>(
      accessToken,
      `/search?type=track&limit=5&q=${encodeURIComponent(q)}`,
    );
    if (res.tracks.items.length > 0) return res.tracks.items[0];
  }
  return null;
}

/** Quote a search query fragment so spaces don't break field filters. */
function quote(s: string): string {
  return s.includes(' ') ? `"${s.replace(/"/g, '')}"` : s;
}
