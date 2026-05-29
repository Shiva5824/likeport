/**
 * Generic utility helpers used across the app.
 */

/**
 * Split an array into fixed-size chunks. Used to respect Spotify's 100-URI
 * limit when adding tracks to a playlist.
 *
 * @example chunk([1,2,3,4,5], 2) // [[1,2],[3,4],[5]]
 */
export function chunk<T>(arr: T[], size: number): T[][] {
  if (size <= 0) throw new Error('chunk size must be > 0');
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    out.push(arr.slice(i, i + size));
  }
  return out;
}

/**
 * Convert a millisecond duration into "m:ss" form for display.
 */
export function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Today's date as YYYY-MM-DD, used in default playlist names.
 */
export function todayStamp(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = (d.getMonth() + 1).toString().padStart(2, '0');
  const day = d.getDate().toString().padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * CSV-escape a single cell. Quotes any value that contains a comma, quote,
 * newline, or carriage return. Internal quotes are doubled per RFC 4180.
 */
export function csvEscape(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/** Sleep for `ms` milliseconds. Used for Retry-After backoff. */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
