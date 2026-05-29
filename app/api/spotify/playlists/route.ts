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
    // Filter out Spotify-owned algorithmic / editorial playlists. As of
    // April 2024 Spotify restricted /playlists/{id}/tracks for these in
    // development mode (Discover Weekly, Daily Mixes, Release Radar, etc.),
    // so even if we showed them in the dropdown we'd 403 on the next call.
    const accessible = playlists.filter(
      (p) => p.ownerId.toLowerCase() !== 'spotify',
    );
    return NextResponse.json({ playlists: accessible, total: accessible.length });
  } catch (err) {
    // Log the raw error to Vercel runtime logs so we can diagnose unusual
    // Spotify responses without exposing internals to the client.
    console.error('[/api/spotify/playlists] failed:', err);
    if (err instanceof SpotifyApiError) {
      return NextResponse.json<ApiError>(
        { error: err.message, status: err.status },
        { status: err.status },
      );
    }
    const detail = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json<ApiError>(
      { error: `Failed to fetch playlists: ${detail}`, status: 500 },
      { status: 500 },
    );
  }
}
