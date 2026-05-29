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

/** Lightweight playlist summary used in user-playlist listings. */
export interface SpotifyPlaylistSummary {
  id: string;
  name: string;
  description: string | null;
  owner: { id: string; display_name: string | null };
  images: SpotifyImage[];
  tracks: { total: number };
  public: boolean | null;
  collaborative: boolean;
  external_urls: { spotify: string };
}

/** Item shape returned by /playlists/{id}/tracks. */
export interface SpotifyPlaylistTrackItem {
  added_at: string;
  // `track` can be null for unavailable items, or an episode (we skip those).
  track: (SpotifyTrackRaw & { type?: string }) | null;
}

/** Page envelope for /playlists/{id}/tracks. */
export interface SpotifyPlaylistTracksResponse {
  items: SpotifyPlaylistTrackItem[];
  total: number;
  next: string | null;
}

/** Page envelope for /me/playlists. */
export interface SpotifyMePlaylistsResponse {
  items: SpotifyPlaylistSummary[];
  total: number;
  next: string | null;
}

/** App-level playlist summary returned to the frontend. */
export interface PlaylistSummary {
  id: string;
  name: string;
  description: string;
  owner: string;
  ownerId: string;
  image: string | null;
  total: number;
  isPublic: boolean | null;
  collaborative: boolean;
  spotifyUrl: string;
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

/** A row parsed from a user-uploaded CSV. */
export interface CsvRow {
  /** Original line index (1-based, excluding header) for error reporting. */
  rowIndex: number;
  title: string;
  artist: string;
  album: string;
  /** May be a Spotify URL (track / open.spotify.com / spotify:track:...) or empty. */
  spotifyUrl: string;
}

/** Per-row import outcome returned to the client. */
export interface ImportRowResult {
  rowIndex: number;
  title: string;
  artist: string;
  /** Resulting Spotify track URI if matched, else null. */
  uri: string | null;
  /** How the URI was found: 'url' (parsed from CSV), 'search' (Spotify search), or 'missed'. */
  via: 'url' | 'search' | 'missed';
  /** Optional human-readable reason when not matched. */
  note?: string;
}

/** Response from POST /api/spotify/import-csv. */
export interface ImportCsvResponse {
  playlist: CreatePlaylistResponse;
  matched: number;
  missed: number;
  results: ImportRowResult[];
}
