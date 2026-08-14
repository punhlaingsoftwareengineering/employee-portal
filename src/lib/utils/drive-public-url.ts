/** Obsolete Drive hostnames that must map to the current public host. */
const LEGACY_DRIVE_HOSTS = new Set(['drive.office.phh.com']);

const CURRENT_DRIVE_HOST = 'drive.phh.com';

/**
 * Rewrite stored Drive public URLs after the hostname rename
 * (`drive.office.phh.com` → `drive.phh.com`) and prefer HTTPS.
 */
export function normalizePublicDriveUrl(url: string | null | undefined): string {
	const raw = url?.trim() ?? '';
	if (!raw) return '';

	try {
		const parsed = new URL(raw);
		const host = parsed.hostname.toLowerCase();
		if (LEGACY_DRIVE_HOSTS.has(host) || host === CURRENT_DRIVE_HOST) {
			parsed.hostname = CURRENT_DRIVE_HOST;
			parsed.protocol = 'https:';
			return parsed.toString();
		}
	} catch {
		return raw
			.replace(/drive\.office\.phh\.com/gi, CURRENT_DRIVE_HOST)
			.replace(/^http:\/\/drive\.phh\.com/i, `https://${CURRENT_DRIVE_HOST}`);
	}

	return raw;
}
