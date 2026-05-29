import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import DashboardClient from './DashboardClient';
import Header from '@/components/Header';

/**
 * Dashboard route — server component.
 * Performs an auth gate then hands off to the client component.
 */
export default async function DashboardPage() {
  const session = await auth();
  if (!session?.accessToken || session.error === 'RefreshAccessTokenError') {
    redirect('/');
  }

  return (
    <>
      <Header />
      <DashboardClient />
    </>
  );
}
