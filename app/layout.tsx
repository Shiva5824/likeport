import type { Metadata } from 'next';
import './globals.css';
import Providers from './providers';
import { siteConfig } from '@/lib/site-config';

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.name,
    template: `%s — ${siteConfig.name}`,
  },
  description: siteConfig.tagline,
  openGraph: {
    title: siteConfig.name,
    description: siteConfig.tagline,
    url: siteConfig.url,
    siteName: siteConfig.name,
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: siteConfig.name,
    description: siteConfig.tagline,
  },
  // Help search engines understand the site is intentionally a public tool.
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-bg text-zinc-100 min-h-screen">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
