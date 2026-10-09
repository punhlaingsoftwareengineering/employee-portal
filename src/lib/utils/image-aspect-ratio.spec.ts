import { describe, expect, it } from 'vitest';
import { IMAGE_ASPECT } from '$lib/constants/image-aspect';
import {
	aspectMismatchMessage,
	matchesAspectRatio
} from '$lib/utils/image-aspect-ratio';

describe('matchesAspectRatio', () => {
	it('accepts exact carousel 21:9', () => {
		expect(matchesAspectRatio({ width: 2100, height: 900 }, IMAGE_ASPECT.carousel)).toBe(true);
	});

	it('rejects wrong carousel ratio', () => {
		expect(matchesAspectRatio({ width: 1920, height: 1080 }, IMAGE_ASPECT.carousel)).toBe(false);
	});

	it('accepts square icons', () => {
		expect(matchesAspectRatio({ width: 512, height: 512 }, IMAGE_ASPECT.square)).toBe(true);
	});

	it('accepts facility 4:3 within tolerance', () => {
		expect(matchesAspectRatio({ width: 800, height: 600 }, IMAGE_ASPECT.facility)).toBe(true);
		expect(matchesAspectRatio({ width: 820, height: 600 }, IMAGE_ASPECT.facility)).toBe(true);
	});

	it('accepts announcement 20:1 strip', () => {
		expect(matchesAspectRatio({ width: 1440, height: 72 }, IMAGE_ASPECT.announcement)).toBe(true);
		expect(matchesAspectRatio({ width: 1920, height: 1080 }, IMAGE_ASPECT.announcement)).toBe(false);
	});

	it('accepts notice 4:5 poster', () => {
		expect(matchesAspectRatio({ width: 480, height: 600 }, IMAGE_ASPECT.notice)).toBe(true);
		expect(matchesAspectRatio({ width: 1920, height: 1080 }, IMAGE_ASPECT.notice)).toBe(false);
	});

	it('builds a clear mismatch message', () => {
		const message = aspectMismatchMessage({ width: 1920, height: 1080 }, IMAGE_ASPECT.carousel);
		expect(message).toContain('21:9');
		expect(message).toContain('1920×1080');
	});
});
