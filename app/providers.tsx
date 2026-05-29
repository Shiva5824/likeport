'use client';

/**
 * Top-level client providers. Wraps the app in:
 *   - SessionProvider so client components can call `useSession()`
 *   - ToastProvider for our home-grown toast system
 */
import { SessionProvider } from 'next-auth/react';
import { ToastProvider } from '@/components/Toast';
import { ReactNode } from 'react';

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <ToastProvider>{children}</ToastProvider>
    </SessionProvider>
  );
}
