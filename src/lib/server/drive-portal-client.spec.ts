import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('$app/env/private', () => ({
	DRIVE_ORIGIN: 'http://drive.local.test',
	DRIVE_TEAM_API_KEY: 'znltv_test_key',
	DRIVE_STORAGE_PROVIDER: 'local'
}));

describe('drive-portal-client', () => {
	beforeEach(() => {
		vi.stubGlobal(
			'fetch',
			vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
				const url = String(input);
				const method = init?.method ?? 'GET';

				if (url.includes('/api/drive/files?') && method === 'GET') {
					return new Response(JSON.stringify({ files: [] }), { status: 200 });
				}
				if (url.includes('/api/drive/folders') && method === 'POST') {
					const body = JSON.parse(String(init?.body)) as { name: string };
					return new Response(
						JSON.stringify({ ok: true, id: `folder-${body.name}`, name: body.name }),
						{ status: 200 }
					);
				}
				if (url.includes('/api/drive/upload?') && method === 'POST') {
					return new Response(
						JSON.stringify({ ok: true, created: [{ id: 'file-1', name: 'a.png' }] }),
						{ status: 200 }
					);
				}
				if (url.includes('/public-link') && method === 'POST') {
					return new Response(
						JSON.stringify({
							ok: true,
							fileDirectUrl: '/api/public/files/tok123'
						}),
						{ status: 200 }
					);
				}
				return new Response('not found', { status: 404 });
			})
		);
	});

	afterEach(() => {
		vi.unstubAllGlobals();
		vi.resetModules();
	});

	it('buildDriveAuthHeaders sets bearer token', async () => {
		const { buildDriveAuthHeaders } = await import('./drive-portal-client');
		const headers = buildDriveAuthHeaders();
		expect(headers.get('Authorization')).toBe('Bearer znltv_test_key');
	});

	it('absolutizeDriveUrl prefixes drive origin', async () => {
		const { absolutizeDriveUrl } = await import('./drive-portal-client');
		expect(absolutizeDriveUrl('/api/public/files/tok')).toBe(
			'http://drive.local.test/api/public/files/tok'
		);
	});

	it('uploadToCategory creates folders, uploads, and returns public url', async () => {
		const { uploadToCategory } = await import('./drive-portal-client');
		const bytes = new Uint8Array([1, 2, 3]);
		const result = await uploadToCategory('facilities', 'photo.png', 'image/png', bytes);
		expect(result.url).toBe('http://drive.local.test/api/public/files/tok123');
		expect(result.id).toBe('file-1');
	});
});
