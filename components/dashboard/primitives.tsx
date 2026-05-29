'use client';

/**
 * Shared dashboard UI primitives. Extracted so dashboard cards (split
 * across multiple files now) can share a consistent look without
 * duplicating Tailwind classes.
 */
import type { CreatePlaylistResponse } from '@/types/spotify';

export function PrimaryButton({
  children,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...rest}
      className="inline-flex items-center justify-center rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-black transition hover:bg-accentHover disabled:cursor-not-allowed disabled:opacity-60"
    >
      {children}
    </button>
  );
}

export function SecondaryButton({
  children,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...rest}
      className="inline-flex items-center justify-center rounded-lg border border-border bg-bg px-4 py-2 text-sm font-semibold text-zinc-200 transition hover:border-zinc-700 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {children}
    </button>
  );
}

export function PublicToggle({
  isPublic,
  onChange,
}: {
  isPublic: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between rounded-lg border border-border bg-bg px-3 py-2 text-sm">
      <span>{isPublic ? 'Public playlist' : 'Private playlist'}</span>
      <span
        className={`relative inline-block h-5 w-9 rounded-full transition ${
          isPublic ? 'bg-accent' : 'bg-zinc-700'
        }`}
        aria-hidden
      >
        <span
          className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white transition ${
            isPublic ? 'translate-x-4' : ''
          }`}
        />
      </span>
      <input
        type="checkbox"
        className="sr-only"
        checked={isPublic}
        onChange={(e) => onChange(e.target.checked)}
      />
    </label>
  );
}

export function CreatedLink({ result }: { result: CreatePlaylistResponse }) {
  return (
    <a
      href={result.url}
      target="_blank"
      rel="noreferrer"
      className="block truncate rounded-lg border border-accent/40 bg-accent/10 px-3 py-2 text-sm text-accent hover:bg-accent/20"
    >
      Open “{result.name}” in Spotify ↗
    </a>
  );
}
