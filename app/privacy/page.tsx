import type { Metadata } from 'next';
import PublicLayout from '@/components/PublicLayout';
import Prose from '@/components/Prose';
import { siteConfig } from '@/lib/site-config';

export const metadata: Metadata = {
  title: `Privacy Policy — ${siteConfig.name}`,
  description: `How ${siteConfig.name} handles your Spotify data, cookies, and personal information.`,
};

export default function PrivacyPage() {
  return (
    <PublicLayout>
      <Prose>
        <h1>Privacy Policy</h1>
        <p>
          <em>Last updated: {siteConfig.legalUpdated}</em>
        </p>
        <p>
          {siteConfig.name} (&quot;we,&quot; &quot;us,&quot; or &quot;the
          service&quot;) is operated by {siteConfig.owner.name}. This page
          explains what data we receive, how we use it, and the choices you
          have. If anything is unclear, email us at{' '}
          <a href={`mailto:${siteConfig.contact.email}`}>
            {siteConfig.contact.email}
          </a>
          .
        </p>

        <h2>Data we collect</h2>
        <p>
          {siteConfig.name} is intentionally stateless. We do not run a
          database. Specifically, we collect or process the following:
        </p>
        <ul>
          <li>
            <strong>Spotify OAuth tokens.</strong> When you log in, Spotify
            issues an access token and a refresh token. We store these
            client-side inside an encrypted, HTTP-only session cookie. They
            never reach a database or analytics endpoint.
          </li>
          <li>
            <strong>Spotify profile data.</strong> Your display name, profile
            picture, and email address are read from Spotify so we can show
            them in the app. They are kept only for the duration of your
            session.
          </li>
          <li>
            <strong>Your liked tracks.</strong> When you open the dashboard, we
            ask Spotify for your liked songs. The list lives only in your
            browser memory while you use the app. We do not persist it.
          </li>
          <li>
            <strong>Cookies.</strong> See the dedicated{' '}
            <a href="/cookies">cookie policy</a> for the full list.
          </li>
        </ul>

        <h2>What we do with that data</h2>
        <ul>
          <li>Show you your liked songs.</li>
          <li>Create new playlists in your Spotify account when you ask.</li>
          <li>Generate a CSV file of your tracks when you ask.</li>
        </ul>
        <p>
          That is the entire list. We do not sell your data, we do not share it
          with marketing partners, and we do not feed it into recommendation
          engines. We do not even keep it after your session expires.
        </p>

        <h2>Spotify OAuth scopes</h2>
        <p>
          To deliver the features above we ask Spotify for these permissions:
        </p>
        <ul>
          <li>
            <code>user-library-read</code> — to read your saved (liked) tracks.
          </li>
          <li>
            <code>playlist-modify-public</code> — to create public playlists if
            you opt in to that toggle.
          </li>
          <li>
            <code>playlist-modify-private</code> — to create private playlists.
          </li>
          <li>
            <code>user-read-private</code> — to identify your Spotify user id
            (required to create a playlist on your account).
          </li>
          <li>
            <code>user-read-email</code> — to display your email in the
            account menu.
          </li>
        </ul>
        <p>
          You can revoke these at any time from{' '}
          <a
            href="https://www.spotify.com/account/apps/"
            target="_blank"
            rel="noreferrer"
          >
            spotify.com/account/apps
          </a>
          .
        </p>

        <h2>Analytics and advertising</h2>
        <p>
          We may use lightweight, privacy-respecting analytics (such as Vercel
          Analytics or Plausible) to count anonymous page views. We do not
          fingerprint visitors. If we ever introduce advertising (for example,
          via Google AdSense), this section will be updated to disclose the
          third-party advertising partners and their data practices.
        </p>

        <h2>Cookies</h2>
        <p>
          See the <a href="/cookies">cookie policy</a> for a full list. In
          short: we use a small, encrypted session cookie required for sign-in,
          and we may set a non-essential analytics cookie subject to your
          consent.
        </p>

        <h2>How to request deletion</h2>
        <p>
          Because we do not store any of your data on our servers, there is
          nothing for us to delete from a database. To remove our access to
          your Spotify account entirely:
        </p>
        <ol>
          <li>
            Visit{' '}
            <a
              href="https://www.spotify.com/account/apps/"
              target="_blank"
              rel="noreferrer"
            >
              spotify.com/account/apps
            </a>
            .
          </li>
          <li>Find {siteConfig.name} in the list of connected apps.</li>
          <li>Click &quot;Remove access&quot;.</li>
        </ol>
        <p>
          Spotify will revoke our tokens immediately. If you have any
          additional questions about your data, email{' '}
          <a href={`mailto:${siteConfig.contact.email}`}>
            {siteConfig.contact.email}
          </a>
          .
        </p>

        <h2>Children</h2>
        <p>
          {siteConfig.name} is not directed at children under 13 (or the
          equivalent age in your jurisdiction). Spotify itself imposes its own
          age requirements on accounts.
        </p>

        <h2>Changes to this policy</h2>
        <p>
          We may update this policy as the service evolves. The &quot;Last
          updated&quot; date at the top of this page reflects the current
          version. Material changes will be announced on the site.
        </p>
      </Prose>
    </PublicLayout>
  );
}
