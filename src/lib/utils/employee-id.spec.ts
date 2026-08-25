import { describe, expect, it } from 'vitest';
import { displayEmployeeId, isPlaceholderEmployeeId, newEmployeeRowId } from './employee-id';

describe('employee id display', () => {
	it('hides empty, nf- slugs, and UUIDs', () => {
		expect(isPlaceholderEmployeeId(null)).toBe(true);
		expect(isPlaceholderEmployeeId('')).toBe(true);
		expect(isPlaceholderEmployeeId('nf-melvyn-pun_bod')).toBe(true);
		expect(isPlaceholderEmployeeId('3fa85f64-5717-4562-b3fc-2c963f66afa6')).toBe(true);
		expect(isPlaceholderEmployeeId('00952')).toBe(false);
		expect(displayEmployeeId('00952')).toBe('00952');
		expect(displayEmployeeId('nf-row-2')).toBe('—');
		expect(displayEmployeeId(null)).toBe('—');
	});
});

describe('newEmployeeRowId', () => {
	it('keeps a real Emp No and generates a UUID when empty', () => {
		expect(newEmployeeRowId('00952')).toBe('00952');
		expect(newEmployeeRowId(null)).toMatch(
			/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
		);
		expect(newEmployeeRowId('  ')).toMatch(
			/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
		);
	});
});
