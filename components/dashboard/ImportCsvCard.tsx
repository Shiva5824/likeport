'use client';

/**
 * Dashboard card: upload a CSV and turn it into a new Spotify playlist.
 *
 * Workflow:
 *   1. User picks a .csv file (or drags it in).
 *   2. We read it client-side and POST to /api/spotify/import-csv.
 *   3. Server resolves each row to a Spotify track URI (URL parse first,
 *      search fallback) and creates the playlist.
 *   4. We show a summary of matched/missed rows + the new playlist link.
 */
import { useRef, useState } from 'react';
import { signIn } from 'next-auth/react';
import ExportCard from '@/components/ExportCard';
import { useToast } from '@/components/Toast';
import { PrimaryButton, PublicToggle } from './primitives';
import type { ApiError, ImportCsvResponse } from '@/types/spotify';
import { todayStamp } from '@/lib/utils';

export default function ImportCsvCard() {
  const toast = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState(`Imported playlist — ${todayStamp()}`);
  const [isPublic, setIsPublic] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<ImportCsvResponse | null>(null);
  const [dragOver, setDragOver] = useState(false);

  function pickFile(f: File | null) {
    if (!f) {
      setFile(null);
      return;
    }
    if (
      !f.name.toLowerCase().endsWith('.csv') &&
      f.type !== 'text/csv' &&
      f.type !== 'application/vnd.ms-excel'
    ) {
      toast.show({ type: 'error', message: 'Please pick a .csv file.' });
      return;
    }
    setFile(f);
  }

  async function onImport() {
    if (!file) {
      toast.show({ type: 'error', message: 'Pick a CSV file first.' });
      return;
    }
    if (!name.trim()) {
      toast.show({ type: 'error', message: 'Give the playlist a name.' });
      return;
    }
    setSubmitting(true);
    setResult(null);
    try {
      const csv = await file.text();
      const res = await fetch('/api/spotify/import-csv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          isPublic,
          csv,
          description: `Imported from ${file.name} via LikePort`,
        }),
      });
      if (res.status === 401) {
        await signIn('spotify', { callbackUrl: '/dashboard' });
        return;
      }
      const body = (await res.json()) as ImportCsvResponse | ApiError;
      if (!res.ok) {
        throw new Error(
          ('error' in body && body.error) || `Request failed (${res.status})`,
        );
      }
      const ok = body as ImportCsvResponse;
      setResult(ok);
      toast.show({
        type: 'success',
        message: `Imported ${ok.matched} of ${ok.matched + ok.missed} tracks.`,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Import failed';
      toast.show({ type: 'error', message: msg });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ExportCard
      title="Import a CSV as a playlist"
      description="Upload a CSV (Title, Artist, Album, Spotify URL). We will match each row to a Spotify track and build a new playlist for you."
      badge={file ? file.name : '.csv'}
    >
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          pickFile(e.dataTransfer.files?.[0] ?? null);
        }}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-3 py-6 text-center text-sm transition ${
          dragOver
            ? 'border-accent bg-accent/5 text-accent'
            : 'border-border bg-bg text-zinc-400 hover:border-zinc-700'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={(e) => pickFile(e.target.files?.[0] ?? null)}
        />
        {file ? (
          <>
            <span className="font-medium text-zinc-200">{file.name}</span>
            <span className="mt-1 text-xs">
              {(file.size / 1024).toFixed(1)} KB — click to choose another
            </span>
          </>
        ) : (
          <>
            <span>Drop a CSV here, or click to browse</span>
            <span className="mt-1 text-xs">
              Headers detected: Title, Artist, Album, Spotify URL
            </span>
          </>
        )}
      </div>

      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="New playlist name"
        className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm focus:border-accent focus:outline-none"
      />
      <PublicToggle isPublic={isPublic} onChange={setIsPublic} />
      <PrimaryButton onClick={onImport} disabled={submitting || !file}>
        {submitting ? 'Importing… (this can take a minute)' : 'Create playlist from CSV'}
      </PrimaryButton>

      {result && <ImportSummary result={result} />}
    </ExportCard>
  );
}

function ImportSummary({ result }: { result: ImportCsvResponse }) {
  const missed = result.results.filter((r) => !r.uri);
  const total = result.results.length;
  return (
    <div className="space-y-2">
      <a
        href={result.playlist.url}
        target="_blank"
        rel="noreferrer"
        className="block truncate rounded-lg border border-accent/40 bg-accent/10 px-3 py-2 text-sm text-accent hover:bg-accent/20"
      >
        Open “{result.playlist.name}” in Spotify ↗
      </a>
      <p className="text-xs text-zinc-400">
        Matched <span className="text-zinc-200">{result.matched}</span> of{' '}
        {total} rows. {result.missed > 0 ? `${result.missed} could not be matched.` : ''}
      </p>
      {missed.length > 0 && (
        <details className="rounded-lg border border-border bg-bg px-3 py-2 text-xs text-zinc-400">
          <summary className="cursor-pointer text-zinc-300">
            Show {missed.length} unmatched row{missed.length === 1 ? '' : 's'}
          </summary>
          <ul className="mt-2 max-h-40 space-y-1 overflow-y-auto">
            {missed.slice(0, 100).map((r) => (
              <li key={r.rowIndex} className="truncate">
                Row {r.rowIndex}: {r.title || '(no title)'}
                {r.artist ? ` — ${r.artist}` : ''}
                {r.note ? ` (${r.note})` : ''}
              </li>
            ))}
            {missed.length > 100 && (
              <li className="text-zinc-500">
                …and {missed.length - 100} more
              </li>
            )}
          </ul>
        </details>
      )}
    </div>
  );
}
