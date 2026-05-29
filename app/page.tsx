/**
 * Landing page.
 *
 * If the user has a valid session, redirect straight to /dashboard.
 * Otherwise, show the "Login with Spotify" call to action.
 */
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import LoginButton from '@/components/LoginButton';

export default async function Home() {
  const session = await auth();
  if (session?.accessToken && !session.error) {
    redirect('/dashboard');
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-xl text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent/10 ring-1 ring-accent/30 mb-8">
          <svg
            viewBox="0 0 24 24"
            className="w-8 h-8 text-accent"
            fill="currentColor"
            aria-hidden
          >
            <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.5 17.3a.75.75 0 01-1.03.25c-2.82-1.72-6.37-2.11-10.55-1.16a.75.75 0 11-.33-1.46c4.55-1.04 8.47-.59 11.65 1.34.36.22.47.69.26 1.03zm1.47-3.27a.94.94 0 01-1.29.31c-3.23-1.99-8.16-2.56-11.98-1.4a.94.94 0 11-.55-1.79c4.36-1.34 9.78-.7 13.5 1.59.45.27.59.85.32 1.29zm.13-3.4C15.45 8.51 8.7 8.27 4.97 9.4a1.13 1.13 0 11-.66-2.16c4.32-1.31 11.78-1.04 16.42 1.72a1.13 1.13 0 11-1.13 1.96z" />
          </svg>
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
          LikedToPlaylist
        </h1>
        <p className="mt-4 text-zinc-400 text-lg">
          Turn your Spotify Liked Songs into real, shareable playlists.
          Export everything, the last 30 days, or split by artist. Download to
          CSV in one click.
        </p>

        <div className="mt-10 flex justify-center">
          <LoginButton />
        </div>

        <p className="mt-8 text-xs text-zinc-500">
          We never store your music. Authentication uses Spotify OAuth and a
          short-lived session cookie.
        </p>
      </div>
    </main>
  );
}
