'use client';

/**
 * Main dashboard UI.
 *
 * On mount it fetches every liked song through our /api/spotify/liked-songs
 * route and renders:
 *   - Liked-songs export cards (export all, last 30 days, split by artist, CSV)
 *   - Playlist tools (export any playlist as CSV, import CSV as a playlist)
 *   - A virtualized list of liked songs
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { signIn } from 'next-auth/react';
import SongList from '@/components/SongList';
import ExportCard from '@/components/ExportCard';
import { useToast } from '@/components/Toast';
import {
  PrimaryButton,
  SecondaryButton,
  PublicToggle,
  CreatedLink,
} from '@/components/dashboard/primitives';
import PlaylistExportCard from '@/components/dashboard/PlaylistExportCard';
import ImportCsvCard from '@/components/dashboard/ImportCsvCard';
import type {
  ApiError,
  CreatePlaylistResponse,
  Track,
} from '@/types/spotify';
import { todayStamp } from '@/lib/utils';

type LoadState = 'idle' | 'loading' | 'ready' | 'error';

export default function DashboardClient() {
  const toast = useToast();
  const [tracks, setTracks] = useState<Track[]>([]);
  const [state, setState] = useState<LoadState>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  /**
   * Fetch all liked songs once on mount. If the server says we're not
   * authenticated, kick the user back through the sign-in flow.
   */
  useEffect(() => {
    let cancelled = false;
    async function load() {
      setState('loading');
      try {
        const res = await fetch('/api/spotify/liked-songs', {
          cache: 'no-store',
        });
        if (res.status === 401) {
          await signIn('spotify', { callbackUrl: '/dashboard' });
          return;
        }
        if (!res.ok) {
          const body = (await res.json().catch(() => null)) as ApiError | null;
          throw new Error(body?.error ?? `Request failed (${res.status})`);
        }
        const data = (await res.json()) as { tracks: Track[]; total: number };
        if (cancelled) return;
        setTracks(data.tracks);
        setState('ready');
      } catch (err) {
        if (cancelled) return;
        const msg = err instanceof Error ? err.message : 'Something went wrong';
        setErrorMessage(msg);
        setState('error');
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  /** Tracks added within the last 30 days, sorted newest first. */
  const last30 = useMemo(() => {
    const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
    return tracks.filter((t) => new Date(t.addedAt).getTime() >= cutoff);
  }, [tracks]);

  /** Map of artistName -> tracks featuring that artist (any position). */
  const tracksByArtist = useMemo(() => {
    const map = new Map<string, Track[]>();
    for (const t of tracks) {
      for (const artist of t.artists) {
        const list = map.get(artist) ?? [];
        list.push(t);
        map.set(artist, list);
      }
    }
    return map;
  }, [tracks]);

  /** Sorted artist list for the "Split by artist" dropdown. */
  const artists = useMemo(
    () => Array.from(tracksByArtist.keys()).sort((a, b) => a.localeCompare(b)),
    [tracksByArtist],
  );

  /**
   * Shared playlist creation helper. Returns the created playlist or null on
   * error (errors are surfaced via toast).
   */
  const createPlaylist = useCallback(
    async (
      name: string,
      isPublic: boolean,
      uris: string[],
      description?: string,
    ): Promise<CreatePlaylistResponse | null> => {
      try {
        const res = await fetch('/api/spotify/create-playlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, description, isPublic, trackUris: uris }),
        });
        if (res.status === 401) {
          await signIn('spotify', { callbackUrl: '/dashboard' });
          return null;
        }
        const body = (await res.json()) as CreatePlaylistResponse | ApiError;
        if (!res.ok) {
          throw new Error(
            ('error' in body && body.error) || `Request failed (${res.status})`,
          );
        }
        return body as CreatePlaylistResponse;
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to create playlist';
        toast.show({ type: 'error', message: msg });
        return null;
      }
    },
    [toast],
  );

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <Hero state={state} total={tracks.length} />

      {state === 'error' && (
        <div className="mt-6 rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200">
          {errorMessage ?? 'Failed to load liked songs.'}
        </div>
      )}

      {state === 'ready' && tracks.length === 0 && <EmptyState />}

      {state === 'ready' && tracks.length > 0 && (
        <>
          <SectionHeader
            title="From your Liked Songs"
            subtitle="Turn your liked tracks into playlists or export them."
          />
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <CardExportAll tracks={tracks} createPlaylist={createPlaylist} />
            <CardLast30 tracks={last30} createPlaylist={createPlaylist} />
            <CardByArtist
              artists={artists}
              tracksByArtist={tracksByArtist}
              createPlaylist={createPlaylist}
            />
            <CardCsv />
          </div>

          <SectionHeader
            title="Playlist tools"
            subtitle="Export any playlist as a CSV, or upload one to recreate a playlist on Spotify."
            className="mt-12"
          />
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <PlaylistExportCard />
            <ImportCsvCard />
          </div>

          <h2 className="mt-12 mb-3 text-sm font-semibold text-zinc-300">
            Your liked songs
          </h2>
          <SongList tracks={tracks} />
        </>
      )}

      {state === 'loading' && <SkeletonGrid />}
    </main>
  );
}

/* ---------- Header / loading / empty ---------- */

function Hero({ state, total }: { state: LoadState; total: number }) {
  return (
    <div className="flex flex-col gap-1">
      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Dashboard</h1>
      <p className="text-sm text-zinc-400">
        {state === 'loading' && 'Fetching your liked songs from Spotify…'}
        {state === 'ready' && `${total.toLocaleString()} liked songs ready to export.`}
        {state === 'error' && 'We couldn\u2019t load your liked songs.'}
        {state === 'idle' && 'Loading…'}
      </p>
    </div>
  );
}

function SectionHeader({
  title,
  subtitle,
  className = '',
}: {
  title: string;
  subtitle: string;
  className?: string;
}) {
  return (
    <div className={`mt-8 ${className}`}>
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      <p className="mt-1 text-sm text-zinc-400">{subtitle}</p>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="mt-10 rounded-2xl border border-border bg-card p-10 text-center">
      <h3 className="text-lg font-semibold">No liked songs yet</h3>
      <p className="mt-2 text-sm text-zinc-400">
        Open Spotify, tap the heart on a track, then come back here.
      </p>
      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <PlaylistExportCard />
        <ImportCsvCard />
      </div>
    </div>
  );
}

function SkeletonGrid() {
  return (
    <>
      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-44 skeleton rounded-2xl border border-border"
          />
        ))}
      </div>
      <div className="mt-10 space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-12 skeleton rounded-lg" />
        ))}
      </div>
    </>
  );
}

