import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mockEnv = vi.hoisted(() => ({
	DRIVE_ORIGIN: 'http://drive.local.test',
	DRIVE_INTERNAL_ORIGIN: undefined as string | undefined,
	DRIVE_TEAM_API_KEY: 'znltv_test_key',
	DRIVE_STORAGE_PROVIDER: 'local'
}));

vi.mock('$app/env/private', () => mockEnv);

describe('drive-portal-client', () => {
	let fetchMock: ReturnType<typeof vi.fn>;

	beforeEach(() => {
		mockEnv.DRIVE_ORIGIN = 'http://drive.local.test';
		mockEnv.DRIVE_INTERNAL_ORIGIN = undefined;

		fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
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
		});
		vi.stubGlobal('fetch', fetchMock);
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

	it('uses DRIVE_INTERNAL_ORIGIN for API calls and DRIVE_ORIGIN for public URLs', async () => {
		mockEnv.DRIVE_ORIGIN = 'http://drive.phh.com';
		mockEnv.DRIVE_INTERNAL_ORIGIN = 'http://host.docker.internal:1025';

		const { uploadToCategory } = await import('./drive-portal-client');
		const bytes = new Uint8Array([1, 2, 3]);
		const result = await uploadToCategory('apps', 'logo.png', 'image/png', bytes);

		expect(result.url).toBe('http://drive.phh.com/api/public/files/tok123');

		const apiUrls = fetchMock.mock.calls.map(([input]) => String(input));
		expect(apiUrls.every((url) => url.startsWith('http://host.docker.internal:1025'))).toBe(true);

		const hosts = fetchMock.mock.calls.map(
			([, init]) => (init as RequestInit | undefined)?.headers as Headers | undefined
		);
		expect(hosts[0]?.get('Host')).toBe('drive.phh.com');
	});

	it('rewrites https Docker-internal Drive origins to http', async () => {
		const { normalizeDriveApiOrigin } = await import('./drive-portal-client');
		expect(normalizeDriveApiOrigin('https://phh-drive:1025')).toBe('http://phh-drive:1025');
		expect(normalizeDriveApiOrigin('https://uat-phh-drive:1025/')).toBe(
			'http://uat-phh-drive:1025'
		);
		expect(normalizeDriveApiOrigin('https://host.docker.internal:1025')).toBe(
			'http://host.docker.internal:1025'
		);
		expect(normalizeDriveApiOrigin('https://drive.phh.com')).toBe('https://drive.phh.com');
	});

	it('rewrites https DRIVE_INTERNAL_ORIGIN when uploading', async () => {
		mockEnv.DRIVE_ORIGIN = 'https://drive.phh.com';
		mockEnv.DRIVE_INTERNAL_ORIGIN = 'https://phh-drive:1025';

		const { uploadToCategory } = await import('./drive-portal-client');
		const bytes = new Uint8Array([1, 2, 3]);
		const result = await uploadToCategory('apps', 'logo.png', 'image/png', bytes);

		expect(result.url).toBe('https://drive.phh.com/api/public/files/tok123');
		const apiUrls = fetchMock.mock.calls.map(([input]) => String(input));
		expect(apiUrls.every((url) => url.startsWith('http://phh-drive:1025'))).toBe(true);
	});
});
