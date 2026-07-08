# Shared Better Auth SSO (employee-portal ↔ PHH-DRIVE)

Both apps must use the **same** values for:

| Variable | Example (local) | Example (production) |
|----------|-----------------|----------------------|
| `BETTER_AUTH_SECRET` | shared random string | shared random string |
| `AUTH_DATABASE_URL` | Portal Postgres URL | Portal Postgres URL |
| `AUTH_SESSION_EXPIRES_IN` | `7d` | `7d` |
| `AUTH_SESSION_UPDATE_AGE` | `30m` | `30m` |
| `AUTH_SESSION_COOKIE_CACHE_MAX_AGE` | `30m` | `30m` |
| `AUTH_COOKIE_DOMAIN` | `.local.test` | `.phh.com` |

Per-app public URLs (must match the browser address):

| App | Env var | Local | Production |
|-----|---------|-------|------------|
| employee-portal | `ORIGIN` | `http://portal.local.test` | `https://phh.com` |
| employee-portal | `DRIVE_ORIGIN` | `http://drive.local.test` | `https://office.drive.phh.com` |
| PHH-DRIVE | `ORIGIN` | `http://drive.local.test` | `https://office.drive.phh.com` |
| PHH-DRIVE | `PORTAL_ORIGIN` | `http://portal.local.test` | `https://phh.com` |

Portal also accepts `PORTAL_TRUSTED_REDIRECT_ORIGINS` (defaults to trusting `DRIVE_ORIGIN` when set).

`DRIVE_ORIGIN` also syncs the **PHH-DRIVE** service tile link on portal startup (no manual SQL needed when env is set).

Portal admin media uploads (images, PDFs, video, audio) use `DRIVE_TEAM_API_KEY` server-side — see [drive-media-integration.md](./drive-media-integration.md).

## Local dev

employee-portal owns the reverse proxy. Domains come from `.env`:

```env
ORIGIN=http://portal.local.test
DRIVE_ORIGIN=http://drive.local.test
AUTH_COOKIE_DOMAIN=.local.test
```

1. **Hosts** (Administrator PowerShell, one-time):

   ```powershell
   cd employee-portal
   powershell -ExecutionPolicy Bypass -File scripts/setup-local-sso-hosts.ps1
   ```

2. **Install Caddy** (if needed): `winget install -e --id CaddyServer.Caddy`

3. **Start apps** (three terminals):

   ```powershell
   cd employee-portal && pnpm dev
   cd drive && pnpm dev
   cd employee-portal && pnpm caddy:dev
   ```

4. Browse the URLs from `ORIGIN` and `DRIVE_ORIGIN` (not raw `localhost` ports).

`pnpm caddy:dev` renders `Caddyfile.generated` from `.env` then starts Caddy.

## Production

Set production URLs in both `.env` files:

**employee-portal**

```env
ORIGIN=https://phh.com
DRIVE_ORIGIN=https://office.drive.phh.com
AUTH_COOKIE_DOMAIN=.phh.com
```

**PHH-DRIVE**

```env
ORIGIN=https://office.drive.phh.com
PORTAL_ORIGIN=https://phh.com
AUTH_COOKIE_DOMAIN=.phh.com
```

On the portal host:

```powershell
cd employee-portal
pnpm caddy:render
caddy run --config Caddyfile.generated
```

Optional Caddy overrides in employee-portal `.env`:

| Variable | Default | Purpose |
|----------|---------|---------|
| `CADDY_PORTAL_UPSTREAM` | `localhost:1027` | Portal backend |
| `CADDY_DRIVE_UPSTREAM` | `localhost:1025` | Drive backend |
| `CADDY_TLS` | infer from URL scheme | `auto` = HTTPS blocks, `off` = HTTP |

## Migration

If drive had its own `auth_user` table, run [merge-auth-users.ts](../../drive/scripts/merge-auth-users.ts) in the PHH-DRIVE repo.
