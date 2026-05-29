import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import BlogPostLayout from '@/components/BlogPostLayout';
import { getPost } from '@/lib/blog';
import { siteConfig } from '@/lib/site-config';

const SLUG = 'how-to-share-spotify-liked-songs';
const post = getPost(SLUG);

export const metadata: Metadata = post
  ? { title: `${post.title} — ${siteConfig.name}`, description: post.description }
  : {};

export default function Post() {
  if (!post) notFound();
  return (
    <BlogPostLayout post={post}>
      <h2>The short answer</h2>
      <p>
        Spotify treats your Liked Songs as a private list, not a playlist.
        That is why you cannot share it directly: there is no URL to copy,
        no &quot;Share&quot; menu, and friends cannot see it from your
        profile. To make it shareable, you have to convert it into a real
        playlist first.
      </p>

      <h2>Why Liked Songs are not shareable</h2>
      <p>
        Inside Spotify, &quot;Liked Songs&quot; is a tag stored against
        individual tracks. It is not a playlist object in the way the rest of
        your library is. The Spotify mobile and desktop apps render it as if
        it were a playlist — same big colorful tile, same play button — but
        when you open the share sheet, the option is missing.
      </p>
      <p>
        That is by design. Spotify positions Liked Songs as your personal
        library, not as content meant for distribution. The result is that
        anyone who wants to share their full library has to copy each track
        into a regular playlist by hand, which is tedious if you have
        thousands of likes.
      </p>

      <h2>The two-minute method</h2>
      <ol>
        <li>
          Sign in to <a href="/">{siteConfig.name}</a> with your Spotify
          account. Approve the requested permissions on Spotify&apos;s consent
          screen.
        </li>
        <li>
          The dashboard loads every track you have ever liked, in order. You
          will see the total count at the top.
        </li>
        <li>
          On the &quot;Export all liked songs&quot; card, give the new playlist
          a name (we default to <code>My Liked Songs — yyyy-mm-dd</code>).
        </li>
        <li>
          Toggle public if you want a shareable link, or leave it private if
          this is just for you.
        </li>
        <li>Click <strong>Create Playlist</strong>. Done.</li>
      </ol>
      <p>
        The playlist appears in your Spotify library immediately, with a
        normal Spotify URL you can paste anywhere. We split the tracks into
        100-song batches behind the scenes to respect Spotify&apos;s API
        limits, so even libraries with thousands of likes work without manual
        intervention.
      </p>

      <h2>Tips for sharing</h2>
      <ul>
        <li>
          <strong>Use a date in the name.</strong> &quot;My Liked Songs — May
          2026&quot; is more useful than just &quot;Likes&quot;. You can run
          the export multiple times and have a snapshot history.
        </li>
        <li>
          <strong>Make it collaborative.</strong> Once the playlist exists in
          your Spotify account, you can right-click → &quot;Collaborative
          Playlist&quot; in the desktop app to let friends add tracks.
        </li>
        <li>
          <strong>Split by artist instead.</strong> If your liked library is
          huge, sharing one giant 3,000-track playlist is overwhelming. The
          dashboard&apos;s &quot;Split by artist&quot; card creates one
          playlist per artist, which is much easier for someone to skim.
        </li>
      </ul>

      <h2>What about new likes after the export?</h2>
      <p>
        Each export is a snapshot. New songs you like after clicking
        &quot;Create Playlist&quot; are not added automatically — you would
        rerun the export to pick them up. Auto-sync is on the roadmap but it
        requires us to keep your tokens server-side, which we are not doing
        right now to keep the project stateless and private.
      </p>

      <h2>Privacy</h2>
      <p>
        {siteConfig.name} reads your liked songs through Spotify&apos;s
        official OAuth flow and writes the playlists you ask for back to your
        account. Nothing is stored on a database. You can revoke our access
        any time from{' '}
        <a
          href="https://www.spotify.com/account/apps/"
          target="_blank"
          rel="noreferrer"
        >
          spotify.com/account/apps
        </a>
        . See our <a href="/privacy">privacy policy</a> for the full details.
      </p>
    </BlogPostLayout>
  );
}
