/**
 * Site-wide footer. Rendered on every public page.
 *
 * Contains primary navigation, the social icons (driven from site-config),
 * and the standard legal/copyright line. AdSense reviewers look for this
 * kind of footer so we surface every key page from here.
 */
import Link from 'next/link';
import { siteConfig } from '@/lib/site-config';
import { SocialIcon } from './SocialIcon';

const NAV: { label: string; href: string }[] = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'FAQ', href: '/faq' },
  { label: 'Blog', href: '/blog' },
  { label: 'Contact', href: '/contact' },
];

const LEGAL: { label: string; href: string }[] = [
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Terms of Service', href: '/terms' },
  { label: 'Cookie Policy', href: '/cookies' },
];

export default function Footer() {
  const year = new Date().getFullYear();
  // Build an ordered list of socials, skipping any empty entries so users
  // can hide an icon by clearing its value in site-config.
  const socials = (
    [
      ['github', siteConfig.socials.github],
      ['telegram', siteConfig.socials.telegram],
      ['instagram', siteConfig.socials.instagram],
      ['linkedin', siteConfig.socials.linkedin],
      ['email', siteConfig.socials.email],
    ] as const
  ).filter(([, href]) => href.length > 0);

  return (
    <footer className="mt-20 border-t border-border bg-bg/60">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-accent/10 ring-1 ring-accent/30">
              <SpotifyMark />
            </div>
            <span className="text-base font-semibold">{siteConfig.name}</span>
          </div>
          <p className="mt-3 max-w-sm text-sm text-zinc-400">
            {siteConfig.tagline}
          </p>

          {socials.length > 0 && (
            <div className="mt-5 flex items-center gap-3">
              {socials.map(([kind, href]) => (
                <a
                  key={kind}
                  href={href}
                  target={kind === 'email' ? undefined : '_blank'}
                  rel={kind === 'email' ? undefined : 'noreferrer'}
                  aria-label={kind}
                  className="grid h-9 w-9 place-items-center rounded-lg border border-border bg-card text-zinc-300 transition hover:border-zinc-700 hover:text-white"
                >
                  <SocialIcon kind={kind} />
                </a>
              ))}
            </div>
          )}
        </div>

        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Site
          </h4>
          <ul className="mt-3 space-y-2 text-sm">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="text-zinc-300 hover:text-white">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Legal
          </h4>
          <ul className="mt-3 space-y-2 text-sm">
            {LEGAL.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="text-zinc-300 hover:text-white">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-zinc-500 sm:flex-row sm:px-6">
          <p>
            © {year} {siteConfig.name}. Not affiliated with Spotify AB.
          </p>
          <p>
            Spotify is a trademark of Spotify AB. All trademarks are property of
            their respective owners.
          </p>
        </div>
      </div>
    </footer>
  );
}

function SpotifyMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 text-accent" fill="currentColor" aria-hidden>
      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.5 17.3a.75.75 0 01-1.03.25c-2.82-1.72-6.37-2.11-10.55-1.16a.75.75 0 11-.33-1.46c4.55-1.04 8.47-.59 11.65 1.34.36.22.47.69.26 1.03zm1.47-3.27a.94.94 0 01-1.29.31c-3.23-1.99-8.16-2.56-11.98-1.4a.94.94 0 11-.55-1.79c4.36-1.34 9.78-.7 13.5 1.59.45.27.59.85.32 1.29zm.13-3.4C15.45 8.51 8.7 8.27 4.97 9.4a1.13 1.13 0 11-.66-2.16c4.32-1.31 11.78-1.04 16.42 1.72a1.13 1.13 0 11-1.13 1.96z" />
    </svg>
  );
}
