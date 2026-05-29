'use client';

/**
 * Bottom-of-page cookie/privacy notice.
 *
 * Persists the user's acknowledgement in localStorage so it doesn't
 * reappear on subsequent visits. Required boilerplate for AdSense /
 * GDPR-aware audiences.
 */
import { useEffect, useState } from 'react';
import Link from 'next/link';

const STORAGE_KEY = 'likeport.cookies-ack';

export default function CookieNotice() {
  // Start hidden to avoid a flash before localStorage is checked.
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (typeof window === 'undefined') return;
      const ack = window.localStorage.getItem(STORAGE_KEY);
      if (!ack) setVisible(true);
    } catch {
      // localStorage may be blocked (private browsing, settings). Show
      // the notice anyway so the disclosure is at least visible.
      setVisible(true);
    }
  }, []);

  function dismiss() {
    try {
      window.localStorage.setItem(STORAGE_KEY, '1');
    } catch {
      // ignore — user may have disabled storage
    }
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 px-4 pb-4 sm:px-6">
      <div className="mx-auto flex max-w-3xl flex-col items-start gap-3 rounded-2xl border border-border bg-card/95 p-4 shadow-2xl backdrop-blur sm:flex-row sm:items-center">
        <p className="flex-1 text-sm text-zinc-300">
          We use a small number of cookies for sign-in and basic analytics.
          See our{' '}
          <Link href="/cookies" className="text-accent hover:underline">
            cookie policy
          </Link>{' '}
          and{' '}
          <Link href="/privacy" className="text-accent hover:underline">
            privacy policy
          </Link>{' '}
          for details.
        </p>
        <button
          onClick={dismiss}
          className="w-full shrink-0 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-black transition hover:bg-accentHover sm:w-auto"
        >
          Got it
        </button>
      </div>
    </div>
  );
}
