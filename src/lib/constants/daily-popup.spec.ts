import { describe, expect, it } from 'vitest';
import {
	clampCarouselIntervalMs,
	clampDismissCooldownMinutes,
	getYangonCalendarDate,
	getYangonWeekday,
	mergeDailyPopupImages,
	shouldShowDailyPopup
} from './daily-popup';
import { IMAGE_ASPECT } from './image-aspect';
import { PORTAL_DRIVE_CATEGORIES } from './drive-media-categories';

describe('daily popup helpers', () => {
	it('merges calendar images before weekday images', () => {
		expect(mergeDailyPopupImages(['c1', 'c2'], ['w1'])).toEqual(['c1', 'c2', 'w1']);
		expect(mergeDailyPopupImages([], ['w1'])).toEqual(['w1']);
		expect(mergeDailyPopupImages(['c1'], [])).toEqual(['c1']);
	});

	it('respects dismiss cooldown', () => {
		const now = Date.parse('2026-10-08T10:00:00.000Z');
		expect(shouldShowDailyPopup(null, 15, now)).toBe(true);
		expect(shouldShowDailyPopup('invalid', 15, now)).toBe(true);
		expect(shouldShowDailyPopup('2026-10-08T09:50:00.000Z', 15, now)).toBe(false);
		expect(shouldShowDailyPopup('2026-10-08T09:40:00.000Z', 15, now)).toBe(true);
		expect(shouldShowDailyPopup('2026-10-08T09:50:00.000Z', 5, now)).toBe(true);
	});

	it('clamps config ranges', () => {
		expect(clampDismissCooldownMinutes(0)).toBe(1);
		expect(clampDismissCooldownMinutes(99999)).toBe(24 * 60);
		expect(clampCarouselIntervalMs(500)).toBe(2000);
		expect(clampCarouselIntervalMs(999999)).toBe(60_000);
	});

	it('returns Yangon calendar date and weekday', () => {
		const date = getYangonCalendarDate(new Date('2026-10-08T05:00:00.000Z'));
		expect(date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
		const weekday = getYangonWeekday(new Date('2026-10-08T05:00:00.000Z'));
		expect(weekday).toBeGreaterThanOrEqual(0);
		expect(weekday).toBeLessThanOrEqual(6);
	});

	it('defines 16:9 daily popup aspect and drive category', () => {
		expect(IMAGE_ASPECT.dailyPopup.label).toBe('16:9');
		expect(IMAGE_ASPECT.dailyPopup.width / IMAGE_ASPECT.dailyPopup.height).toBeCloseTo(16 / 9);
		expect(PORTAL_DRIVE_CATEGORIES).toContain('daily-popups');
	});
});
