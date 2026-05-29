'use client';

/**
 * Generic card wrapper used by every dashboard export feature.
 * Title + description on top; action area as children.
 */
import type { ReactNode } from 'react';

interface ExportCardProps {
  title: string;
  description: string;
  /** Optional small badge (e.g. song count) shown on the top right. */
  badge?: ReactNode;
  children: ReactNode;
}

export default function ExportCard({
  title,
  description,
  badge,
  children,
}: ExportCardProps) {
  return (
    <section className="flex h-full flex-col rounded-2xl border border-border bg-card p-5 transition hover:border-zinc-700">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold">{title}</h3>
          <p className="mt-1 text-sm text-zinc-400">{description}</p>
        </div>
        {badge ? (
          <span className="whitespace-nowrap rounded-full border border-border bg-bg px-2 py-0.5 text-xs text-zinc-400">
            {badge}
          </span>
        ) : null}
      </div>
      <div className="mt-auto flex flex-col gap-3">{children}</div>
    </section>
  );
}
