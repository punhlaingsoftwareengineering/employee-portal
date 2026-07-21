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
| employee-portal | `DRIVE_ORIGIN` | `http://drive.local.test` | `https://drive.phh.com` |
| employee-portal | `DOCS_ORIGIN` | `http://docs.local.test` | `https://docs.phh.com` |
| employee-portal | `OAI_ORDER_SENDER_ORIGIN` | `http://oai-order-sender.local.test` | `https://ordersenderoai.phh.com` |
| employee-portal | `N8N_CHATBOT_ORIGIN` | `http://chatbot.local.test` | `https://chatbotn8n.phh.com` |
| employee-portal | `N8N_MONITOR_ORIGIN` | `http://monitor.local.test` | `https://monitorn8n.phh.com` |
| employee-portal | `PHH_CALLTRACKER_DASHBOARD_ORIGIN` | `http://dashboardroutetracker.local.test` | `https://dashboardroutetracker.phh.com` |
| PHH-DRIVE | `ORIGIN` | `http://drive.local.test` | `https://drive.phh.com` |
| PHH-DRIVE | `PORTAL_ORIGIN` | `http://portal.local.test` | `https://phh.com` |
| docs | `ORIGIN` | `http://docs.local.test` | `https://docs.phh.com` |
| docs | `PORTAL_ORIGIN` | `http://portal.local.test` | `https://phh.com` |
| OAI Order Sender | `ORIGIN` | `http://oai-order-sender.local.test` | `https://ordersenderoai.phh.com` |
| OAI Order Sender | `PORTAL_ORIGIN` | `http://portal.local.test` | `https://phh.com` |

Portal also accepts `PORTAL_TRUSTED_REDIRECT_ORIGINS` (defaults to trusting sibling `*_ORIGIN` values when set).

`DRIVE_ORIGIN` syncs the **PHH-DRIVE** service tile link on portal startup (no manual SQL when env is set).

`DOCS_ORIGIN` syncs the **Docs** service tile link on portal startup. Grant CMS access via **Settings â†’ Access roles** (assign Docs service).

`OAI_ORDER_SENDER_ORIGIN` syncs the **OAI Order Sender** service tile on portal startup. Grant access via **Settings → Access roles** (assign OAI Order Sender service).

`N8N_CHATBOT_ORIGIN` syncs the **N8N Chatbot** service tile. `N8N_MONITOR_ORIGIN` syncs **N8N Monitor**. `PHH_CALLTRACKER_DASHBOARD_ORIGIN` syncs **PHH CallTracker Dashboard**.

`MARI_CHATBOT_ORIGIN` syncs the **Mari Chatbot** service tile on portal startup. Grant access via **Settings â†’ Access roles** (assign Mari Chatbot service).

**n8n Monitor** is not a portal built-in. Create the Tools service manually, set `N8N_MONITOR_SERVICE_ID` on the monitor app to that UUID, add `http://monitorn8n.phh.com` (UAT: `http://monitorn8n.uat.phh.com`) to `PORTAL_TRUSTED_REDIRECT_ORIGINS`, and grant access via **Settings â†’ Access roles**.

**Call Tracker** is not a portal built-in. Create the Tools service manually, set `PORTAL_SERVICE_ID` on the calltracker app to that UUID, add `http://dashboardroutetracker.phh.com` to `PORTAL_TRUSTED_REDIRECT_ORIGINS`, and grant access via **Settings â†’ Access roles**.

Portal admin media uploads (images, PDFs, video, audio) use `DRIVE_TEAM_API_KEY` server-side â€” see [drive-media-integration.md](./drive-media-integration.md).

## Local dev

employee-portal owns the reverse proxy. Domains come from `.env`:

```env
ORIGIN=http://portal.local.test
DRIVE_ORIGIN=http://drive.local.test
DOCS_ORIGIN=http://docs.local.test
OAI_ORDER_SENDER_ORIGIN=http://oai-order-sender.local.test
N8N_CHATBOT_ORIGIN=http://chatbot.local.test
N8N_MONITOR_ORIGIN=http://monitor.local.test
PHH_CALLTRACKER_DASHBOARD_ORIGIN=http://dashboardroutetracker.local.test
AUTH_COOKIE_DOMAIN=.local.test
PORTAL_TRUSTED_REDIRECT_ORIGINS=http://n8n-monitor.local.test
CADDY_DOCS_UPSTREAM=localhost:1026
CADDY_OAI_ORDER_SENDER_UPSTREAM=localhost:6002
```

1. **Hosts** (Administrator PowerShell, one-time):

   ```powershell
   cd employee-portal
   powershell -ExecutionPolicy Bypass -File scripts/setup-local-sso-hosts.ps1
   ```

2. **Install Caddy** (if needed): `winget install -e --id CaddyServer.Caddy`

