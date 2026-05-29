/**
 * Blog post registry. Each post is rendered server-side from these entries
 * plus a content component that lives next to the slug-specific page route.
 *
 * To add a post:
 *   1. Add an entry to POSTS below.
 *   2. Create app/blog/your-slug/page.tsx that imports `getPost('your-slug')`
 *      and the matching content component.
 */
export interface BlogPostMeta {
  slug: string;
  title: string;
  description: string;
  /** YYYY-MM-DD */
  date: string;
  /** Estimated read time in minutes. */
  readMinutes: number;
  tags: string[];
}

export const POSTS: BlogPostMeta[] = [
  {
    slug: 'share-spotify-playlists-via-csv',
    title: 'Share a Spotify playlist with anyone using a CSV (no migration tool needed)',
    description:
      'Export any playlist as a CSV, send it to a friend, and have them import it into their own Spotify account in two clicks.',
    date: '2026-05-29',
    readMinutes: 5,
    tags: ['guides', 'spotify', 'csv'],
  },
  {
    slug: 'how-to-share-spotify-liked-songs',
    title: 'How to share your Spotify Liked Songs with friends',
    description:
      'Spotify Liked Songs are private by default. Here is how to turn them into a real, shareable playlist in two minutes.',
    date: '2026-05-12',
    readMinutes: 5,
    tags: ['guides', 'spotify'],
  },
  {
    slug: 'how-to-backup-spotify-liked-songs',
    title: 'How to back up your Spotify Liked Songs (so you never lose them)',
    description:
      'Why your Liked Songs are at more risk than you think, and three simple ways to keep a backup of your music taste.',
    date: '2026-05-05',
    readMinutes: 6,
    tags: ['guides', 'backup'],
  },
  {
    slug: 'spotify-liked-songs-vs-playlists',
    title: 'Spotify Liked Songs vs Playlists: which one to use, and when',
    description:
      'They look similar, but they are very different products. Here is how to think about each one and when to switch.',
    date: '2026-04-22',
    readMinutes: 4,
    tags: ['explainers', 'spotify'],
  },
  {
    slug: 'export-spotify-music-collections',
    title: 'How to export Spotify music collections to other services',
    description:
      'Moving from Spotify to Apple Music, Tidal, or YouTube Music? Start by exporting your library properly.',
    date: '2026-04-10',
    readMinutes: 7,
    tags: ['guides', 'migration'],
  },
];

/** Look up a post by slug, returning undefined if missing. */
export function getPost(slug: string): BlogPostMeta | undefined {
  return POSTS.find((p) => p.slug === slug);
}

/** Posts ordered newest-first for index pages. */
export function getPostsSortedByDate(): BlogPostMeta[] {
  return [...POSTS].sort((a, b) => b.date.localeCompare(a.date));
}
