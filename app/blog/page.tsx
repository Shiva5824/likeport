import type { Metadata } from 'next';
import Link from 'next/link';
import PublicLayout from '@/components/PublicLayout';
import { getPostsSortedByDate } from '@/lib/blog';
import { siteConfig } from '@/lib/site-config';

export const metadata: Metadata = {
  title: `Blog — ${siteConfig.name}`,
  description: `Guides and explainers about Spotify Liked Songs, playlists, and music exports.`,
};

export default function BlogIndexPage() {
  const posts = getPostsSortedByDate();
  return (
    <PublicLayout>
      <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Blog</h1>
        <p className="mt-3 text-zinc-400">
          Guides, explainers, and tips for Spotify listeners. Mostly about
          getting your music collection out of one place and into another.
        </p>

        <ul className="mt-10 space-y-4">
          {posts.map((post) => (
            <li key={post.slug}>
              <Link
                href={`/blog/${post.slug}`}
                className="block rounded-2xl border border-border bg-card p-5 transition hover:border-zinc-700"
              >
                <div className="flex items-center gap-2 text-xs text-zinc-500">
                  <time dateTime={post.date}>
                    {new Date(post.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </time>
                  <span aria-hidden>•</span>
                  <span>{post.readMinutes} min read</span>
                </div>
                <h2 className="mt-2 text-lg font-semibold tracking-tight">
                  {post.title}
                </h2>
                <p className="mt-2 text-sm text-zinc-400">{post.description}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-border bg-bg px-2 py-0.5 text-xs text-zinc-400"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </PublicLayout>
  );
}
