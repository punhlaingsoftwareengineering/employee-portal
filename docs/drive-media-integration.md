# Portal media on PHH-DRIVE

Employee portal admin forms can upload images, PDFs, videos, and audio to **PHH-DRIVE** instead of pasting external URLs. Files are stored under team folders and exposed via public direct links.

## Setup

Add to portal `.env` (server-side only — never expose to the browser):

```env
DRIVE_ORIGIN=http://drive.local.test
DRIVE_TEAM_API_KEY=znltv_...
DRIVE_STORAGE_PROVIDER=local
```

| Variable | Required | Description |
| -------- | -------- | ----------- |
| `DRIVE_ORIGIN` | Yes | Same as SSO — drive public URL (browser-facing links) |
| `DRIVE_INTERNAL_ORIGIN` | No | Server-side drive API URL when `DRIVE_ORIGIN` is not reachable from the container (Docker). Falls back to `DRIVE_ORIGIN`. |
| `DRIVE_TEAM_API_KEY` | Yes | Team key (`znltv_…`) with `drive.read`, `drive.write`, `drive.share` |
| `DRIVE_STORAGE_PROVIDER` | No | `local` (default) or `tigris` — must match the team |

Create the key in **PHH-DRIVE → Team settings → Developer API** (owner/admin + Profile developer mode).

Restart the portal after changing env vars.

## Docker production

When the portal runs in Docker behind Caddy, the container cannot resolve the public drive hostname. Set an internal URL for server-side API calls:

```env
DRIVE_ORIGIN=http://drive.phh.com
DRIVE_INTERNAL_ORIGIN=http://host.docker.internal:1025
DRIVE_STORAGE_PROVIDER=local
DRIVE_TEAM_API_KEY=znltv_...
```

With a shared Docker network (`phh-net`), prefer container DNS:

```env
DRIVE_INTERNAL_ORIGIN=http://phh-drive:1025
```

Keep `DRIVE_ORIGIN` as the browser-facing URL — returned file URLs and SSO redirects use it. Match `DRIVE_STORAGE_PROVIDER` to the team drive (`local` on this host).

## Folder layout

First upload per category creates folders under the team drive root:

```
portal/
  announcements/
  facilities/
  notifications/
  onboarding-slides/
  tool-guides/
  tool-learnings/
  newsletters/
  notification-sounds/
  apps/
  services/
  branding/
```

## UI

Admin forms show a URL field plus **Upload** (opens picker: drag-drop, browse existing, trash). Stored value is the drive public file URL (`{DRIVE_ORIGIN}/api/public/files/{token}`).

External navigation links (announcement link, service link) stay plain URL fields. App download URLs (`.exe`, `.apk`, `.zip`, etc.) support PHH-DRIVE upload via **Upload** on each platform row in the app admin dialog.

## API (portal)

Cookie session + admin only:

| Method | Path |
| ------ | ---- |
| `GET` | `/api/drive-media/[category]` |
| `POST` | `/api/drive-media/[category]/upload` |
| `POST` | `/api/drive-media/[category]/pick` |
| `DELETE` | `/api/drive-media/[category]/[fileId]` |

Returns **503** if `DRIVE_TEAM_API_KEY` is unset.

## Local dev

1. Run drive (`pnpm dev` on port 1025) and portal with matching `DRIVE_ORIGIN` / SSO vars.
2. Set `DRIVE_TEAM_API_KEY` in portal `.env`.
3. Open portal **Settings** or any admin dialog with media fields.

See also [shared-auth-sso.md](./shared-auth-sso.md) and [drive shared-auth-sso.md](../../drive/docs/shared-auth-sso.md).
