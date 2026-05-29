import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import BlogPostLayout from '@/components/BlogPostLayout';
import { getPost } from '@/lib/blog';
import { siteConfig } from '@/lib/site-config';

const SLUG = 'export-spotify-music-collections';
const post = getPost(SLUG);

export const metadata: Metadata = post
  ? { title: `${post.title} — ${siteConfig.name}`, description: post.description }
  : {};

export default function Post() {
  if (!post) notFound();
  return (
    <BlogPostLayout post={post}>
      <h2>Why migrations fail</h2>
      <p>
        If you have ever tried to move from Spotify to another service, you
        already know the playlist migration tools out there are imperfect.
        Some songs are missing. Some are matched to weird remixes or live
        versions. Some imports just stop halfway through with no
        explanation. The single biggest cause of this is a poor source
        export.
      </p>
      <p>
        Migration tools work best when you give them clean, well-organized,
        reasonably-sized playlists with rich metadata. That is what this
        post is about.
      </p>

      <h2>Step 1: Export to a portable format first</h2>
      <p>
        Before you touch any third-party migration tool, get your library
        out of Spotify in two formats:
      </p>
      <ul>
        <li>
          <strong>A CSV.</strong> Plain text, future-proof, opens anywhere.
          Use the <strong>Download CSV</strong> button on the{' '}
          <a href="/">{siteConfig.name}</a> dashboard.
        </li>
        <li>
          <strong>A real Spotify playlist (or several).</strong> Most
          migration tools require a playlist URL or playlist id as input,
          not raw CSV. Use the <strong>Export all liked songs</strong> card,
          or — better — the <strong>Split by artist</strong> card.
        </li>
      </ul>
      <p>
        Why both? The CSV is your archival format that works in 10 years
        regardless of which services exist. The playlist(s) are what you
        feed into the migration tool today.
      </p>

      <h2>Step 2: Split the library</h2>
      <p>
        Migration tools typically search the destination service track by
        track. If you import a single 3,000-song playlist, a few hundred
        misses will get buried and you will not notice. If you import 200
        smaller, artist-scoped playlists, mismatches stand out immediately
        and you can fix them by hand.
      </p>
      <p>
        On the dashboard, click <strong>Create all</strong> on the
        &quot;Split by artist&quot; card. This produces one Spotify playlist
        per artist that appears in your Liked Songs, with each playlist
        named <code>Liked — Artist Name</code>. They are private by default
        so they don&apos;t clutter your profile.
      </p>

      <h2>Step 3: Pick a migration tool</h2>
      <p>
        We are not affiliated with any of these, but the most reliable ones
        as of 2026 are TuneMyMusic, Soundiiz, and FreeYourMusic. Each has
        free quotas and paid tiers depending on how many tracks you want
        to move.
      </p>
      <p>
        Whichever you pick, the workflow is the same:
      </p>
      <ol>
        <li>Connect your Spotify account.</li>
        <li>Connect the destination service (Apple Music, Tidal, YouTube Music).</li>
        <li>Select the playlists to migrate.</li>
        <li>Let it run.</li>
        <li>Cross-reference against your CSV to find anything that did not migrate.</li>
      </ol>

      <h2>Step 4: Audit with the CSV</h2>
      <p>
        Open your CSV in Google Sheets. After the migration finishes, the
        third-party tool will give you a list of failed tracks. Cross-check
        them against your CSV — sometimes the failure is just a name
        mismatch (&quot;feat.&quot; vs &quot;featuring&quot;) and you can
        find the correct version manually on the destination service.
      </p>

      <h2>Step 5: Don&apos;t delete your Spotify likes</h2>
      <p>
        Even if you fully move to a different service, keep your Spotify
        Liked Songs intact for at least a few months. You will inevitably
        find tracks that did not migrate, and going back to the source is
        easier than trying to remember a song from a half-formed memory.
      </p>

      <h2>Bonus: archival-grade backup</h2>
      <p>
        If you want a true forever-archive, combine the CSV with a folder
        of YouTube links or, where legally available, downloads from
        services like Bandcamp for the artists you love most. The CSV
        gives you the index; the per-artist Spotify playlists give you a
        navigable copy; and your most important music has its own
        independent backup.
      </p>

      <h2>Privacy and consent</h2>
      <p>
        Both <a href="/">{siteConfig.name}</a> and any third-party
        migration tool will ask for OAuth permissions on Spotify. Always
        review what they request. {siteConfig.name} only asks to read your
        liked songs and modify playlists you own — never to read or change
        anyone else&apos;s. See the <a href="/privacy">privacy policy</a>{' '}
        for the full breakdown.
      </p>
    </BlogPostLayout>
  );
}
