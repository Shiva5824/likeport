/**
 * POST /api/spotify/create-playlist
 *
 * Body: { name, description?, trackUris[], isPublic }
 *
 * Creates a new playlist owned by the authenticated user, then adds
 * `trackUris` to it in batches of 100 (Spotify's per-request limit).
 * Returns the new playlist's id, name, public Spotify URL, and trackCount.
 */
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { createPlaylistWithTracks, getMe, SpotifyApiError } from '@/lib/spotify';
import type {
  ApiError,
  CreatePlaylistBody,
  CreatePlaylistResponse,
} from '@/types/spotify';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(
  req: Request,
): Promise<NextResponse<CreatePlaylistResponse | ApiError>> {
  const session = await auth();

  if (!session?.accessToken || session.error === 'RefreshAccessTokenError') {
    return NextResponse.json<ApiError>(
      { error: 'Not authenticated', status: 401 },
      { status: 401 },
    );
  }

  let body: CreatePlaylistBody;
  try {
    body = (await req.json()) as CreatePlaylistBody;
  } catch {
    return NextResponse.json<ApiError>(
      { error: 'Invalid JSON body', status: 400 },
      { status: 400 },
    );
  }

  // Validate required fields. Spotify rejects empty names.
  if (!body.name || typeof body.name !== 'string') {
    return NextResponse.json<ApiError>(
      { error: 'Playlist name is required', status: 400 },
      { status: 400 },
    );
  }
  if (!Array.isArray(body.trackUris)) {
    return NextResponse.json<ApiError>(
      { error: 'trackUris must be an array', status: 400 },
      { status: 400 },
    );
  }

  try {
    // We need the user's id to call /users/{id}/playlists.
    // Prefer the cached id from session, otherwise call /me.
    let userId = session.user?.id;
    if (!userId) {
      const me = await getMe(session.accessToken);
      userId = me.id;
    }

    const result = await createPlaylistWithTracks(session.accessToken, userId, {
      name: body.name,
      description: body.description,
      isPublic: Boolean(body.isPublic),
      trackUris: body.trackUris,
    });
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof SpotifyApiError) {
      return NextResponse.json<ApiError>(
        { error: err.message, status: err.status },
        { status: err.status },
      );
    }
    return NextResponse.json<ApiError>(
      { error: 'Failed to create playlist', status: 500 },
      { status: 500 },
    );
  }
}
