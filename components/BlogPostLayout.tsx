/**
 * Shared layout for individual blog posts. Renders the post header
 * (title, date, read time, tags) and the article content inside `Prose`.
 */
import Link from 'next/link';
import type { ReactNode } from 'react';
import PublicLayout from './PublicLayout';
import Prose from './Prose';
import type { BlogPostMeta } from '@/lib/blog';

export default function BlogPostLayout({
  post,
  children,
}: {
  post: BlogPostMeta;
  children: ReactNode;
}) {
  return (
    <PublicLayout>
      <article>
        <div className="mx-auto max-w-3xl px-4 pt-12 sm:px-6">
          <Link
            href="/blog"
            className="text-sm text-zinc-400 hover:text-white"
          >
            ← All posts
          </Link>
          <div className="mt-4 flex items-center gap-2 text-xs text-zinc-500">
            <time dateTime={post.date}>
              {new Date(post.date).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </time>
            <span aria-hidden>•</span>
            <span>{post.readMinutes} min read</span>
          </div>
          <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            {post.title}
          </h1>
          <p className="mt-3 text-lg text-zinc-400">{post.description}</p>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-border bg-bg px-2 py-0.5 text-xs text-zinc-400"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
        <Prose>{children}</Prose>
      </article>
    </PublicLayout>
  );
}
