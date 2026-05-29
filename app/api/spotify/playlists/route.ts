/**
 * GET /api/spotify/playlists
 *
 * Returns the authenticated user's playlists (owned + followed). Used by
 * the dashboard to populate the "Export any playlist as CSV" picker.
 */
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getAllUserPlaylists, SpotifyApiError } from '@/lib/spotify';
import type { ApiError, PlaylistSummary } from '@/types/spotify';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET(): Promise<
  NextResponse<{ playlists: PlaylistSummary[]; total: number } | ApiError>
> {
  const session = await auth();
  if (!session?.accessToken || session.error === 'RefreshAccessTokenError') {
    return NextResponse.json<ApiError>(
      { error: 'Not authenticated', status: 401 },
      { status: 401 },
    );
  }

  try {
    const playlists = await getAllUserPlaylists(session.accessToken);
    return NextResponse.json({ playlists, total: playlists.length });
  } catch (err) {
    if (err instanceof SpotifyApiError) {
      return NextResponse.json<ApiError>(
        { error: err.message, status: err.status },
        { status: err.status },
      );
    }
    return NextResponse.json<ApiError>(
      { error: 'Failed to fetch playlists', status: 500 },
      { status: 500 },
    );
  }
}
