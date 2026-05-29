/**
 * GET /api/spotify/playlists/{id}/csv
 *
 * Streams a CSV file for the specified playlist. Same column shape as the
 * liked-songs CSV: Title, Artist, Album, Date Added, Duration, Spotify URL.
 *
 * The user must have read access to the playlist (Spotify enforces this).
 */
import { auth } from '@/auth';
import { spotifyFetch, getAllPlaylistTracks, SpotifyApiError } from '@/lib/spotify';
import { csvEscape, formatDuration, todayStamp } from '@/lib/utils';
import type { SpotifyPlaylist } from '@/types/spotify';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const HEADER = ['Title', 'Artist', 'Album', 'Date Added', 'Duration', 'Spotify URL'];

interface RouteContext {
  params: { id: string };
}

export async function GET(_req: Request, ctx: RouteContext): Promise<Response> {
  const session = await auth();
  if (!session?.accessToken || session.error === 'RefreshAccessTokenError') {
    return new Response(JSON.stringify({ error: 'Not authenticated' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const playlistId = ctx.params.id;
  if (!playlistId || !/^[A-Za-z0-9]+$/.test(playlistId)) {
    return new Response(JSON.stringify({ error: 'Invalid playlist id' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    // Fetch the playlist metadata for a friendly filename + the tracks.
    const [meta, tracks] = await Promise.all([
      spotifyFetch<SpotifyPlaylist & { name: string }>(
        session.accessToken,
        `/playlists/${encodeURIComponent(playlistId)}?fields=id,name`,
      ),
      getAllPlaylistTracks(session.accessToken, playlistId),
    ]);

    const lines: string[] = [HEADER.join(',')];
    for (const t of tracks) {
      lines.push(
        [
          csvEscape(t.name),
          csvEscape(t.artists.join(', ')),
          csvEscape(t.album),
          csvEscape(t.addedAt),
          csvEscape(formatDuration(t.duration_ms)),
          csvEscape(t.spotifyUrl),
        ].join(','),
      );
    }
    const csv = lines.join('\r\n');

    // Build a safe filename from the playlist name.
    const safeName = (meta.name || 'playlist').replace(/[^a-z0-9-_]+/gi, '-').slice(0, 60);
    const filename = `${safeName}-${todayStamp()}.csv`;

    return new Response(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (err) {
    if (err instanceof SpotifyApiError) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: err.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return new Response(JSON.stringify({ error: 'Failed to export playlist CSV' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
