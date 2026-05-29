'use client';

/**
 * Dashboard card: pick any playlist the user can see, preview its tracks,
 * and download it as a CSV.
 *
 * Workflow:
 *   1. On mount, GET /api/spotify/playlists to populate the dropdown.
 *   2. When a playlist is selected, GET /api/spotify/playlists/{id}/tracks
 *      to show a preview of what's inside (so the user can confirm they
 *      picked the right one before downloading).
 *   3. On download, stream /api/spotify/playlists/{id}/csv to a file.
 */
import { useEffect, useState } from 'react';
import { signIn } from 'next-auth/react';
import ExportCard from '@/components/ExportCard';
import SongList from '@/components/SongList';
import { useToast } from '@/components/Toast';
import { PrimaryButton } from './primitives';
import type { ApiError, PlaylistSummary, Track } from '@/types/spotify';
import { todayStamp } from '@/lib/utils';

export default function PlaylistExportCard() {
  const toast = useToast();
  const [playlists, setPlaylists] = useState<PlaylistSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState('');
  const [downloading, setDownloading] = useState(false);

  // Track-preview state. Refetched whenever `selected` changes.
  const [previewTracks, setPreviewTracks] = useState<Track[]>([]);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);

  // Fetch the user's playlists once. Surface auth failures by re-prompting.
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch('/api/spotify/playlists', { cache: 'no-store' });
        if (res.status === 401) {
          await signIn('spotify', { callbackUrl: '/dashboard' });
          return;
        }
        if (!res.ok) {
          const body = (await res.json().catch(() => null)) as ApiError | null;
          throw new Error(body?.error ?? `Request failed (${res.status})`);
        }
        const data = (await res.json()) as { playlists: PlaylistSummary[] };
        if (cancelled) return;
        setPlaylists(data.playlists);
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to load playlists';
        toast.show({ type: 'error', message: msg });
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [toast]);

  // Whenever the chosen playlist changes, fetch its tracks for the preview.
  // Cancelable so rapid switches don't race.
  useEffect(() => {
    if (!selected) {
      setPreviewTracks([]);
      setPreviewError(null);
      return;
    }
    let cancelled = false;
    setPreviewLoading(true);
    setPreviewError(null);
    setPreviewTracks([]);
    (async () => {
      try {
        const res = await fetch(
          `/api/spotify/playlists/${encodeURIComponent(selected)}/tracks`,
          { cache: 'no-store' },
        );
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
        setPreviewTracks(data.tracks);
      } catch (err) {
        if (cancelled) return;
        const msg = err instanceof Error ? err.message : 'Failed to load tracks';
        setPreviewError(msg);
      } finally {
        if (!cancelled) setPreviewLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [selected]);

  async function onDownload() {
    if (!selected) {
      toast.show({ type: 'error', message: 'Pick a playlist first.' });
      return;
    }
    setDownloading(true);
    try {
      const res = await fetch(
        `/api/spotify/playlists/${encodeURIComponent(selected)}/csv`,
      );
      if (res.status === 401) {
        await signIn('spotify', { callbackUrl: '/dashboard' });
        return;
      }
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as ApiError | null;
        throw new Error(body?.error ?? `Request failed (${res.status})`);
      }
      const blob = await res.blob();
      // Derive a friendly filename from the selected playlist name.
      const playlist = playlists.find((p) => p.id === selected);
      const safe = (playlist?.name ?? 'playlist').replace(/[^a-z0-9-_]+/gi, '-');
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${safe}-${todayStamp()}.csv`;
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

  const selectedPlaylist = playlists.find((p) => p.id === selected);

  return (
    <ExportCard
      title="Export any playlist as CSV"
      description="Pick any playlist you own or follow, preview its tracks, and download a CSV."
      badge={loading ? 'Loading…' : `${playlists.length} playlists`}
    >
      <select
        value={selected}
        onChange={(e) => setSelected(e.target.value)}
        disabled={loading || playlists.length === 0}
        className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm focus:border-accent focus:outline-none disabled:opacity-60"
      >
        <option value="">
          {loading ? 'Loading…' : 'Select a playlist…'}
        </option>
        {playlists.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name} ({p.total})
          </option>
        ))}
      </select>

      {/* Track preview area. Mirrors the SongList styling we already use. */}
      {selected && (
        <div className="space-y-2">
          {selectedPlaylist && (
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span>
                Showing {previewTracks.length} of {selectedPlaylist.total} tracks
              </span>
              <a
                href={selectedPlaylist.spotifyUrl}
                target="_blank"
                rel="noreferrer"
                className="text-accent hover:underline"
              >
                Open in Spotify ↗
              </a>
            </div>
          )}
          {previewLoading ? (
            <div className="space-y-1.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-12 skeleton rounded-lg" />
              ))}
            </div>
          ) : previewError ? (
            <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-200">
              {previewError}
            </div>
          ) : previewTracks.length === 0 ? (
            <div className="rounded-lg border border-border bg-bg p-3 text-xs text-zinc-400">
              This playlist has no tracks we can export.
            </div>
          ) : (
            <SongList tracks={previewTracks} height={260} />
          )}
        </div>
      )}

      <PrimaryButton
        onClick={onDownload}
        disabled={downloading || !selected || previewLoading}
      >
        {downloading ? 'Preparing…' : 'Download CSV'}
      </PrimaryButton>
    </ExportCard>
  );
}