/* ---------- Liked-songs cards ---------- */

function CardExportAll({
  tracks,
  createPlaylist,
}: {
  tracks: Track[];
  createPlaylist: (
    name: string,
    isPublic: boolean,
    uris: string[],
    description?: string,
  ) => Promise<CreatePlaylistResponse | null>;
}) {
  const toast = useToast();
  const [name, setName] = useState(`My Liked Songs — ${todayStamp()}`);
  const [isPublic, setIsPublic] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [created, setCreated] = useState<CreatePlaylistResponse | null>(null);

  async function onCreate() {
    if (!name.trim()) {
      toast.show({ type: 'error', message: 'Please enter a playlist name.' });
      return;
    }
    setSubmitting(true);
    const res = await createPlaylist(
      name.trim(),
      isPublic,
      tracks.map((t) => t.uri),
      'Created with LikePort',
    );
    setSubmitting(false);
    if (res) {
      setCreated(res);
      toast.show({
        type: 'success',
        message: `Created "${res.name}" with ${res.trackCount} tracks.`,
      });
    }
  }

  return (
    <ExportCard
      title="Export all liked songs"
      description="Create one playlist containing every track you have liked."
      badge={`${tracks.length} songs`}
    >
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Playlist name"
        className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm focus:border-accent focus:outline-none"
      />
      <PublicToggle isPublic={isPublic} onChange={setIsPublic} />
      <PrimaryButton onClick={onCreate} disabled={submitting || tracks.length === 0}>
        {submitting ? 'Creating…' : 'Create Playlist'}
      </PrimaryButton>
      {created && <CreatedLink result={created} />}
    </ExportCard>
  );
}

function CardLast30({
  tracks,
  createPlaylist,
}: {
  tracks: Track[];
  createPlaylist: (
    name: string,
    isPublic: boolean,
    uris: string[],
    description?: string,
  ) => Promise<CreatePlaylistResponse | null>;
}) {
  const toast = useToast();
  const [name, setName] = useState(`Liked — Last 30 days (${todayStamp()})`);
  const [isPublic, setIsPublic] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [created, setCreated] = useState<CreatePlaylistResponse | null>(null);

  async function onCreate() {
    if (tracks.length === 0) {
      toast.show({ type: 'info', message: 'No tracks liked in the last 30 days.' });
      return;
    }
    setSubmitting(true);
    const res = await createPlaylist(
      name.trim() || `Liked — Last 30 days (${todayStamp()})`,
      isPublic,
      tracks.map((t) => t.uri),
      'Last 30 days, exported with LikePort',
    );
    setSubmitting(false);
    if (res) {
      setCreated(res);
      toast.show({
        type: 'success',
        message: `Created "${res.name}" with ${res.trackCount} tracks.`,
      });
    }
  }

  return (
    <ExportCard
      title="Last 30 days"
      description="Only songs you have liked within the past month."
      badge={`${tracks.length} songs`}
    >
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Playlist name"
        className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm focus:border-accent focus:outline-none"
      />
      <PublicToggle isPublic={isPublic} onChange={setIsPublic} />
      <PrimaryButton onClick={onCreate} disabled={submitting || tracks.length === 0}>
        {submitting ? 'Creating…' : 'Create Playlist'}
      </PrimaryButton>
      {created && <CreatedLink result={created} />}
    </ExportCard>
  );
}

