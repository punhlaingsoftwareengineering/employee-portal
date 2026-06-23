/** Client-safe helpers for service link URLs. */

function parseHostname(url: string): string | null {
	try {
		return new URL(url).hostname;
	} catch {
		return null;
	}
}

function isPrivateIpv4(hostname: string): boolean {
	const parts = hostname.split('.').map((part) => Number(part));
	if (parts.length !== 4 || parts.some((part) => Number.isNaN(part))) return false;
	if (parts[0] === 10) return true;
	if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;
	if (parts[0] === 192 && parts[1] === 168) return true;
	return false;
}

/** True for localhost, RFC1918, and .local hostnames. */
export function isPrivateNetworkServiceUrl(url: string): boolean {
	const hostname = parseHostname(url);
	if (!hostname) return false;
	if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1') return true;
	if (hostname.endsWith('.local')) return true;
	return isPrivateIpv4(hostname);
}

export function normalizeServiceUrl(url: string): string {
	return url.trim().replace(/[,;]\s*$/, '');
}
