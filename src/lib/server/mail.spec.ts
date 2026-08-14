import { describe, expect, it } from 'vitest';
import { parseMailboxAddress } from './mail-address';

describe('parseMailboxAddress', () => {
	it('extracts address from display name format', () => {
		expect(parseMailboxAddress('Employee Portal UAT <ict@punhlainghospitals.com>')).toBe(
			'ict@punhlainghospitals.com'
		);
	});

	it('lowercases plain addresses', () => {
		expect(parseMailboxAddress('User@PunHlaingHospitals.com')).toBe('user@punhlainghospitals.com');
	});
});
