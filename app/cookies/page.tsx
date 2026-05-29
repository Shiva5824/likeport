import type { Metadata } from 'next';
import PublicLayout from '@/components/PublicLayout';
import Prose from '@/components/Prose';
import { siteConfig } from '@/lib/site-config';

export const metadata: Metadata = {
  title: `Cookie Policy — ${siteConfig.name}`,
  description: `Which cookies ${siteConfig.name} uses and what they do.`,
};

export default function CookiesPage() {
  return (
    <PublicLayout>
      <Prose>
        <h1>Cookie Policy</h1>
        <p>
          <em>Last updated: {siteConfig.legalUpdated}</em>
        </p>

        <p>
          {siteConfig.name} uses a small number of cookies. This page lists
          each one, what it does, how long it lives, and whether it is
          essential.
        </p>

        <h2>Strictly necessary</h2>
        <ul>
          <li>
            <strong>NextAuth session cookie</strong> (
            <code>next-auth.session-token</code> or
            <code> __Secure-next-auth.session-token</code> on HTTPS). Stores an
            encrypted JWT containing your Spotify access and refresh tokens so
            the app remembers you between requests. Required for sign-in.
            Lifetime: 30 days, or until you log out.
          </li>
          <li>
            <strong>NextAuth CSRF token</strong> (
            <code>next-auth.csrf-token</code>). A short-lived cookie used to
            protect the sign-in form against cross-site request forgery.
          </li>
          <li>
            <strong>OAuth state and PKCE cookies</strong> (
            <code>next-auth.state</code>, <code>next-auth.pkce.code_verifier</code>).
            Set briefly during the Spotify sign-in handshake to verify the
            response Spotify sends back. Removed automatically after sign-in.
          </li>
          <li>
            <strong>Cookie acknowledgement</strong> (
            <code>likeport.cookies-ack</code> in localStorage, not a cookie
            strictly speaking). Records that you have dismissed the cookie
            banner so we don&apos;t show it again. Stored only in your browser.
          </li>
        </ul>

        <h2>Analytics</h2>
        <p>
          If we enable lightweight analytics in the future, the cookies it
          sets will be listed here. We currently do not run any third-party
          analytics that uniquely identifies you.
        </p>

        <h2>Advertising</h2>
        <p>
          The site does not currently serve ads. If we ever introduce
          advertising (for example, via Google AdSense), this section will
          list each advertising cookie and a link to the partner&apos;s own
          policy so you can opt out.
        </p>

        <h2>Managing cookies</h2>
        <p>
          You can clear or block cookies in your browser settings. If you
          block the strictly-necessary cookies above, the sign-in flow will
          not work. To revoke {siteConfig.name}&apos;s OAuth access entirely,
          visit{' '}
          <a
            href="https://www.spotify.com/account/apps/"
            target="_blank"
            rel="noreferrer"
          >
            spotify.com/account/apps
          </a>
          .
        </p>

        <h2>Questions</h2>
        <p>
          Email{' '}
          <a href={`mailto:${siteConfig.contact.email}`}>
            {siteConfig.contact.email}
          </a>{' '}
          if you have any concerns about how cookies are used here.
        </p>
      </Prose>
    </PublicLayout>
  );
}
