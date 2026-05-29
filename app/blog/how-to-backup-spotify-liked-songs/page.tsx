import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import BlogPostLayout from '@/components/BlogPostLayout';
import { getPost } from '@/lib/blog';
import { siteConfig } from '@/lib/site-config';

const SLUG = 'how-to-backup-spotify-liked-songs';
const post = getPost(SLUG);

export const metadata: Metadata = post
  ? { title: `${post.title} — ${siteConfig.name}`, description: post.description }
  : {};

export default function Post() {
  if (!post) notFound();
  return (
    <BlogPostLayout post={post}>
      <h2>Why this matters</h2>
      <p>
        Most people treat Spotify like it is permanent. You like a song, it
        sits in your library forever, the end. In reality, your music
        collection is one of the most fragile things in your digital life:
      </p>
      <ul>
        <li>
          Tracks regularly disappear from streaming services because of
          licensing disputes between labels and platforms.
        </li>
        <li>
          Albums get pulled in specific regions without warning.
        </li>
        <li>
          Account issues, password resets, and family-plan changes can make
          your library temporarily unavailable.
        </li>
        <li>
          If you ever switch services, you start from zero unless you
          exported first.
        </li>
      </ul>
      <p>
        A backup is cheap insurance. It takes about two minutes and it gives
        you a record of your taste at a specific point in time.
      </p>

      <h2>Three ways to back up Liked Songs</h2>

      <h3>1. CSV file (most portable)</h3>
      <p>
        A CSV is a plain spreadsheet — works in Excel, Google Sheets, Numbers,
        and any text editor. It is the most resilient format because it does
        not depend on any specific service to be readable in 10 years.
      </p>
      <p>
        With <a href="/">{siteConfig.name}</a>, click the <strong>Download
        CSV</strong> card on the dashboard. You get a file with one row per
        liked track, including title, artist, album, the date you liked it,
        the duration, and the original Spotify URL.
      </p>

      <h3>2. A Spotify playlist (most convenient)</h3>
      <p>
        Creating a normal Spotify playlist that mirrors your Liked Songs is
        the easiest day-to-day backup. It is shareable, it stays inside the
        Spotify app, and you can import it into other services later via
        third-party migration tools.
      </p>
      <p>
        Use the &quot;Export all liked songs&quot; card on the dashboard.
        Set it to private if you only want it for yourself.
      </p>

      <h3>3. One playlist per artist (most useful for migration)</h3>
      <p>
        If you ever switch streaming services, importing a single 3,000-track
        playlist is a recipe for missing or mismatched songs. Migration
        tools work much better when you import smaller, artist-scoped
        playlists. The &quot;Split by artist&quot; card on the dashboard
        produces exactly that, automatically.
      </p>

      <h2>How often should I back up?</h2>
      <p>
        Once a quarter is plenty for most people. Heavy users — the kind who
        like 50 new tracks a week — might do it monthly. There is no harm in
        running an export more often, since each one is just a snapshot
        named with the date.
      </p>

      <h2>Where to keep the CSV</h2>
      <ul>
        <li>
          <strong>Cloud storage.</strong> Drop it in iCloud Drive, Google
          Drive, or Dropbox. The file is small (a few MB at most for very
          large libraries).
        </li>
        <li>
          <strong>A personal git repo.</strong> If you are a developer, this
          is a fun way to version-control your taste over time.
        </li>
        <li>
          <strong>A note-taking app.</strong> Apps like Obsidian or Notion can
          store CSVs as attachments alongside your other notes.
        </li>
      </ul>

      <h2>What is in the CSV?</h2>
      <p>
        The columns are <code>Title</code>, <code>Artist</code>,{' '}
        <code>Album</code>, <code>Date Added</code>, <code>Duration</code>,
        and <code>Spotify URL</code>. The date format is ISO 8601
        (e.g. <code>2026-04-12T08:14:23Z</code>) so it sorts correctly when
        you open it in a spreadsheet.
      </p>

      <h2>Privacy</h2>
      <p>
        The export runs on demand: we read your liked songs from Spotify when
        you click the button, generate the CSV server-side, and stream it to
        your browser. We do not keep a copy. If you want to fully revoke
        access afterwards, head to{' '}
        <a
          href="https://www.spotify.com/account/apps/"
          target="_blank"
          rel="noreferrer"
        >
          spotify.com/account/apps
        </a>
        .
      </p>
    </BlogPostLayout>
  );
}
