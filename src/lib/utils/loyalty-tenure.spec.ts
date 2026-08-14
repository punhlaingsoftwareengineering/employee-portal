import { describe, expect, it } from 'vitest';
import { formatLoyaltyTenure } from './loyalty-tenure';

describe('formatLoyaltyTenure', () => {
	it('returns dash for missing dates', () => {
		expect(formatLoyaltyTenure(null)).toBe('—');
		expect(formatLoyaltyTenure(undefined)).toBe('—');
		expect(formatLoyaltyTenure('')).toBe('—');
	});

	it('formats years and months from join date', () => {
		const now = new Date(2026, 7, 3); // Aug 3, 2026
		expect(formatLoyaltyTenure('2024-05-03', now)).toBe('2y 3m');
		expect(formatLoyaltyTenure('2026-05-03', now)).toBe('3m');
		expect(formatLoyaltyTenure('2024-08-03', now)).toBe('2y');
	});

	it('formats short tenures in days', () => {
		const now = new Date(2026, 7, 3);
		expect(formatLoyaltyTenure('2026-08-03', now)).toBe('0d');
		expect(formatLoyaltyTenure('2026-08-01', now)).toBe('2d');
	});
});
