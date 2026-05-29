'use client';

/**
 * Scrollable list of liked tracks.
 *
 * Uses react-window virtualization when there are >500 tracks; otherwise
 * renders a regular list (cheaper for small libraries and simpler markup).
 */
import { FixedSizeList as List, type ListChildComponentProps } from 'react-window';
import type { Track } from '@/types/spotify';
import { formatDuration } from '@/lib/utils';
import { useEffect, useState } from 'react';

const ROW_HEIGHT = 64;
const VIRTUALIZE_THRESHOLD = 500;

interface SongListProps {
  tracks: Track[];
  /** Optional fixed height for the virtualized list. Default 480. */
  height?: number;
}

export default function SongList({ tracks, height = 480 }: SongListProps) {
  if (tracks.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center text-zinc-400">
        <p className="text-base">No songs to show.</p>
        <p className="mt-1 text-sm">
          Like some tracks on Spotify and they will appear here.
        </p>
      </div>
    );
  }

  if (tracks.length > VIRTUALIZE_THRESHOLD) {
    return (
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <List
          height={height}
          itemCount={tracks.length}
          itemSize={ROW_HEIGHT}
          width="100%"
          itemData={tracks}
        >
          {Row}
        </List>
      </div>
    );
  }

  return (
    <div
      className="overflow-y-auto rounded-xl border border-border bg-card"
      style={{ maxHeight: height }}
    >
      {tracks.map((t, i) => (
        <SongRow key={t.id + ':' + i} track={t} />
      ))}
    </div>
  );
}

/**
 * react-window row renderer. Receives style positioning props from the
 * virtualizer; we forward them to the row container.
 */
function Row({ index, style, data }: ListChildComponentProps<Track[]>) {
  const track = data[index];
  return (
    <div style={style}>
      <SongRow track={track} />
    </div>
  );
}

function SongRow({ track }: { track: Track }) {
  return (
    <div className="flex items-center gap-3 border-b border-border px-3 py-2 last:border-b-0">
      <AlbumArt url={track.albumArt} alt={track.album} />
      <div className="min-w-0 flex-1">
        <a
          href={track.spotifyUrl}
          target="_blank"
          rel="noreferrer"
          className="block truncate text-sm font-medium hover:underline"
        >
          {track.name}
        </a>
        <p className="truncate text-xs text-zinc-400">
          {track.artists.join(', ')} <span className="text-zinc-600">•</span>{' '}
          {track.album}
        </p>
      </div>
      <div className="hidden text-xs text-zinc-500 sm:block">
        {formatDuration(track.duration_ms)}
      </div>
    </div>
  );
}

function AlbumArt({ url, alt }: { url: string | null; alt: string }) {
  // Track image load failures so we can fall back to a neutral placeholder.
  const [errored, setErrored] = useState(false);
  // Reset on url change (when scrolling through a virtualized list).
  useEffect(() => setErrored(false), [url]);

  if (!url || errored) {
    return (
      <div
        aria-hidden
        className="grid h-10 w-10 flex-shrink-0 place-items-center rounded bg-zinc-800 text-zinc-500"
      >
        ♪
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt={alt}
      onError={() => setErrored(true)}
      className="h-10 w-10 flex-shrink-0 rounded object-cover"
    />
  );
}
