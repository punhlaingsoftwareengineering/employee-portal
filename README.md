# Employee Portal

SvelteKit app for the PHH employee portal. Uses **pnpm** for all scripts and dependencies.

## Setup

```sh
pnpm install
cp .env.example .env   # if present; configure DATABASE_URL, ORIGIN, BETTER_AUTH_SECRET, etc.
```

## Developing

```sh
pnpm dev
```

Dev server: `http://localhost:1027` (or your `ORIGIN` behind Caddy for SSO).

## Building

```sh
pnpm build
pnpm preview   # preview production build locally
pnpm start     # run production build (node build/index.js)
```

## Database

```sh
pnpm db:push       # push schema to Postgres
pnpm db:generate   # generate migrations
pnpm db:migrate    # run migrations
pnpm auth:schema   # regenerate auth.schema.ts after Better Auth config changes
```

## Quality

```sh
pnpm check   # svelte-check
pnpm lint    # prettier + eslint
pnpm test    # unit + e2e
```

## Shared SSO with PHH-DRIVE

employee-portal is the main app and runs the local Caddy reverse proxy.

```sh
# One-time (Administrator PowerShell)
powershell -ExecutionPolicy Bypass -File scripts/setup-local-sso-hosts.ps1

# Dev stack: portal + drive apps, then proxy
pnpm dev              # this repo (:1027)
pnpm caddy:dev        # proxy ORIGIN + DRIVE_ORIGIN from .env
```

PHH-DRIVE (`../drive`) also needs `pnpm dev` on port 1025.

See [docs/shared-auth-sso.md](docs/shared-auth-sso.md).

## Docker

```sh
pnpm docker:up              # local Postgres + app (docker compose up --build)
pnpm docker:build:local     # image: employee-portal:latest
pnpm docker:build           # image: ghcr.io/punhlaingsoftwareengineering/employee-portal:latest
pnpm docker:push            # push to GHCR (after docker login)
```

For tagged GHCR builds, copy `scripts/docker-ghcr.env.example` → `scripts/docker-ghcr.env`, then run `scripts/docker-build.ps1` / `scripts/docker-push.ps1` (or `.sh` on Linux/macOS).