function CardByArtist({
  artists,
  tracksByArtist,
  createPlaylist,
}: {
  artists: string[];
  tracksByArtist: Map<string, Track[]>;
  createPlaylist: (
    name: string,
    isPublic: boolean,
    uris: string[],
    description?: string,
  ) => Promise<CreatePlaylistResponse | null>;
}) {
  const toast = useToast();
  const [selected, setSelected] = useState<string>('');
  const [isPublic, setIsPublic] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  /** Progress text used during a "Create all" operation. */
  const [progress, setProgress] = useState<string | null>(null);

  async function onCreateOne() {
    if (!selected) {
      toast.show({ type: 'error', message: 'Pick an artist first.' });
      return;
    }
    const songs = tracksByArtist.get(selected) ?? [];
    if (songs.length === 0) return;
    setSubmitting(true);
    const res = await createPlaylist(
      `Liked — ${selected}`,
      isPublic,
      songs.map((t) => t.uri),
      `${selected} tracks from your Liked Songs`,
    );
    setSubmitting(false);
    if (res) {
      toast.show({
        type: 'success',
        message: `Created "${res.name}" with ${res.trackCount} tracks.`,
      });
    }
  }

  /**
   * Create one playlist per artist sequentially. Sequential is intentional:
   * parallel calls increase the chance of hitting Spotify's rate limit.
   */
  async function onCreateAll() {
    if (
      !confirm(
        `This will create ${artists.length} playlists (one per artist). Continue?`,
      )
    ) {
      return;
    }
    setSubmitting(true);
    let success = 0;
    let failed = 0;
    for (let i = 0; i < artists.length; i++) {
      const artist = artists[i];
      const songs = tracksByArtist.get(artist) ?? [];
      setProgress(`Creating ${i + 1} of ${artists.length}: ${artist}`);
      const res = await createPlaylist(
        `Liked — ${artist}`,
        isPublic,
        songs.map((t) => t.uri),
        `${artist} tracks from your Liked Songs`,
      );
      if (res) success += 1;
      else failed += 1;
    }
    setProgress(null);
    setSubmitting(false);
    toast.show({
      type: failed === 0 ? 'success' : 'info',
      message: `Created ${success} playlist${success === 1 ? '' : 's'}${
        failed > 0 ? `, ${failed} failed` : ''
      }.`,
    });
  }

  return (
    <ExportCard
      title="Split by artist"
      description="One playlist per artist. Pick a single artist or batch-create them all."
      badge={`${artists.length} artists`}
    >
      <select
        value={selected}
        onChange={(e) => setSelected(e.target.value)}
        className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm focus:border-accent focus:outline-none"
      >
        <option value="">Select an artist…</option>
        {artists.map((a) => (
          <option key={a} value={a}>
            {a} ({tracksByArtist.get(a)?.length ?? 0})
          </option>
        ))}
      </select>
      <PublicToggle isPublic={isPublic} onChange={setIsPublic} />
      <div className="flex gap-2">
        <PrimaryButton onClick={onCreateOne} disabled={submitting || !selected}>
          {submitting && !progress ? 'Creating…' : 'Create one'}
        </PrimaryButton>
        <SecondaryButton onClick={onCreateAll} disabled={submitting || artists.length === 0}>
          {progress ?? 'Create all'}
        </SecondaryButton>
      </div>
    </ExportCard>
  );
}

function CardCsv() {
  const toast = useToast();
  const [downloading, setDownloading] = useState(false);

  /**
   * Trigger a CSV download. We fetch as a blob so we can provide a predictable
   * filename and surface errors as toasts instead of navigating away.
   */
  async function onDownload() {
    setDownloading(true);
    try {
      const res = await fetch('/api/spotify/export-csv');
      if (res.status === 401) {
        await signIn('spotify', { callbackUrl: '/dashboard' });
        return;
      }
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as ApiError | null;
        throw new Error(body?.error ?? `Request failed (${res.status})`);
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `liked-songs-${todayStamp()}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.show({ type: 'success', message: 'CSV downloaded.' });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to download CSV';
      toast.show({ type: 'error', message: msg });
    } finally {
      setDownloading(false);
    }
  }

  return (
    <ExportCard
      title="Liked songs as CSV"
      description="Download every liked song as a spreadsheet (Title, Artist, Album, Date, Duration, URL)."
    >
      <PrimaryButton onClick={onDownload} disabled={downloading}>
        {downloading ? 'Preparing…' : 'Download CSV'}
      </PrimaryButton>
    </ExportCard>
  );
}
