import type { MetadataRoute } from 'next';
import { siteConfig } from '@/lib/site-config';

/**
 * robots.txt — allow everything, point crawlers at the sitemap, but
 * keep API routes and the dashboard out of the index since they require
 * authentication and have nothing useful to crawl.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/dashboard'],
      },
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
