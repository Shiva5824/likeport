# LikedToPlaylist

Turn your Spotify Liked Songs into shareable playlists or download them as CSV.
Built with Next.js 14 (App Router), TypeScript, Tailwind CSS, NextAuth.js v5
and the Spotify Web API. No database — every request is stateless.

## Features

- Login with Spotify (OAuth, handled by NextAuth.js v5)
- Fetches all of your liked songs (handles pagination + 1000+ libraries)
- Export everything to a new playlist (public or private)
- Export only the last 30 days
- Split by artist — one playlist per artist, or batch-create them all
- Download a CSV of every liked song
- Automatic Spotify token refresh
- Rate-limit aware (honors `Retry-After` on 429)

## Tech stack

- Next.js 14 (App Router, TypeScript)
- Tailwind CSS
- NextAuth.js v5 with the Spotify provider
- Spotify Web API via `fetch` (no SDK)
- `react-window` for virtualizing long song lists

## Local setup

### 1. Create a Spotify app

1. Go to the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard).
2. Click **Create app**.
3. Fill in any name + description (e.g. "LikedToPlaylist (dev)").
4. For **Redirect URI**, add:
   ```
   http://127.0.0.1:3000/api/auth/callback/spotify
   ```
   > Spotify no longer accepts `localhost` in redirect URIs (policy change
   > effective Nov 27, 2025). Use `127.0.0.1` for local development.
   > See [Spotify's migration notice](https://developer.spotify.com/blog/2025-10-14-reminder-oauth-migration-27-nov-2025).

   When you deploy, also add:
   ```
   https://YOUR-DEPLOYMENT.vercel.app/api/auth/callback/spotify
   ```
5. Save the app, then copy the **Client ID** and **Client Secret**.

### 2. Configure environment variables

Copy `.env.local.example` to `.env.local` and fill in the values:

```bash
cp .env.local.example .env.local
```

```env
SPOTIFY_CLIENT_ID=your_client_id
SPOTIFY_CLIENT_SECRET=your_client_secret
NEXTAUTH_SECRET=generate_with_openssl_rand_base64_32
NEXTAUTH_URL=http://127.0.0.1:3000
```

> Open the app at **http://127.0.0.1:3000**, not `http://localhost:3000`.
> The browser host has to match `NEXTAUTH_URL` so the session cookie is sent
> back to the API routes.

Generate a session secret with:

```bash
openssl rand -base64 32
```

### 3. Install + run

```bash
npm install
npm run dev
```

Open http://localhost:3000 and click **Login with Spotify**.

## Scripts

| Command            | What it does                       |
| ------------------ | ---------------------------------- |
| `npm run dev`      | Start the dev server               |
| `npm run build`    | Production build                   |
| `npm run start`    | Run the production build           |
| `npm run lint`     | Lint with `next lint`              |
| `npm run type-check` | TypeScript-only check (`tsc --noEmit`) |

## Project layout

```
app/
  page.tsx                                ← landing page
  dashboard/
    page.tsx                              ← server-rendered shell + auth gate
    DashboardClient.tsx                   ← interactive UI
  api/
    auth/[...nextauth]/route.ts           ← NextAuth handler
    spotify/
      liked-songs/route.ts                ← GET all liked songs
      create-playlist/route.ts            ← POST create + populate playlist
      export-csv/route.ts                 ← GET CSV download
components/
  Header.tsx
  LoginButton.tsx
  SongList.tsx                            ← virtualized list (react-window)
  ExportCard.tsx
  Toast.tsx                               ← simple toast system, no library
lib/
  spotify.ts                              ← Spotify Web API helpers
  utils.ts                                ← chunk(), formatDuration(), csvEscape()…
types/
  spotify.ts                              ← Track, Playlist, API types
  next-auth.d.ts                          ← session/JWT module augmentation
auth.ts                                   ← NextAuth v5 config + token refresh
tailwind.config.ts
next.config.mjs
```

## Deploy on Vercel

1. Push this repo to GitHub / GitLab.
2. Import the project in [Vercel](https://vercel.com/new).
3. Add the four environment variables (`SPOTIFY_CLIENT_ID`,
   `SPOTIFY_CLIENT_SECRET`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`) in the
   project settings. `NEXTAUTH_URL` must match your deployment URL.
4. Add `https://YOUR-DEPLOYMENT.vercel.app/api/auth/callback/spotify`
   as a redirect URI in your Spotify Developer Dashboard.
5. Deploy.

No Docker required. No database required.

## Required Spotify scopes

```
user-library-read
playlist-modify-public
playlist-modify-private
user-read-private
user-read-email
```

## Error handling

- **0 liked songs** → friendly empty-state card.
- **429 rate limit** → `lib/spotify.ts` retries automatically, honoring
  the `Retry-After` header (up to 5 attempts).
- **Token expired and refresh fails** → session is flagged
  `RefreshAccessTokenError`; the dashboard sends the user back through
  `signIn('spotify')`.
- All API errors surface as toast notifications with human-readable text.

## What is intentionally not built (yet)

- Auto-sync (would need a database + cron)
- Genre splitting (requires the Spotify audio-features API)
- Payments / premium tier
- Persisted user data of any kind

## License

MIT
