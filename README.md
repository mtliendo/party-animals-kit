# Party Animals booth kit

Plug-and-play booth demo for [Focus Otter](https://focusotter.com) (`@focusotter`). Attendees draw. AI animates. The **operator** posts to GitHub through **Auth0 Token Vault**. Attendees never log in and never connect GitHub.

This kit is the operable fork. The AI World Fair 2026 highlight at `https://party-animals-xi.vercel.app/` stays frozen.

## What you get

- Public kiosk: landing, `/draw` (no login), `/wall`
- Operator floor: `/admin` (Auth0-gated, not in attendee nav)
- Real Neon + Drizzle schema
- Real video via Vercel AI SDK (`experimental_generateVideo`)
- Real GitHub issues via Token Vault, posted as Focus
- Event wipe that deletes that event’s rows + prefixed blobs only

## Stack

Next.js App Router · shadcn · Neon / Drizzle · Vercel Blob · Auth0 (`@auth0/nextjs-auth0` v4) · Vercel AI SDK · Excalidraw (MIT). No tldraw. No X / Box / Google post paths.

## One-time setup

### 1. App + env

```bash
pnpm install
cp .env.example .env.local
```

Fill `.env.local`. Then:

```bash
pnpm db:push
pnpm dev
```

Landing, draw, and wall stay up even before Auth0 env is set. `/admin` returns 503 until the `AUTH0_*` variables exist.

On Vercel: create the project, add Neon + Blob, pull env with `vercel env pull .env.local --yes`.

| Variable | Why |
| --- | --- |
| `APP_BASE_URL` | Auth0 callback host |
| `BOOTH_EVENT_SLUG` | Isolates Neon rows + Blob prefixes per event |
| `AUTH0_*` | Operator login + Token Vault |
| `AUTH0_GITHUB_CONNECTION` | Token Vault **connection name** (`github` unless you renamed it) |
| `DATABASE_URL` | Neon |
| `BLOB_READ_WRITE_TOKEN` | Drawings, videos, optional header |
| `GITHUB_ISSUE_REPO` | `owner/repo` for gallery issues |
| `VIDEO_MODEL` | Default `spacexai/grok-imagine-video` |

### 2. Auth0 Token Vault (click-ops)

Do this once per tenant. GitHub **scopes live on the GitHub App**, not in Auth0.

1. Create a Regular Web Application. First-party, confidential, OIDC conformant.
2. Allowed Callback URL: `{APP_BASE_URL}/auth/callback`
3. Allowed Logout URL: `{APP_BASE_URL}`
4. Application → Advanced → Grant Types: **Authorization Code**, **Refresh Token**, **Token Vault**.
5. Application login: request `offline_access` (this kit already sends it).
6. Applications → APIs → activate **Auth0 My Account API**. Authorize this app with Connected Accounts scopes (`create:me:connected_accounts`, `read:me:connected_accounts`, `delete:me:connected_accounts`).
7. Application → Multi-Resource Refresh Token → enable My Account API.
8. Authentication → Social → GitHub (or create the connection). Purpose: **Connected Accounts for Token Vault**. Enable **Connection Permission → Offline Access**. Authorize this application.
9. Create a GitHub App (or OAuth app) with issue write on the gallery repo. Put those credentials on the Auth0 GitHub connection. Do **not** put GitHub scopes in the Auth0 login request.
10. Copy `AUTH0_DOMAIN`, `AUTH0_CLIENT_ID`, `AUTH0_CLIENT_SECRET` into env. Generate `AUTH0_SECRET` (`openssl rand -hex 32`).

Connect path used by `/admin`:

`/auth/connect?connection={AUTH0_GITHUB_CONNECTION}&returnTo=/admin`

The SDK is constructed with `enableConnectAccountEndpoint: true`. Posts call `getAccessTokenForConnection({ connection })` using that **name**. Kiosk submits have no operator cookie, so the kit also stores the operator refresh token in `booth_settings` (not wiped) and exchanges it with Token Vault.

### 3. GitHub gallery repo

Create an empty public repo (issues enabled). Set `GITHUB_ISSUE_REPO=you/your-gallery`. Optional `GITHUB_ISSUE_LABEL`. The booth account that Focus connects in Token Vault must be able to open issues there.

### 4. Video

Default model is `spacexai/grok-imagine-video` through the Vercel AI Gateway. Drawings are uploaded to Blob first. The pipeline passes the **Blob URL** into `experimental_generateVideo` so the async payload stays tiny (Vercel’s ~300KiB `after()` cap). The animals route uses `maxDuration = 300`. Video completion is never faked.

## How to run a booth

1. Open `/admin` on your phone or laptop. Log in as Focus (stable primary login).
2. Destination card → **Connect GitHub** if it says Not connected.
3. Look card → drop a header or leave the Focus Otter default.
4. Point the kiosk tablet at `/draw`. Attendees do not log in. Handle is optional.
5. After submit they see **You’re in** + wall link + Draw another. Pipeline status is on `/wall` (polls).
6. After the event: Floor card → type `CLEAR` → Clear the wall. That wipes this slug’s animals and `events/<slug>/animals/` blobs. It does **not** disconnect GitHub, delete Auth0 users, or empty a shared Blob store.

`/admin` is not in attendee nav. Bookmark it.

## Schema

Drizzle owns the schema (`lib/db/schema.ts`):

- `booth_settings` — destination name + Token Vault connection name, header, operator `sub` + refresh token, last reset. **Kept on wipe.**
- `animals` — drawings for this `event_slug`. **Deleted on wipe.**

Neon MCP is for maintainers. It is not a booth control.

## Destination adapter

v1 implements GitHub only. The runtime destination is a connection name (`booth.destination`), so a later adapter can plug in without rewriting the kiosk. Do not add X, Box, or Google post paths here.

## Not this repo

- Do not change `mtliendo/party-animals` or the frozen highlight deploy.
- Ignore `https://party-animals.vercel.app` (old Spotify player).
