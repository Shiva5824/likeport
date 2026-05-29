'use client';

/**
 * Top navbar: app brand + user avatar with a logout dropdown.
 */
import { signOut, useSession } from 'next-auth/react';
import { useEffect, useRef, useState } from 'react';

export default function Header() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close the menu on click outside.
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const initials =
    session?.user?.name
      ?.split(' ')
      .map((p) => p[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() ?? 'U';
  const avatar = session?.user?.image ?? null;

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-bg/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <div className="flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-accent/10 ring-1 ring-accent/30">
            <svg viewBox="0 0 24 24" className="h-4 w-4 text-accent" fill="currentColor" aria-hidden>
              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.5 17.3a.75.75 0 01-1.03.25c-2.82-1.72-6.37-2.11-10.55-1.16a.75.75 0 11-.33-1.46c4.55-1.04 8.47-.59 11.65 1.34.36.22.47.69.26 1.03zm1.47-3.27a.94.94 0 01-1.29.31c-3.23-1.99-8.16-2.56-11.98-1.4a.94.94 0 11-.55-1.79c4.36-1.34 9.78-.7 13.5 1.59.45.27.59.85.32 1.29zm.13-3.4C15.45 8.51 8.7 8.27 4.97 9.4a1.13 1.13 0 11-.66-2.16c4.32-1.31 11.78-1.04 16.42 1.72a1.13 1.13 0 11-1.13 1.96z" />
            </svg>
          </div>
          <span className="text-sm font-semibold tracking-tight sm:text-base">
            LikedToPlaylist
          </span>
        </div>

        <div className="relative" ref={ref}>
          <button
            onClick={() => setOpen((v) => !v)}
            className="flex items-center gap-2 rounded-full border border-border bg-card px-2 py-1.5 transition hover:border-zinc-700"
            aria-haspopup="menu"
            aria-expanded={open}
          >
            {avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatar}
                alt=""
                className="h-7 w-7 rounded-full object-cover"
              />
            ) : (
              <span className="grid h-7 w-7 place-items-center rounded-full bg-zinc-800 text-xs font-semibold">
                {initials}
              </span>
            )}
            <span className="hidden text-sm sm:block">
              {session?.user?.name ?? 'Account'}
            </span>
            <svg
              viewBox="0 0 20 20"
              className="h-4 w-4 text-zinc-400"
              fill="currentColor"
              aria-hidden
            >
              <path d="M5.5 7.5l4.5 5 4.5-5z" />
            </svg>
          </button>

          {open && (
            <div
              role="menu"
              className="absolute right-0 mt-2 w-48 overflow-hidden rounded-xl border border-border bg-card shadow-xl"
            >
              <div className="px-3 py-2 text-xs text-zinc-400">
                {session?.user?.email ?? 'Signed in'}
              </div>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="block w-full px-3 py-2 text-left text-sm hover:bg-zinc-900"
                role="menuitem"
              >
                Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
