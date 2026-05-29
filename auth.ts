/**
 * NextAuth.js v5 configuration.
 *
 * Responsibilities:
 *   - Configure Spotify OAuth provider with the required scopes.
 *   - Persist Spotify access_token + refresh_token in the JWT.
 *   - Refresh the access_token transparently when it expires (1h lifetime).
 *
 * No database is used. All state lives in the encrypted JWT cookie.
 */

import NextAuth, { type NextAuthConfig } from 'next-auth';
import type { JWT } from 'next-auth/jwt';
import type { SpotifyUser } from '@/types/spotify';

/**
 * The set of scopes our app needs on the user's Spotify account.
 * Keep this list in sync with what the dashboard features actually use.
 */
const SCOPES = [
  'user-library-read',
  'playlist-modify-public',
  'playlist-modify-private',
  'user-read-private',
  'user-read-email',
].join(' ');

/**
 * Exchange the stored refresh_token for a fresh access_token.
 *
 * On failure we mark the JWT with `error: 'RefreshAccessTokenError'` so the
 * client can detect it and force the user back to the sign-in flow.
 */
async function refreshAccessToken(token: JWT): Promise<JWT> {
  try {
    if (!token.refreshToken) throw new Error('no refresh token');

    const basic = Buffer.from(
      `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`,
    ).toString('base64');

    const res = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${basic}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: token.refreshToken,
      }),
      cache: 'no-store',
    });

    const body = (await res.json()) as {
      access_token?: string;
      expires_in?: number;
      refresh_token?: string;
      error?: string;
    };

    if (!res.ok || !body.access_token || !body.expires_in) {
      throw new Error(body.error ?? 'failed to refresh token');
    }

    return {
      ...token,
      accessToken: body.access_token,
      // Spotify rarely rotates the refresh token, but use the new one if given.
      refreshToken: body.refresh_token ?? token.refreshToken,
      accessTokenExpires: Date.now() + body.expires_in * 1000,
      error: undefined,
    };
  } catch {
    return { ...token, error: 'RefreshAccessTokenError' };
  }
}

/**
 * NextAuth derives the redirect URI from `NEXTAUTH_URL` (which we set in
 * Vercel to https://likeport.vercel.app). `trustHost: true` makes that
 * authoritative even if a request arrives with a different Host header.
 */
export const authConfig: NextAuthConfig = {
  providers: [
    // Custom Spotify OAuth provider. We build the entire provider object
    // by hand instead of using `Spotify(...)` from next-auth/providers
    // because the v5 beta's bundled Spotify provider hardcodes
    // `scope=user-read-email` in its default authorization URL, and any
    // attempt to override via `params.scope` is ignored by the way
    // Auth.js merges the two. Defining the provider inline avoids that
    // bug entirely and gives us full control over the auth + token + userinfo
    // endpoints.
    {
      id: 'spotify',
      name: 'Spotify',
      type: 'oauth',
      clientId: process.env.SPOTIFY_CLIENT_ID,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
      // Spotify recommends PKCE; Auth.js handles it automatically when
      // `checks: ["pkce", "state"]` is set.
      checks: ['pkce', 'state'],
      authorization: {
        url: 'https://accounts.spotify.com/authorize',
        params: {
          scope: SCOPES,
          // Force Spotify to re-show the consent screen on every sign-in
          // so we can't end up with a stale, narrower grant.
          show_dialog: true,
        },
      },
      token: 'https://accounts.spotify.com/api/token',
      userinfo: 'https://api.spotify.com/v1/me',
      // Map Spotify's /me payload onto NextAuth's profile shape.
      profile(profile: SpotifyUser) {
        return {
          id: profile.id,
          name: profile.display_name ?? profile.id,
          email: profile.email,
          image: profile.images?.[0]?.url ?? null,
        };
      },
    },
  ],
  // Trust the host from NEXTAUTH_URL / AUTH_URL even when the request comes
  // in on a different host. Required so the Spotify `redirect_uri` matches
  // what's registered in the Spotify dashboard regardless of whether the
  // browser opens the app at localhost or 127.0.0.1.
  trustHost: true,
  // We have no DB, so use JWT sessions.
  session: { strategy: 'jwt' },
  pages: {
    // Use our home page as the sign-in page.
    signIn: '/',
  },
  callbacks: {
    /**
     * Runs whenever a JWT is created or read. We use it to:
     *  - Capture tokens on first sign-in.
     *  - Return the existing token if still valid.
     *  - Refresh the token when expired.
     */
    async jwt({ token, account, profile }) {
      // Initial sign-in: account is defined and contains the Spotify tokens.
      if (account && profile) {
        return {
          ...token,
          accessToken: account.access_token,
          refreshToken: account.refresh_token,
          // account.expires_at is in seconds.
          accessTokenExpires:
            typeof account.expires_at === 'number'
              ? account.expires_at * 1000
              : Date.now() + 3500 * 1000,
          userId: (profile as { id?: string }).id,
        };
      }

      // Subsequent calls: if access token is still valid, return as-is.
      if (
        token.accessTokenExpires &&
        Date.now() < token.accessTokenExpires - 60 * 1000 // 1 min skew
      ) {
        return token;
      }

      // Otherwise, attempt a refresh.
      return refreshAccessToken(token);
    },

    /** Project a subset of the JWT onto the session object exposed to clients. */
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      session.error = token.error;
      if (token.userId) {
        session.user = { ...session.user, id: token.userId };
      }
      return session;
    },
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
