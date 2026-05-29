import Link from 'next/link';
import PublicLayout from '@/components/PublicLayout';

export default function NotFound() {
  return (
    <PublicLayout>
      <section className="mx-auto max-w-xl px-4 py-24 text-center sm:px-6">
        <h1 className="text-5xl font-bold tracking-tight">404</h1>
        <p className="mt-4 text-zinc-400">
          That page is not here. It may have moved, or you may have followed a
          stale link.
        </p>
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/"
            className="rounded-full bg-accent px-5 py-2 text-sm font-semibold text-black transition hover:bg-accentHover"
          >
            Go home
          </Link>
          <Link
            href="/blog"
            className="rounded-full border border-border px-5 py-2 text-sm font-medium text-zinc-300 transition hover:border-zinc-700 hover:text-white"
          >
            Read the blog
          </Link>
        </div>
      </section>
    </PublicLayout>
  );
}
