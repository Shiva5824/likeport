'use client';

/**
 * Site-wide top navigation used on all public marketing/legal pages.
 * The dashboard has its own auth-aware header in components/Header.tsx.
 */
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { siteConfig } from '@/lib/site-config';

const NAV: { label: string; href: string }[] = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'FAQ', href: '/faq' },
  { label: 'Blog', href: '/blog' },
  { label: 'Contact', href: '/contact' },
];

export default function PublicHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-bg/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-accent/10 ring-1 ring-accent/30">
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4 text-accent"
              fill="currentColor"
              aria-hidden
            >
              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.5 17.3a.75.75 0 01-1.03.25c-2.82-1.72-6.37-2.11-10.55-1.16a.75.75 0 11-.33-1.46c4.55-1.04 8.47-.59 11.65 1.34.36.22.47.69.26 1.03zm1.47-3.27a.94.94 0 01-1.29.31c-3.23-1.99-8.16-2.56-11.98-1.4a.94.94 0 11-.55-1.79c4.36-1.34 9.78-.7 13.5 1.59.45.27.59.85.32 1.29zm.13-3.4C15.45 8.51 8.7 8.27 4.97 9.4a1.13 1.13 0 11-.66-2.16c4.32-1.31 11.78-1.04 16.42 1.72a1.13 1.13 0 11-1.13 1.96z" />
            </svg>
          </div>
          <span className="text-sm font-semibold sm:text-base">{siteConfig.name}</span>
        </Link>

        <nav className="hidden md:block">
          <ul className="flex items-center gap-6 text-sm">
            {NAV.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={
                      active
                        ? 'text-white'
                        : 'text-zinc-400 transition hover:text-white'
                    }
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <Link
          href="/dashboard"
          className="hidden rounded-full bg-accent px-4 py-1.5 text-sm font-semibold text-black transition hover:bg-accentHover md:inline-block"
        >
          Open app
        </Link>

        <button
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="grid h-9 w-9 place-items-center rounded-lg border border-border md:hidden"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
            {open ? (
              <path d="M18.3 5.71L12 12l6.3 6.29-1.41 1.42L10.59 13.41 4.3 19.71 2.89 18.29 9.18 12 2.89 5.71 4.3 4.29l6.29 6.29 6.3-6.29z" />
            ) : (
              <path d="M3 6h18v2H3zm0 5h18v2H3zm0 5h18v2H3z" />
            )}
          </svg>
        </button>
      </div>

      {open && (
        <div className="border-t border-border md:hidden">
          <ul className="mx-auto max-w-6xl px-4 py-3 text-sm sm:px-6">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="block py-2 text-zinc-300 hover:text-white"
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/dashboard"
                onClick={() => setOpen(false)}
                className="mt-2 block rounded-full bg-accent px-4 py-2 text-center font-semibold text-black"
              >
                Open app
              </Link>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}

/** Tiny helper so the home link only highlights when exactly on `/`. */
function isActive(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(href + '/');
}
