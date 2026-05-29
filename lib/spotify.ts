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
  SpotifyPlaylist,
  SpotifySavedTracksResponse,
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
