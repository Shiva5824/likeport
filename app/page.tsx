/**
 * Landing page.
 *
 * If the user has a valid session, redirect straight to /dashboard.
 * Otherwise, show the marketing landing with feature highlights and the
 * "Login with Spotify" call to action.
 */
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/auth';
import LoginButton from '@/components/LoginButton';
import PublicLayout from '@/components/PublicLayout';

const FEATURES: { title: string; description: string }[] = [
  {
    title: 'Export everything',
    description:
      'Convert all of your liked songs into a single shareable playlist in one click.',
  },
  {
    title: 'Last 30 days',
    description:
      'Keep a running mixtape of what you have been into recently — perfect for sharing.',
  },
  {
    title: 'Split by artist',
    description:
      'Generate a separate playlist per artist, automatically, with one button.',
  },
  {
    title: 'Download as CSV',
    description:
      'Backup your library to a spreadsheet so you never lose what you liked.',
  },
];

export default async function Home() {
  const session = await auth();
  if (session?.accessToken && !session.error) {
    redirect('/dashboard');
  }

  return (
    <PublicLayout>
      <section className="mx-auto flex max-w-3xl flex-col items-center px-6 py-20 text-center sm:py-28">
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
          Turn your Liked Songs into real playlists.
        </h1>
        <p className="mt-4 text-zinc-400 text-lg">
          LikePort exports your Spotify Liked Songs as shareable playlists or a
          CSV backup. No installs, no syncing, no hidden tracking.
        </p>

        <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row">
          <LoginButton />
          <Link
            href="/about"
            className="rounded-full border border-border px-5 py-3 text-sm font-medium text-zinc-300 transition hover:border-zinc-700 hover:text-white"
          >
            Learn more
          </Link>
        </div>

        <p className="mt-8 text-xs text-zinc-500">
          We never store your music. Authentication uses Spotify OAuth and a
          short-lived session cookie.
        </p>
      </section>

      <section className="mx-auto max-w-5xl px-4 pb-16 sm:px-6">
        <h2 className="text-center text-2xl font-semibold tracking-tight">
          What you can do with LikePort
        </h2>
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-border bg-card p-5"
            >
              <h3 className="text-base font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-zinc-400">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 pb-20 text-center sm:px-6">
        <h2 className="text-2xl font-semibold tracking-tight">
          Ready to back up your liked songs?
        </h2>
        <p className="mt-3 text-zinc-400">
          Connect your Spotify account in seconds. We will read your liked
          tracks and let you decide what to do with them.
        </p>
        <div className="mt-6 flex justify-center">
          <LoginButton />
        </div>
      </section>
    </PublicLayout>
  );
}
