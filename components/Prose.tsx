/**
 * Typographic wrapper for long-form pages (about, FAQ, legal, blog posts).
 * Tailwind doesn't ship its `prose` plugin in this project, so we hand-style
 * headings, paragraphs, lists, and links to look consistent across pages.
 */
import { ReactNode } from 'react';

export default function Prose({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14 [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:tracking-tight [&_h1]:sm:text-4xl [&_h2]:mt-10 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:tracking-tight [&_h3]:mt-6 [&_h3]:text-base [&_h3]:font-semibold [&_p]:mt-4 [&_p]:text-zinc-300 [&_p]:leading-relaxed [&_ul]:mt-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:text-zinc-300 [&_ol]:mt-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:text-zinc-300 [&_li]:mt-2 [&_li]:leading-relaxed [&_a]:text-accent [&_a]:underline [&_a]:underline-offset-2 hover:[&_a]:text-accentHover [&_strong]:text-white [&_code]:rounded [&_code]:bg-zinc-900 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-sm [&_blockquote]:mt-4 [&_blockquote]:border-l-2 [&_blockquote]:border-accent/40 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-zinc-400">
      {children}
    </div>
  );
}
