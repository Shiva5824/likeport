import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import BlogPostLayout from '@/components/BlogPostLayout';
import { getPost } from '@/lib/blog';
import { siteConfig } from '@/lib/site-config';

const SLUG = 'spotify-liked-songs-vs-playlists';
const post = getPost(SLUG);

export const metadata: Metadata = post
  ? { title: `${post.title} — ${siteConfig.name}`, description: post.description }
  : {};

export default function Post() {
  if (!post) notFound();
  return (
    <BlogPostLayout post={post}>
      <h2>The TL;DR</h2>
      <p>
        Liked Songs is your <strong>private library</strong>. A playlist is a
        <strong> curated, ordered list</strong>. They are designed for
        different jobs, even though Spotify renders them similarly.
      </p>

      <h2>What Liked Songs is good at</h2>
      <ul>
        <li>
          <strong>Frictionless saving.</strong> One tap, the song is yours
          forever (or until it leaves the platform). No deciding which
          playlist it belongs in.
        </li>
        <li>
          <strong>Recommendations.</strong> Spotify uses your liked songs
          heavily for Discover Weekly, Daily Mix, and Release Radar. A track
          added to a playlist does not get the same weight.
        </li>
        <li>
          <strong>Bulk listening.</strong> &quot;Shuffle Liked Songs&quot;
          is the closest thing Spotify has to a personalized radio station
          built only from music you actually enjoy.
        </li>
      </ul>

      <h2>What Liked Songs is bad at</h2>
      <ul>
        <li>
          <strong>Sharing.</strong> Liked Songs has no public URL. You can
          tell a friend &quot;these are my liked songs&quot; but you cannot
          send them.
        </li>
        <li>
          <strong>Organization.</strong> It is one giant chronological list.
          There is no way to filter, group, or split it inside Spotify.
        </li>
        <li>
          <strong>Editing.</strong> You can only un-like songs one at a time.
          There is no &quot;remove all songs from artist X&quot; in the UI.
        </li>
      </ul>

      <h2>What playlists are good at</h2>
      <ul>
        <li>
          <strong>Sharing.</strong> Every playlist has a URL. Public
          playlists show up in your profile and are searchable.
        </li>
        <li>
          <strong>Themes.</strong> You can build a playlist around a vibe, a
          decade, an activity, or a genre.
        </li>
        <li>
          <strong>Collaboration.</strong> Playlists can be marked
          collaborative, letting friends add tracks too.
        </li>
        <li>
          <strong>Order.</strong> A playlist has a meaningful sequence. Liked
          Songs is just a timeline.
        </li>
      </ul>

      <h2>When to convert one into the other</h2>
      <p>You should consider exporting Liked Songs into a playlist when:</p>
      <ul>
        <li>You want to share your taste with someone.</li>
        <li>You want a backup that is shareable and shareable.</li>
        <li>
          You are about to switch streaming services and need a portable
          format.
        </li>
        <li>
          You want to split your library by artist, decade, or vibe so it is
          actually navigable.
        </li>
      </ul>
      <p>
        The fastest way to do all of these is with{' '}
        <a href="/">{siteConfig.name}</a>. The dashboard offers four
        different export modes that handle the boring parts (pagination, the
        100-track-per-request API limit, naming) for you.
      </p>

      <h2>Should I delete my likes after exporting?</h2>
      <p>
        No. The two systems live side by side. Exporting a playlist does not
        un-like the songs. Many people keep liking everything and run an
        export occasionally to share or back up. That is the model the
        dashboard is designed around.
      </p>

      <h2>One more nuance: recommendations</h2>
      <p>
        If you are picky about your Spotify recommendations, be aware that
        Liked Songs and playlists feed the algorithm differently. Liking a
        song signals strong personal taste. Adding a track to a public
        themed playlist signals it fits a context. Both matter for Discover
        Weekly, but in different ways. There is no harm in doing both, which
        is why an exported playlist alongside your existing liked library
        gives you the best of both worlds.
      </p>
    </BlogPostLayout>
  );
}
