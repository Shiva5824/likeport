/**
 * GET /api/spotify/liked-songs
 *
 * Returns every saved track for the authenticated user, normalized to the
 * `Track` shape. Pagination of /me/tracks is handled inside `getAllLikedTracks`.
 */
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getAllLikedTracks, SpotifyApiError } from '@/lib/spotify';
import type { ApiError, Track } from '@/types/spotify';

// This route streams progressively from Spotify; never cache it.
export const dynamic = 'force-dynamic';
// Larger fetches can take time; bump the runtime budget on Vercel.
export const maxDuration = 60;

export async function GET(): Promise<NextResponse<{ tracks: Track[]; total: number } | ApiError>> {
  const session = await auth();

  if (!session?.accessToken || session.error === 'RefreshAccessTokenError') {
    return NextResponse.json<ApiError>(
      { error: 'Not authenticated', status: 401 },
      { status: 401 },
    );
  }

  try {
    const tracks = await getAllLikedTracks(session.accessToken);
    return NextResponse.json({ tracks, total: tracks.length });
  } catch (err) {
    if (err instanceof SpotifyApiError) {
      // Map 401 from Spotify to a re-auth signal for the client.
      const status = err.status === 401 ? 401 : err.status;
      return NextResponse.json<ApiError>(
        { error: err.message, status },
        { status },
      );
    }
    return NextResponse.json<ApiError>(
      { error: 'Failed to fetch liked songs', status: 500 },
      { status: 500 },
    );
  }
}
