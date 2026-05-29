/**
 * NextAuth.js v5 catch-all route handler.
 * The actual provider config lives in /auth.ts so it can be imported by
 * server components and API routes that need the session.
 */
import { handlers } from '@/auth';

export const { GET, POST } = handlers;
