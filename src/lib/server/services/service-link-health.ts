import { normalizeServiceUrl } from '$lib/constants/service-link';

const CHECK_TIMEOUT_MS = 5000;

export type ServiceLinkHealth = 'up' | 'down';

function isHttpUrl(url: string): boolean {
	try {
		const parsed = new URL(url);
		return parsed.protocol === 'http:' || parsed.protocol === 'https:';
	} catch {
		return false;
	}
}

function isUpStatus(status: number): boolean {
	return status >= 200 && status < 400;
}

async function probeUrl(url: string, method: 'HEAD' | 'GET'): Promise<Response> {
	const controller = new AbortController();
	const timeout = setTimeout(() => controller.abort(), CHECK_TIMEOUT_MS);

	try {
		return await fetch(url, {
			method,
			signal: controller.signal,
			redirect: 'follow',
			headers: { 'user-agent': 'EmployeePortal-LinkCheck/1.0' }
		});
	} finally {
		clearTimeout(timeout);
	}
}

export async function checkServiceLinkHealth(rawUrl: string): Promise<ServiceLinkHealth> {
	const url = normalizeServiceUrl(rawUrl);
	if (!isHttpUrl(url)) return 'down';

	try {
		const headResponse = await probeUrl(url, 'HEAD');
		if (isUpStatus(headResponse.status)) return 'up';
		if (headResponse.status !== 405 && headResponse.status !== 501) return 'down';

		const getResponse = await probeUrl(url, 'GET');
		return isUpStatus(getResponse.status) ? 'up' : 'down';
	} catch {
		try {
			const getResponse = await probeUrl(url, 'GET');
			return isUpStatus(getResponse.status) ? 'up' : 'down';
		} catch {
			return 'down';
		}
	}
}

export async function mapWithConcurrency<T, R>(
	items: T[],
	limit: number,
	fn: (item: T) => Promise<R>
): Promise<R[]> {
	if (items.length === 0) return [];

	const results = new Array<R>(items.length);
	let index = 0;

	async function worker() {
		while (index < items.length) {
			const current = index++;
			results[current] = await fn(items[current]);
		}
	}

	const workers = Array.from({ length: Math.min(limit, items.length) }, () => worker());
	await Promise.all(workers);
	return results;
}
