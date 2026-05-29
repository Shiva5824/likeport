/**
 * Spotify API + app-level type definitions.
 *
 * Only the fields we actually consume are typed. The Spotify API returns
 * many more fields, but we keep these minimal and strict so the rest of
 * the codebase stays `any`-free.
 */

/** Lightweight artist reference (used inside Track). */
export interface SpotifyArtist {
  id: string;
  name: string;
}

/** A single image entry from Spotify (album art, artist image, etc.). */
export interface SpotifyImage {
  url: string;
  height: number | null;
  width: number | null;
}

/** Album reference embedded in a Track. */
export interface SpotifyAlbum {
  id: string;
  name: string;
  images: SpotifyImage[];
}

/** Raw track shape returned by /me/tracks (only fields we consume). */
export interface SpotifyTrackRaw {
  id: string;
  name: string;
  uri: string;
  duration_ms: number;
  artists: SpotifyArtist[];
  album: SpotifyAlbum;
  external_urls: {
    spotify: string;
  };
}

/** Wrapper item returned by /me/tracks (saved track entry). */
export interface SpotifySavedTrackItem {
  added_at: string;
  track: SpotifyTrackRaw;
}

/** Response envelope for /me/tracks. */
export interface SpotifySavedTracksResponse {
  items: SpotifySavedTrackItem[];
  total: number;
  limit: number;
  offset: number;
  next: string | null;
}

/** Spotify user profile (only fields we use). */
export interface SpotifyUser {
  id: string;
  display_name: string | null;
  email: string | null;
  images: SpotifyImage[];
}

/** Created playlist response. */
export interface SpotifyPlaylist {
  id: string;
  name: string;
  external_urls: {
    spotify: string;
  };
  uri: string;
}

/**
 * Normalized track representation used by the frontend and CSV export.
 * Every API consumer in the app accepts this shape, never the raw Spotify one.
 */
export interface Track {
  id: string;
  name: string;
  artists: string[];
  album: string;
  albumArt: string | null;
  addedAt: string; // ISO8601
  duration_ms: number;
  uri: string;
  spotifyUrl: string;
}

/** Standard error payload returned from our own API routes. */
export interface ApiError {
  error: string;
  status?: number;
}

/** Successful response from POST /api/spotify/create-playlist. */
export interface CreatePlaylistResponse {
  id: string;
  name: string;
  url: string;
  trackCount: number;
}

/** Body accepted by POST /api/spotify/create-playlist. */
export interface CreatePlaylistBody {
  name: string;
  description?: string;
  trackUris: string[];
  isPublic: boolean;
}
