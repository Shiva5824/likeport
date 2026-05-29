'use client';

/**
 * Single-purpose button that initiates the Spotify OAuth flow via NextAuth.
 * Used on the landing page.
 */
import { signIn } from 'next-auth/react';

export default function LoginButton() {
  return (
    <button
      onClick={() => signIn('spotify', { callbackUrl: '/dashboard' })}
      className="inline-flex items-center gap-3 rounded-full bg-accent px-7 py-3 font-semibold text-black transition hover:bg-accentHover focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-bg"
    >
      <svg
        viewBox="0 0 24 24"
        className="w-5 h-5"
        fill="currentColor"
        aria-hidden
      >
        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.5 17.3a.75.75 0 01-1.03.25c-2.82-1.72-6.37-2.11-10.55-1.16a.75.75 0 11-.33-1.46c4.55-1.04 8.47-.59 11.65 1.34.36.22.47.69.26 1.03zm1.47-3.27a.94.94 0 01-1.29.31c-3.23-1.99-8.16-2.56-11.98-1.4a.94.94 0 11-.55-1.79c4.36-1.34 9.78-.7 13.5 1.59.45.27.59.85.32 1.29zm.13-3.4C15.45 8.51 8.7 8.27 4.97 9.4a1.13 1.13 0 11-.66-2.16c4.32-1.31 11.78-1.04 16.42 1.72a1.13 1.13 0 11-1.13 1.96z" />
      </svg>
      Login with Spotify
    </button>
  );
}
