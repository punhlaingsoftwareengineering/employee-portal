# Shared Better Auth SSO (employee-portal â†” PHH-DRIVE â†” docs â†” OmegaAi Order Resend â†” Mari Chatbot â†” n8n Monitor â†” Call Tracker)

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
| employee-portal | `ORDER_RESEND_ORIGIN` | `http://order-resend.local.test` | `https://order-resend.office.phh.com` |
| employee-portal | `MARI_CHATBOT_ORIGIN` | `http://chatbot.local.test` | `http://chatbot.n8n.phh.com` |
| PHH-DRIVE | `ORIGIN` | `http://drive.local.test` | `https://office.drive.phh.com` |
| PHH-DRIVE | `PORTAL_ORIGIN` | `http://portal.local.test` | `https://phh.com` |
| docs | `ORIGIN` | `http://docs.local.test` | `https://docs.example.com` |
| docs | `PORTAL_ORIGIN` | `http://portal.local.test` | `https://phh.com` |
| OmegaAi Order Resend | `ORIGIN` | `http://order-resend.local.test` | `https://order-resend.office.phh.com` |
| OmegaAi Order Resend | `PORTAL_ORIGIN` | `http://portal.local.test` | `https://phh.com` |
| Mari Chatbot | `ORIGIN` | `http://chatbot.local.test` | `http://chatbot.n8n.phh.com` |
| Mari Chatbot | `PORTAL_ORIGIN` | `http://portal.local.test` | `https://phh.com` |
| n8n Monitor | `ORIGIN` | `http://n8n-monitor.local.test` | `http://monitor.n8n.phh.com` |
| n8n Monitor | `PORTAL_ORIGIN` | `http://portal.local.test` | `https://phh.com` |
| Call Tracker | `ORIGIN` | `http://calltracker.local.test` | `http://calltracker.office.phh.com` |
| Call Tracker | `PORTAL_ORIGIN` | `http://portal.local.test` | `http://phh.com` |

Portal also accepts `PORTAL_TRUSTED_REDIRECT_ORIGINS` (defaults to trusting sibling `*_ORIGIN` values when set).

`DRIVE_ORIGIN` syncs the **PHH-DRIVE** service tile link on portal startup (no manual SQL when env is set).

`DOCS_ORIGIN` syncs the **Docs** service tile link on portal startup. Grant CMS access via **Settings â†’ Access roles** (assign Docs service).

`ORDER_RESEND_ORIGIN` syncs the **OmegaAi Order Resend** service tile on portal startup. Grant access via **Settings â†’ Access roles** (assign OmegaAi Order Resend service).

`MARI_CHATBOT_ORIGIN` syncs the **Mari Chatbot** service tile on portal startup. Grant access via **Settings â†’ Access roles** (assign Mari Chatbot service).

**n8n Monitor** is not a portal built-in. Create the Tools service manually, set `N8N_MONITOR_SERVICE_ID` on the monitor app to that UUID, add `http://monitor.n8n.phh.com` (UAT: `http://monitor.n8n.uat.phh.com`) to `PORTAL_TRUSTED_REDIRECT_ORIGINS`, and grant access via **Settings â†’ Access roles**.

**Call Tracker** is not a portal built-in. Create the Tools service manually, set `PORTAL_SERVICE_ID` on the calltracker app to that UUID, add `http://calltracker.office.phh.com` to `PORTAL_TRUSTED_REDIRECT_ORIGINS`, and grant access via **Settings â†’ Access roles**.

Portal admin media uploads (images, PDFs, video, audio) use `DRIVE_TEAM_API_KEY` server-side â€” see [drive-media-integration.md](./drive-media-integration.md).

## Local dev

employee-portal owns the reverse proxy. Domains come from `.env`:

```env
ORIGIN=http://portal.local.test
DRIVE_ORIGIN=http://drive.local.test
DOCS_ORIGIN=http://docs.local.test
ORDER_RESEND_ORIGIN=http://order-resend.local.test
MARI_CHATBOT_ORIGIN=http://chatbot.local.test
AUTH_COOKIE_DOMAIN=.local.test
PORTAL_TRUSTED_REDIRECT_ORIGINS=http://n8n-monitor.local.test
CADDY_DOCS_UPSTREAM=localhost:1026
CADDY_ORDER_RESEND_UPSTREAM=localhost:6002
CADDY_MARI_CHATBOT_UPSTREAM=localhost:5173
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
   cd OmegaAi_Order_Resend && npm run dev
   cd mari-chatbot && npm run dev
   cd n8n-monitor && npm run dev
   cd employee-portal && pnpm caddy:dev
   ```

