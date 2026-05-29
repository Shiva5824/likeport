/**
 * Wraps any non-dashboard page in the public site chrome:
 * header, content area, footer, and the cookie notice overlay.
 */
import { ReactNode } from 'react';
import PublicHeader from './PublicHeader';
import Footer from './Footer';
import CookieNotice from './CookieNotice';

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <PublicHeader />
      <main className="flex-1">{children}</main>
      <Footer />
      <CookieNotice />
    </div>
  );
}
