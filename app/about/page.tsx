import type { Metadata } from 'next';
import PublicLayout from '@/components/PublicLayout';
import Prose from '@/components/Prose';
import { siteConfig } from '@/lib/site-config';

export const metadata: Metadata = {
  title: `About — ${siteConfig.name}`,
  description: `What ${siteConfig.name} is, why it exists, and who it is for.`,
};

export default function AboutPage() {
  return (
    <PublicLayout>
      <Prose>
        <h1>About {siteConfig.name}</h1>
        <p>
          {siteConfig.name} is a free tool that helps Spotify listeners do
          something Spotify itself does not let them do: export their Liked
          Songs into real, shareable playlists, or back them up as a CSV file.
        </p>

        <h2>What it does</h2>
        <p>
          When you tap the heart on a track inside Spotify, it lands in your
          private Liked Songs collection. That collection cannot be shared,
          embedded, or sent to a friend. {siteConfig.name} bridges that gap by
          letting you:
        </p>
        <ul>
          <li>Create one playlist that contains every song you have ever liked.</li>
          <li>Generate a "last 30 days" playlist of your most recent likes.</li>
          <li>Split your liked library into one playlist per artist.</li>
          <li>Download a complete CSV backup of your library.</li>
        </ul>

        <h2>Why it exists</h2>
        <p>
          A lot of people accumulate hundreds or thousands of liked tracks over
          the years. Recommending an artist or genre to a friend is awkward
          when the only thing you can do is screenshot a list. We built
          {' '}{siteConfig.name} because we wanted something simple, fast, and
          private that turned that list into something usable.
        </p>

        <h2>Who it is for</h2>
        <p>
          Anyone with a Spotify account can use it. It is most useful if you:
        </p>
        <ul>
          <li>Have been quietly hoarding Liked Songs for years.</li>
          <li>Want to send a friend exactly the kind of music you are into right now.</li>
          <li>Want a backup of your taste history before you switch services.</li>
          <li>Like to organize your library by artist rather than one giant list.</li>
        </ul>

        <h2>How we handle your data</h2>
        <p>
          {siteConfig.name} does not store your music or any personal data on a
          server. We use Spotify&apos;s official OAuth flow to read your liked
          tracks, then write the playlists you ask for back to your Spotify
          account. We do not run any background sync, we do not retain your
          liked songs after you close the tab, and we do not sell or share your
          listening history.
        </p>
        <p>
          For the full details, see our{' '}
          <a href="/privacy">privacy policy</a>.
        </p>

        <h2>Built by</h2>
        <p>{siteConfig.owner.name}.</p>
      </Prose>
    </PublicLayout>
  );
}
