import type { Metadata } from 'next';
import PublicLayout from '@/components/PublicLayout';
import Prose from '@/components/Prose';
import { siteConfig } from '@/lib/site-config';

export const metadata: Metadata = {
  title: `FAQ — ${siteConfig.name}`,
  description: `Frequently asked questions about exporting Spotify Liked Songs with ${siteConfig.name}.`,
};

const FAQ: { q: string; a: string }[] = [
  {
    q: 'Can Spotify see my password?',
    a: 'No. We use Spotify\u2019s official OAuth flow, which means you log in directly on accounts.spotify.com. We never see, request, or handle your password.',
  },
  {
    q: 'How do I export liked songs?',
    a: 'Click "Login with Spotify" on the home page, approve the requested permissions, and the dashboard will load every track you have liked. From there you can create a playlist or download a CSV in one click.',
  },
  {
    q: 'Will my new playlist stay updated when I like new songs?',
    a: 'Not yet. Each export is a snapshot of your liked songs at the moment you click the button. To pick up new likes, run the export again. Auto-sync is on our roadmap but it requires us to keep a server-side schedule which is not currently part of the project.',
  },
  {
    q: 'Can I delete my data?',
    a: 'There is nothing to delete. We do not run a database, so your liked songs and personal information never leave your browser session and Spotify\u2019s servers. To revoke our app\u2019s access entirely, visit https://www.spotify.com/account/apps and click "Remove access" next to LikePort.',
  },
  {
    q: 'Is the playlist I create public or private?',
    a: 'You choose. Each export card has a toggle for public vs private. Private playlists are still visible to you in your Spotify library but are not shareable by URL.',
  },
  {
    q: 'How big a library can it handle?',
    a: 'We have tested it with libraries of several thousand tracks. Spotify\u2019s API rate limits and the number of items it returns per request mean very large libraries take a bit longer to load, but the dashboard will keep working in the background and show progress.',
  },
  {
    q: 'Why does it ask for "modify playlists" permission?',
    a: 'Because creating a new playlist on your behalf requires that permission. We never modify or delete any of your existing playlists \u2014 we only create new ones based on what you ask for.',
  },
  {
    q: 'Why "split by artist"?',
    a: 'A lot of people end up with thousands of liked songs across hundreds of artists. Splitting by artist gives you a cleaner library, makes it easier to share specific artists with friends, and is a great archival format if you decide to switch services later.',
  },
  {
    q: 'Does the CSV file include album art?',
    a: 'No. CSV is a plain text format \u2014 it contains the track title, artist, album, date added, duration, and a Spotify URL. If you open it in a spreadsheet app, the URL is clickable.',
  },
  {
    q: 'Does this work on mobile?',
    a: 'Yes. The site is responsive and the OAuth flow works in any modern mobile browser. The Spotify mobile app is not required.',
  },
  {
    q: 'Why are some of my liked tracks missing?',
    a: 'Spotify occasionally marks tracks as unavailable in your region. The API still returns them but they are not playable, and we silently skip those entries to avoid creating broken playlist items.',
  },
  {
    q: 'How can I report a bug?',
    a: `Use the contact page at /contact \u2014 you can email us directly or reach out via any of the social channels listed there.`,
  },
];

export default function FaqPage() {
  return (
    <PublicLayout>
      <Prose>
        <h1>Frequently asked questions</h1>
        <p>
          Everything you might want to know before connecting your Spotify
          account to {siteConfig.name}. If your question is not here,
          <a href="/contact"> get in touch</a>.
        </p>
        {FAQ.map((item) => (
          <section key={item.q}>
            <h2>{item.q}</h2>
            <p>{item.a}</p>
          </section>
        ))}
      </Prose>
    </PublicLayout>
  );
}
