import type { Metadata } from 'next';
import PublicLayout from '@/components/PublicLayout';
import Prose from '@/components/Prose';
import { siteConfig } from '@/lib/site-config';

export const metadata: Metadata = {
  title: `Terms of Service — ${siteConfig.name}`,
  description: `The terms that govern your use of ${siteConfig.name}.`,
};

export default function TermsPage() {
  return (
    <PublicLayout>
      <Prose>
        <h1>Terms of Service</h1>
        <p>
          <em>Last updated: {siteConfig.legalUpdated}</em>
        </p>
        <p>
          These terms govern your use of {siteConfig.name} (&quot;the
          service&quot;), operated by {siteConfig.owner.name}. By using the
          service you agree to these terms.
        </p>

        <h2>1. Eligibility</h2>
        <p>
          You must have a valid Spotify account in good standing to use the
          service. You agree to comply with Spotify&apos;s own Terms of Service
          while using {siteConfig.name}.
        </p>

        <h2>2. User responsibilities</h2>
        <p>You agree that you will not:</p>
        <ul>
          <li>
            Use the service in a way that violates any applicable law, the
            rights of others, or Spotify&apos;s terms.
          </li>
          <li>
            Attempt to access another user&apos;s Spotify account or data.
          </li>
          <li>
            Interfere with, disrupt, or attempt to overload the service or its
            infrastructure.
          </li>
          <li>
            Reverse-engineer, copy, or redistribute the service or its
            underlying source code beyond what the project license permits.
          </li>
          <li>
            Use the service to create or distribute content that is unlawful,
            harassing, or infringing.
          </li>
        </ul>

        <h2>3. Spotify content and trademarks</h2>
        <p>
          {siteConfig.name} is an independent project. It is not operated,
          sponsored, endorsed, or affiliated with Spotify AB. &quot;Spotify&quot;
          and the Spotify logo are trademarks of Spotify AB. All track,
          artist, and album metadata you see in the app is owned by its
          respective rights holders.
        </p>

        <h2>4. No warranty</h2>
        <p>
          The service is provided &quot;as is&quot; and &quot;as available&quot;
          without warranties of any kind, express or implied, including but
          not limited to warranties of merchantability, fitness for a
          particular purpose, or non-infringement. We do not guarantee that
          the service will be error-free or available without interruption.
        </p>

        <h2>5. Limitation of liability</h2>
        <p>
          To the fullest extent permitted by law, {siteConfig.owner.name} will
          not be liable for any indirect, incidental, special, or consequential
          damages, including loss of data, loss of playlists, or service
          interruption, arising out of or related to your use of the service.
        </p>

        <h2>6. Service availability</h2>
        <p>
          We make no commitment about service uptime. The service may be
          unavailable due to maintenance, Spotify API changes, or factors
          outside our control. We may modify, suspend, or discontinue the
          service at any time without notice.
        </p>

        <h2>7. Intellectual property</h2>
        <p>
          The service&apos;s code, design, copy, and brand assets are the
          property of {siteConfig.owner.name} except where otherwise indicated.
          The metadata returned by Spotify and any audio content remain the
          property of their respective owners.
        </p>

        <h2>8. Account termination</h2>
        <p>
          You can terminate your use at any time by revoking the
          service&apos;s access from{' '}
          <a
            href="https://www.spotify.com/account/apps/"
            target="_blank"
            rel="noreferrer"
          >
            spotify.com/account/apps
          </a>
          . We reserve the right to terminate or restrict access to anyone who
          violates these terms or abuses the service.
        </p>

        <h2>9. Changes to these terms</h2>
        <p>
          We may update these terms from time to time. The &quot;Last
          updated&quot; date at the top of this page reflects the current
          version. Continued use of the service after changes are posted
          constitutes acceptance of the new terms.
        </p>

        <h2>10. Governing law</h2>
        <p>
          These terms are governed by and construed in accordance with the
          laws of {siteConfig.owner.country}, without regard to conflict-of-law
          principles.
        </p>

        <h2>11. Contact</h2>
        <p>
          Questions about these terms? Email{' '}
          <a href={`mailto:${siteConfig.contact.email}`}>
            {siteConfig.contact.email}
          </a>{' '}
          or use the <a href="/contact">contact page</a>.
        </p>
      </Prose>
    </PublicLayout>
  );
}
