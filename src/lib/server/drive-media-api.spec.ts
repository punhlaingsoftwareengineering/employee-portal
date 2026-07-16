import { describe, expect, it } from 'vitest';
import { handleDrivePortalError } from './drive-media-api';
import { DrivePortalNotConfiguredError } from './drive-portal-client';

describe('handleDrivePortalError', () => {
	it('returns 503 for DrivePortalNotConfiguredError', () => {
		expect(() => handleDrivePortalError(new DrivePortalNotConfiguredError())).toThrowError(
			expect.objectContaining({ status: 503 })
		);
	});

	it('unwraps fetch cause in 502 message', () => {
		const err = new TypeError('fetch failed', {
			cause: new Error('getaddrinfo ENOTFOUND drive.office.phh.com')
		});
		try {
			handleDrivePortalError(err);
			expect.fail('expected throw');
		} catch (e) {
			const httpError = e as { status: number; body: { message: string } };
			expect(httpError.status).toBe(502);
			expect(httpError.body.message).toBe(
				'fetch failed: getaddrinfo ENOTFOUND drive.office.phh.com'
			);
		}
	});
});
