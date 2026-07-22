# Employee Portal

SvelteKit app for the PHH employee portal. Uses **npm** for all scripts and dependencies.

## Setup

```sh
npm install
cp .env.example .env   # if present; configure DATABASE_URL, ORIGIN, BETTER_AUTH_SECRET, etc.
```

## Developing

```sh
npm run dev
```

Dev server: `http://localhost:1027` (or your `ORIGIN` behind Caddy for SSO).

For SSO and sign-in, browse `ORIGIN` (e.g. `http://portal.local.test`), not raw localhost — see [docs/shared-auth-sso.md](docs/shared-auth-sso.md#login-troubleshooting).

## Building

```sh
npm run build
npm run preview   # preview production build locally
npm start         # run production build (node build/index.js)
```

## Database

```sh
npm run db:push       # push schema to Postgres
npm run db:generate   # generate migrations
npm run db:migrate    # run migrations
npm run auth:schema   # regenerate auth.schema.ts after Better Auth config changes
```

## Quality

```sh
npm run check   # svelte-check
npm run lint    # prettier + eslint
npm test        # unit + e2e
```

## Shared SSO with PHH-DRIVE

employee-portal is the main app and runs the local Caddy reverse proxy.

```sh
# One-time (Administrator PowerShell)
powershell -ExecutionPolicy Bypass -File scripts/setup-local-sso-hosts.ps1

# Dev stack: portal + drive apps, then proxy
npm run dev              # this repo (:1027)
npm run caddy:dev        # proxy ORIGIN + DRIVE_ORIGIN from .env
```

PHH-DRIVE (`../drive`) also needs its own dev server on port 1025.

See [docs/shared-auth-sso.md](docs/shared-auth-sso.md).

## Docker

```sh
npm run docker:up              # local Postgres + app (docker compose up --build)
npm run docker:build:local     # image: employee-portal:latest
npm run docker:build           # image: ghcr.io/punhlaingsoftwareengineering/employee-portal:latest
npm run docker:push            # push to GHCR (after docker login)
```

For tagged GHCR builds, copy `scripts/docker-ghcr.env.example` → `scripts/docker-ghcr.env`, then run `scripts/docker-build.ps1` / `scripts/docker-push.ps1` (or `.sh` on Linux/macOS).
