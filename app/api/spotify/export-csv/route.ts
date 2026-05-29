/**
 * GET /api/spotify/export-csv
 *
 * Streams a CSV file containing every liked song. Columns:
 *   Title, Artist, Album, Date Added, Duration, Spotify URL
 *
 * The response is sent as `text/csv` with a Content-Disposition header so
 * the browser triggers a file download instead of rendering it.
 */
import { auth } from '@/auth';
import { getAllLikedTracks, SpotifyApiError } from '@/lib/spotify';
import { csvEscape, formatDuration, todayStamp } from '@/lib/utils';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const HEADER = ['Title', 'Artist', 'Album', 'Date Added', 'Duration', 'Spotify URL'];

export async function GET(): Promise<Response> {
  const session = await auth();
  if (!session?.accessToken || session.error === 'RefreshAccessTokenError') {
    return new Response(JSON.stringify({ error: 'Not authenticated' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const tracks = await getAllLikedTracks(session.accessToken);

    // Build the CSV body. We stream by string concatenation since the
    // payload is small relative to memory (a few MB at most).
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

    return new Response(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="liked-songs-${todayStamp()}.csv"`,
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
    return new Response(JSON.stringify({ error: 'Failed to export CSV' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
