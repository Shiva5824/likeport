'use client';

/**
 * Dashboard card: pick any playlist the user can see and download it as a CSV.
 *
 * Fetches /api/spotify/playlists once on mount, then streams the chosen
 * playlist's CSV through /api/spotify/playlists/{id}/csv.
 */
import { useEffect, useState } from 'react';
import { signIn } from 'next-auth/react';
import ExportCard from '@/components/ExportCard';
import { useToast } from '@/components/Toast';
import { PrimaryButton } from './primitives';
import type { ApiError, PlaylistSummary } from '@/types/spotify';
import { todayStamp } from '@/lib/utils';

export default function PlaylistExportCard() {
  const toast = useToast();
  const [playlists, setPlaylists] = useState<PlaylistSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState('');
  const [downloading, setDownloading] = useState(false);

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

  return (
    <ExportCard
      title="Export any playlist as CSV"
      description="Pick any playlist you own or follow and download it as a spreadsheet."
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
      <PrimaryButton
        onClick={onDownload}
        disabled={downloading || !selected}
      >
        {downloading ? 'Preparing…' : 'Download CSV'}
      </PrimaryButton>
    </ExportCard>
  );
}
