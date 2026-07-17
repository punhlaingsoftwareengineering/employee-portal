# Shared Better Auth SSO (employee-portal ↔ PHH-DRIVE ↔ docs ↔ OAI Order Sender)

All apps must use the **same** values for:

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
| employee-portal | `DOCS_ORIGIN` | `http://docs.local.test` | `https://docs.example.com` |
| employee-portal | `OAI_ORDER_SENDER_ORIGIN` | `http://oai-order-sender.local.test` | `https://ordersender.oai.phh.com` |
| employee-portal | `N8N_CHATBOT_ORIGIN` | `http://chatbot.local.test` | `https://chatbot.n8n.phh.com` |
| employee-portal | `N8N_MONITOR_ORIGIN` | `http://monitor.local.test` | `https://monitor.n8n.phh.com` |
| employee-portal | `PHH_CALLTRACKER_DASHBOARD_ORIGIN` | `http://dashboard.routetracker.local.test` | `https://dashboard.routetracker.phh.com` |
| PHH-DRIVE | `ORIGIN` | `http://drive.local.test` | `https://office.drive.phh.com` |
| PHH-DRIVE | `PORTAL_ORIGIN` | `http://portal.local.test` | `https://phh.com` |
| docs | `ORIGIN` | `http://docs.local.test` | `https://docs.example.com` |
| docs | `PORTAL_ORIGIN` | `http://portal.local.test` | `https://phh.com` |
| OAI Order Sender | `ORIGIN` | `http://oai-order-sender.local.test` | `https://ordersender.oai.phh.com` |
| OAI Order Sender | `PORTAL_ORIGIN` | `http://portal.local.test` | `https://phh.com` |

Portal also accepts `PORTAL_TRUSTED_REDIRECT_ORIGINS` (defaults to trusting `DRIVE_ORIGIN` and `DOCS_ORIGIN` when set).

`DRIVE_ORIGIN` syncs the **PHH-DRIVE** service tile link on portal startup (no manual SQL when env is set).

`DOCS_ORIGIN` syncs the **Docs** service tile link on portal startup. Grant CMS access via **Settings → Access roles** (assign Docs service).

`OAI_ORDER_SENDER_ORIGIN` syncs the **OAI Order Sender** service tile on portal startup. Grant access via **Settings → Access roles** (assign OAI Order Sender service).

`N8N_CHATBOT_ORIGIN` syncs the **N8N Chatbot** service tile. `N8N_MONITOR_ORIGIN` syncs **N8N Monitor**. `PHH_CALLTRACKER_DASHBOARD_ORIGIN` syncs **PHH CallTracker Dashboard**.

Portal admin media uploads (images, PDFs, video, audio) use `DRIVE_TEAM_API_KEY` server-side — see [drive-media-integration.md](./drive-media-integration.md).

## Local dev

employee-portal owns the reverse proxy. Domains come from `.env`:

```env
ORIGIN=http://portal.local.test
DRIVE_ORIGIN=http://drive.local.test
DOCS_ORIGIN=http://docs.local.test
OAI_ORDER_SENDER_ORIGIN=http://oai-order-sender.local.test
N8N_CHATBOT_ORIGIN=http://chatbot.local.test
N8N_MONITOR_ORIGIN=http://monitor.local.test
PHH_CALLTRACKER_DASHBOARD_ORIGIN=http://dashboard.routetracker.local.test
AUTH_COOKIE_DOMAIN=.local.test
CADDY_DOCS_UPSTREAM=localhost:1026
CADDY_OAI_ORDER_SENDER_UPSTREAM=localhost:6002
```

1. **Hosts** (Administrator PowerShell, one-time):

   ```powershell
   cd employee-portal
   powershell -ExecutionPolicy Bypass -File scripts/setup-local-sso-hosts.ps1
   ```

2. **Install Caddy** (if needed): `winget install -e --id CaddyServer.Caddy`

3. **Start apps** (five terminals):

   ```powershell
   cd employee-portal && pnpm dev
   cd drive && pnpm dev
   cd docs && pnpm dev
   cd OAI_ORDER_SENDER && npm run dev
   cd employee-portal && pnpm caddy:dev
   ```

4. Browse the URLs from `ORIGIN`, `DRIVE_ORIGIN`, `DOCS_ORIGIN`, and `OAI_ORDER_SENDER_ORIGIN` (not raw `localhost` ports).

`pnpm caddy:dev` renders `Caddyfile.generated` from `.env` then starts Caddy.

## Production

Set production URLs in each app's `.env`:

**employee-portal**

```env
ORIGIN=https://phh.com
DRIVE_ORIGIN=https://office.drive.phh.com
DOCS_ORIGIN=https://docs.example.com
OAI_ORDER_SENDER_ORIGIN=https://ordersender.oai.phh.com
N8N_CHATBOT_ORIGIN=https://chatbot.n8n.phh.com
N8N_MONITOR_ORIGIN=https://monitor.n8n.phh.com
PHH_CALLTRACKER_DASHBOARD_ORIGIN=https://dashboard.routetracker.phh.com
AUTH_COOKIE_DOMAIN=.phh.com
```

**Docker** (portal container cannot reach public drive hostname for server-side uploads):

```env
DRIVE_INTERNAL_ORIGIN=http://host.docker.internal:1025
DRIVE_STORAGE_PROVIDER=tigris
DRIVE_TEAM_API_KEY=znltv_...
```

With a shared Docker network, use `DRIVE_INTERNAL_ORIGIN=http://phh-drive:1025` instead. See [drive-media-integration.md](./drive-media-integration.md).

**PHH-DRIVE**

```env
ORIGIN=https://office.drive.phh.com
PORTAL_ORIGIN=https://phh.com
AUTH_COOKIE_DOMAIN=.phh.com
```

**docs**

```env
ORIGIN=https://docs.example.com
PORTAL_ORIGIN=https://phh.com
AUTH_COOKIE_DOMAIN=.phh.com
AUTH_DATABASE_URL=<portal postgres>
PORTAL_DATABASE_URL=<portal postgres>
DATABASE_URL=<cms postgres>
```

**OAI Order Sender**

```env
ORIGIN=https://ordersender.oai.phh.com
PORTAL_ORIGIN=https://phh.com
AUTH_COOKIE_DOMAIN=.phh.com
AUTH_DATABASE_URL=<portal postgres>
PORTAL_DATABASE_URL=<portal postgres>
KOGYITHURA_API_BASE=http://127.0.0.1:5678/webhook
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
| `CADDY_DOCS_UPSTREAM` | `localhost:1026` | Docs backend |
| `CADDY_OAI_ORDER_SENDER_UPSTREAM` | `localhost:6002` | OAI Order Sender backend |
| `CADDY_TLS` | infer from URL scheme | `auto` = HTTPS blocks, `off` = HTTP |

## Migration

If drive had its own `auth_user` table, run [merge-auth-users.ts](../../drive/scripts/merge-auth-users.ts) in the PHH-DRIVE repo.

If docs had standalone auth (GitHub, invites, 2FA), users sign in via portal once; assign Docs service in portal access roles.
