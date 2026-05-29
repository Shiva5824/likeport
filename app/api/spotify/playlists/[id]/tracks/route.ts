/**
 * GET /api/spotify/playlists/{id}/tracks
 *
 * Returns the normalized track list for a single playlist as JSON. Used by
 * the dashboard to show a preview of what's inside a playlist before the
 * user downloads it as CSV.
 */
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getAllPlaylistTracks, SpotifyApiError } from '@/lib/spotify';
import type { ApiError, Track } from '@/types/spotify';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

interface RouteContext {
  params: { id: string };
}

export async function GET(
  _req: Request,
  ctx: RouteContext,
): Promise<NextResponse<{ tracks: Track[]; total: number } | ApiError>> {
  const session = await auth();
  if (!session?.accessToken || session.error === 'RefreshAccessTokenError') {
    return NextResponse.json<ApiError>(
      { error: 'Not authenticated', status: 401 },
      { status: 401 },
    );
  }

  const playlistId = ctx.params.id;
  if (!playlistId || !/^[A-Za-z0-9]+$/.test(playlistId)) {
    return NextResponse.json<ApiError>(
      { error: 'Invalid playlist id', status: 400 },
      { status: 400 },
    );
  }

  try {
    const tracks = await getAllPlaylistTracks(session.accessToken, playlistId);
    return NextResponse.json({ tracks, total: tracks.length });
  } catch (err) {
    console.error('[/api/spotify/playlists/[id]/tracks] failed:', err);
    if (err instanceof SpotifyApiError) {
      // 403 here usually means the playlist is owned by Spotify (Discover
      // Weekly, Daily Mix, Release Radar, etc.) and the Web API blocks
      // reading it from third-party apps. Surface a clearer message.
      if (err.status === 403) {
        return NextResponse.json<ApiError>(
          {
            error:
              'This playlist is owned by Spotify (e.g. Discover Weekly, Daily Mix) and the Spotify Web API does not let third-party apps read its tracks. Try one of your own playlists instead.',
            status: 403,
          },
          { status: 403 },
        );
      }
      return NextResponse.json<ApiError>(
        { error: err.message, status: err.status },
        { status: err.status },
      );
    }
    const detail = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json<ApiError>(
      { error: `Failed to fetch playlist tracks: ${detail}`, status: 500 },
      { status: 500 },
    );
  }
}
