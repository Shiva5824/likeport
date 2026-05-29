import type { MetadataRoute } from 'next';
import { siteConfig } from '@/lib/site-config';
import { POSTS } from '@/lib/blog';

/**
 * Programmatic sitemap. Includes every public page plus each blog post.
 * Vercel automatically serves this at /sitemap.xml.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteConfig.url;
  const now = new Date();

  const staticPages = [
    '',
    '/about',
    '/faq',
    '/contact',
    '/blog',
    '/privacy',
    '/terms',
    '/cookies',
  ];

  const staticEntries = staticPages.map((path) => ({
    url: `${base}${path}`,
    lastModified: now,
    changeFrequency: path === '' ? ('weekly' as const) : ('monthly' as const),
    priority: path === '' ? 1.0 : 0.6,
  }));

  const postEntries = POSTS.map((post) => ({
    url: `${base}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  return [...staticEntries, ...postEntries];
}