3. **Start apps** (terminals):

   ```powershell
   cd employee-portal && pnpm dev
   cd drive && pnpm dev
   cd docs && pnpm dev
   cd OAI_ORDER_SENDER && npm run dev
   cd employee-portal && pnpm caddy:dev
   ```

4. Browse the URLs from `ORIGIN`, `DRIVE_ORIGIN`, `DOCS_ORIGIN`, and `OAI_ORDER_SENDER_ORIGIN` (not raw `localhost` ports).

`pnpm caddy:dev` renders `Caddyfile.generated` from `.env` then starts Caddy.

## Login troubleshooting

- Always open the portal at `ORIGIN` (e.g. `http://portal.local.test` via Caddy), not `http://localhost:1027`. A host that is not in Better Auth `trustedOrigins` causes sign-in to fail with **400** and a message such as Invalid origin.
- Wrong email/password also returns **400**; the login card shows the Better Auth error message — that is expected.
- Auth forms post to absolute paths (`/auth/login?/signInEmail`, etc.) so a delayed submit after redirect from a private page (e.g. `/community/manage`) does not hit **405 Method Not Allowed**.
- Console errors from `Grammarly.js`, `Agents-MessageBusClient`, or `inject_main.js` (often `crypto.randomUUID is not a function` on HTTP) come from browser extensions, not the portal app.

## Production

Set production URLs in each app's `.env`:

**employee-portal**

```env
ORIGIN=https://phh.com
DRIVE_ORIGIN=https://drive.phh.com
DOCS_ORIGIN=https://docs.phh.com
OAI_ORDER_SENDER_ORIGIN=https://ordersenderoai.phh.com
N8N_CHATBOT_ORIGIN=https://chatbotn8n.phh.com
N8N_MONITOR_ORIGIN=https://monitorn8n.phh.com
PHH_CALLTRACKER_DASHBOARD_ORIGIN=https://dashboardroutetracker.phh.com
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
ORIGIN=https://drive.phh.com
PORTAL_ORIGIN=https://phh.com
AUTH_COOKIE_DOMAIN=.phh.com
```

**docs**

```env
ORIGIN=https://docs.phh.com
PORTAL_ORIGIN=https://phh.com
AUTH_COOKIE_DOMAIN=.phh.com
AUTH_DATABASE_URL=<portal postgres>
PORTAL_DATABASE_URL=<portal postgres>
DATABASE_URL=<cms postgres>
```

**OAI Order Sender**

```env
ORIGIN=https://ordersenderoai.phh.com
PORTAL_ORIGIN=https://phh.com
AUTH_COOKIE_DOMAIN=.phh.com
AUTH_DATABASE_URL=<portal postgres>
PORTAL_DATABASE_URL=<portal postgres>
KOGYITHURA_API_BASE=http://127.0.0.1:5678/webhook
```

**Mari Chatbot**

```env
ORIGIN=http://chatbotn8n.phh.com
PORTAL_ORIGIN=http://phh.com
AUTH_COOKIE_DOMAIN=.phh.com
AUTH_DATABASE_URL=<portal postgres>
PORTAL_DATABASE_URL=<portal postgres>
DATABASE_URL=<mari cms postgres>
```

nginx (or Caddy): `chatbotn8n.phh.com` â†’ `127.0.0.1:6001`. Grant access via portal **Settings â†’ Access roles** (assign Mari Chatbot).

**n8n Monitor**

```env
ORIGIN=http://monitorn8n.phh.com
PORTAL_ORIGIN=https://phh.com
AUTH_COOKIE_DOMAIN=.phh.com
AUTH_DATABASE_URL=<portal postgres>
PORTAL_DATABASE_URL=<portal postgres>
DATABASE_URL=<n8n postgres>
N8N_MONITOR_SERVICE_ID=<uuid from Tools service>
```

Add `http://monitorn8n.phh.com` to portal `PORTAL_TRUSTED_REDIRECT_ORIGINS`. nginx: `monitorn8n.phh.com` â†’ `127.0.0.1:6003` with `proxy_buffering off` for SSE. Create the Tools service manually, paste its UUID into `N8N_MONITOR_SERVICE_ID`, then assign the service in **Settings â†’ Access roles**.

**Call Tracker**

```env
ORIGIN=http://dashboardroutetracker.phh.com
PORTAL_ORIGIN=http://phh.com
AUTH_COOKIE_DOMAIN=.phh.com
AUTH_DATABASE_URL=<portal postgres>
PORTAL_DATABASE_URL=<portal postgres>
PORTAL_SERVICE_ID=<uuid from Tools service>
```

Add `http://dashboardroutetracker.phh.com` to portal `PORTAL_TRUSTED_REDIRECT_ORIGINS`. nginx: `dashboardroutetracker.phh.com` â†’ `127.0.0.1:6004`. Create the Tools service manually, paste its UUID into `PORTAL_SERVICE_ID`, then assign the service in **Settings â†’ Access roles**.

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
