import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import BlogPostLayout from '@/components/BlogPostLayout';
import { getPost } from '@/lib/blog';
import { siteConfig } from '@/lib/site-config';

const SLUG = 'share-spotify-playlists-via-csv';
const post = getPost(SLUG);

export const metadata: Metadata = post
  ? { title: `${post.title} — ${siteConfig.name}`, description: post.description }
  : {};

export default function Post() {
  if (!post) notFound();
  return (
    <BlogPostLayout post={post}>
      <h2>The idea in one sentence</h2>
      <p>
        Export the playlist as a CSV from one Spotify account, send the file
        to someone, and have them upload it into their own account to recreate
        the same playlist. No migration tool, no shared logins, no
        collaborative-playlist invites.
      </p>

      <h2>Why this is useful</h2>
      <p>
        Spotify has a built-in &quot;share playlist&quot; feature, but it only
        works inside Spotify. The receiving person can play the playlist or
        save it to their library, but they cannot edit it, can&apos;t take it
        with them if they switch services, and can&apos;t merge it with their
        own playlists. CSVs are different:
      </p>
      <ul>
        <li>
          <strong>Portable.</strong> A CSV opens in any spreadsheet app and
          works in 10 years.
        </li>
        <li>
          <strong>Editable.</strong> The recipient can drop tracks they
          don&apos;t want, add comments, or merge multiple CSVs before
          importing.
        </li>
        <li>
          <strong>Auditable.</strong> They see the entire track list before
          they create anything.
        </li>
        <li>
          <strong>Cross-account.</strong> The CSV doesn&apos;t care whose
          account created it. Anyone with a Spotify account can import it.
        </li>
      </ul>

      <h2>Step 1 — Export the CSV (sender)</h2>
      <ol>
        <li>
          Sign in to <a href="/">{siteConfig.name}</a> with the account that
          owns the playlist you want to share.
        </li>
        <li>
          On the dashboard, scroll to the <strong>Playlist tools</strong>{' '}
          section.
        </li>
        <li>
          On the <strong>Export any playlist as CSV</strong> card, pick the
          playlist from the dropdown.
        </li>
        <li>
          Click <strong>Download CSV</strong>. The file is named after the
          playlist plus the current date.
        </li>
      </ol>
      <p>
        That&apos;s the file you&apos;re going to send. It contains six
        columns: Title, Artist, Album, Date Added, Duration, and Spotify URL.
        The Spotify URL column is the magic part — it makes the import
        bulletproof, because the receiving side can match each row to an
        exact track instead of guessing.
      </p>

      <h2>Step 2 — Share the file</h2>
      <p>Use whatever channel you already use:</p>
      <ul>
        <li>Email or message attachment.</li>
        <li>Cloud drive (Google Drive, iCloud, Dropbox) link.</li>
        <li>Discord or Telegram file upload.</li>
        <li>WhatsApp document share.</li>
      </ul>
      <p>
        The CSV is small — usually a few hundred KB even for thousand-track
        playlists — so any of these work.
      </p>

      <h2>Step 3 — Import into the other account (recipient)</h2>
      <ol>
        <li>
          Open <a href="/">{siteConfig.name}</a> and sign in with{' '}
          <strong>your own</strong> Spotify account. The CSV doesn&apos;t
          care whose account exported it.
        </li>
        <li>
          On the dashboard, find the <strong>Import a CSV as a playlist</strong>{' '}
          card.
        </li>
        <li>
          Drop the CSV file into the upload zone (or click to browse).
        </li>
        <li>
          Pick a name for the new playlist and choose public or private.
        </li>
        <li>
          Click <strong>Create playlist from CSV</strong>. We resolve every
          row to a Spotify track and create the playlist for you.
        </li>
      </ol>
      <p>
        Once it&apos;s done, you&apos;ll see a summary like &quot;Matched 187
        of 192 rows&quot; and a button to open the new playlist in Spotify.
        If anything didn&apos;t match, the unmatched rows are listed
        underneath so you know what to add manually.
      </p>

      <h2>How the matching actually works</h2>
      <p>
        For each row in the CSV, the server tries two strategies:
      </p>
      <ol>
        <li>
          <strong>Spotify URL match (preferred).</strong> If the row has a
          Spotify track URL or URI, we parse the track id and pull the track
          directly. This is exact — no guessing — so a CSV exported from
          Spotify and re-imported into Spotify is essentially lossless.
        </li>
        <li>
          <strong>Search fallback.</strong> If there&apos;s no URL but there
          is a title (and ideally an artist), we use Spotify&apos;s structured
          search to find the closest matching track. Most rows match on the
          first try.
        </li>
      </ol>
      <p>
        If both strategies miss, the row is reported in the &quot;unmatched&quot;
        section of the result so you can fix the CSV and re-upload, or add
        the track manually.
      </p>

      <h2>Tips for a clean transfer</h2>
      <ul>
        <li>
          <strong>Don&apos;t edit the headers.</strong> The columns
          {' '}<code>Title</code>, <code>Artist</code>, <code>Album</code>, and{' '}
          <code>Spotify URL</code> are detected by name, with reasonable
          variations like <code>Name</code> or <code>Track</code> also
          accepted. Renaming them to something exotic will break the
          matching.
        </li>
        <li>
          <strong>Keep the URL column.</strong> Even if you&apos;re editing
          the CSV by hand to remove or rename rows, leave the Spotify URL
          column intact. It&apos;s the most reliable way for the importer
          to find an exact track.
        </li>
        <li>
          <strong>Big libraries take a moment.</strong> The importer
          processes up to 1,000 rows per upload, with eight Spotify lookups
          in flight at once. A 500-track CSV usually takes 15–30 seconds.
        </li>
      </ul>

      <h2>Use cases</h2>
      <ul>
        <li>
          <strong>Sharing a friend&apos;s favorite playlist.</strong> They
          export, you import, you both have it.
        </li>
        <li>
          <strong>Moving from a family member&apos;s account to your own.</strong>
          {' '}When you finally get off the family plan, take the playlists with
          you.
        </li>
        <li>
          <strong>Migrating between two of your own accounts.</strong> Maybe
          you have separate work and personal accounts; CSV is the bridge.
        </li>
        <li>
          <strong>Backing up to a friend.</strong> Send a friend the CSV as
          a redundant backup. Worst case, they import it back to you later.
        </li>
        <li>
          <strong>Combining playlists.</strong> Concatenate two or three
          CSVs in a spreadsheet, dedupe by Spotify URL, and import the
          combined file.
        </li>
      </ul>

      <h2>Privacy</h2>
      <p>
        Both ends of this workflow keep your data on your own machine + your
        own Spotify account. {siteConfig.name} reads the playlist via OAuth,
        streams the CSV directly to your browser, and forgets it. The
        importer reads the CSV you upload, creates the playlist, and forgets
        it too. No database, no analytics on your music, nothing stored on
        a server. See our <a href="/privacy">privacy policy</a> for the
        full breakdown.
      </p>
    </BlogPostLayout>
  );
}