4. Browse the URLs from `ORIGIN`, `DRIVE_ORIGIN`, `DOCS_ORIGIN`, `ORDER_RESEND_ORIGIN`, `MARI_CHATBOT_ORIGIN`, and n8n Monitor `ORIGIN` (not raw `localhost` ports).
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
DRIVE_ORIGIN=https://office.drive.phh.com
DOCS_ORIGIN=https://docs.example.com
ORDER_RESEND_ORIGIN=https://order-resend.office.phh.com
MARI_CHATBOT_ORIGIN=http://chatbot.n8n.phh.com
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

**OmegaAi Order Resend**

```env
ORIGIN=https://order-resend.office.phh.com
PORTAL_ORIGIN=https://phh.com
AUTH_COOKIE_DOMAIN=.phh.com
AUTH_DATABASE_URL=<portal postgres>
PORTAL_DATABASE_URL=<portal postgres>
KOGYITHURA_API_BASE=http://127.0.0.1:5678/webhook
```

**Mari Chatbot**

```env
ORIGIN=http://chatbot.n8n.phh.com
PORTAL_ORIGIN=http://phh.com
AUTH_COOKIE_DOMAIN=.phh.com
AUTH_DATABASE_URL=<portal postgres>
PORTAL_DATABASE_URL=<portal postgres>
DATABASE_URL=<mari cms postgres>
```

nginx (or Caddy): `chatbot.n8n.phh.com` â†’ `127.0.0.1:6001`. Grant access via portal **Settings â†’ Access roles** (assign Mari Chatbot).

**n8n Monitor**

```env
ORIGIN=http://monitor.n8n.phh.com
PORTAL_ORIGIN=https://phh.com
AUTH_COOKIE_DOMAIN=.phh.com
AUTH_DATABASE_URL=<portal postgres>
PORTAL_DATABASE_URL=<portal postgres>
DATABASE_URL=<n8n postgres>
N8N_MONITOR_SERVICE_ID=<uuid from Tools service>
```

Add `http://monitor.n8n.phh.com` to portal `PORTAL_TRUSTED_REDIRECT_ORIGINS`. nginx: `monitor.n8n.phh.com` â†’ `127.0.0.1:6003` with `proxy_buffering off` for SSE. Create the Tools service manually, paste its UUID into `N8N_MONITOR_SERVICE_ID`, then assign the service in **Settings â†’ Access roles**.

**Call Tracker**

```env
ORIGIN=http://calltracker.office.phh.com
PORTAL_ORIGIN=http://phh.com
AUTH_COOKIE_DOMAIN=.phh.com
AUTH_DATABASE_URL=<portal postgres>
PORTAL_DATABASE_URL=<portal postgres>
PORTAL_SERVICE_ID=<uuid from Tools service>
```

Add `http://calltracker.office.phh.com` to portal `PORTAL_TRUSTED_REDIRECT_ORIGINS`. nginx: `calltracker.office.phh.com` â†’ `127.0.0.1:6004`. Create the Tools service manually, paste its UUID into `PORTAL_SERVICE_ID`, then assign the service in **Settings â†’ Access roles**.

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
| `CADDY_ORDER_RESEND_UPSTREAM` | `localhost:6002` | OmegaAi Order Resend backend |
| `CADDY_MARI_CHATBOT_UPSTREAM` | `localhost:5173` | Mari Chatbot Vite/dev (or `localhost:6001` for Docker) |
| `CADDY_TLS` | infer from URL scheme | `auto` = HTTPS blocks, `off` = HTTP |

## Migration

If drive had its own `auth_user` table, run [merge-auth-users.ts](../../drive/scripts/merge-auth-users.ts) in the PHH-DRIVE repo.

If docs had standalone auth (GitHub, invites, 2FA), users sign in via portal once; assign Docs service in portal access roles.
