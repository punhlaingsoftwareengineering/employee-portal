import { redirect } from '@sveltejs/kit';
import { getAuthTrustedOrigins } from '$lib/server/auth-trusted-origins';

const trustedOrigins = new Set(getAuthTrustedOrigins());

/** Safe redirect target after login: same portal path or allowlisted external origin. */
export function resolveSafeRedirectTo(redirectTo: string, portalOrigin: string): string {
	const trimmed = redirectTo.trim();
	if (!trimmed) return '/dashboard';

	if (trimmed.startsWith('/') && !trimmed.startsWith('//')) {
		return trimmed;
	}

	try {
		const url = new URL(trimmed);
		const normalized = url.origin;
		if (trustedOrigins.has(normalized)) {
			return url.toString();
		}
	} catch {
		// fall through
	}

	void portalOrigin;
	return '/dashboard';
}

function isExternalLocation(location: string): boolean {
	return /^https?:\/\//i.test(location);
}

/** Redirect after auth; passes SvelteKit external allowlist for SSO targets (drive, docs). */
export function redirectSafe(
	status: 301 | 302 | 303 | 307 | 308,
	location: string
): never {
	if (isExternalLocation(location)) {
		redirect(status, location, { external: [...trustedOrigins] });
	}
	redirect(status, location);
}
