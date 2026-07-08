import { describe, expect, it, vi, beforeEach } from 'vitest';

vi.mock('$lib/server/auth-guard', () => ({
	requireAdmin: vi.fn().mockResolvedValue({ isAdmin: true })
}));

vi.mock('$lib/server/drive-portal-client', () => ({
	listCategoryFiles: vi.fn().mockResolvedValue([]),
	DrivePortalNotConfiguredError: class DrivePortalNotConfiguredError extends Error {
		name = 'DrivePortalNotConfiguredError';
	}
}));

describe('GET /api/drive-media/[category]', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('rejects invalid category', async () => {
		const { GET } = await import('./[category]/+server');
		await expect(
			GET({ params: { category: 'not-real' } } as never)
		).rejects.toMatchObject({ status: 400 });
	});

	it('lists files for valid category', async () => {
		const client = await import('$lib/server/drive-portal-client');
		(client.listCategoryFiles as ReturnType<typeof vi.fn>).mockResolvedValue([
			{ id: 'f1', name: 'a.png', updatedAt: null }
		]);

		const { GET } = await import('./[category]/+server');
		const res = await GET({ params: { category: 'facilities' } } as never);
		expect(res.status).toBe(200);
		const body = await res.json();
		expect(body.files).toHaveLength(1);
	});
});
