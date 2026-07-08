import { describe, expect, it } from 'vitest';
import {
	isPortalDriveCategory,
	PORTAL_DRIVE_CATEGORIES,
	PORTAL_DRIVE_ROOT_FOLDER
} from './drive-media-categories';

describe('drive-media-categories', () => {
	it('includes expected portal folders', () => {
		expect(PORTAL_DRIVE_CATEGORIES).toContain('facilities');
		expect(PORTAL_DRIVE_CATEGORIES).toContain('branding');
		expect(PORTAL_DRIVE_ROOT_FOLDER).toBe('portal');
	});

	it('validates category names', () => {
		expect(isPortalDriveCategory('apps')).toBe(true);
		expect(isPortalDriveCategory('bad')).toBe(false);
	});
});
