import { describe, expect, it } from 'vitest';
import {
	BUILTIN_SERVICES,
	DOCTOR_DIRECTORY_SERVICE_ID,
	E_SIGNATURE_SERVICE_ID,
	E_SIGNATURE_SERVICE_PATH,
	EMPLOYEE_DIRECTORY_SERVICE_ID,
	RATING_SERVICE_ID
} from './builtin-services';
import { PUBLIC_ROUTES } from './public-routes';

describe('builtin-services public access', () => {
	const byId = Object.fromEntries(BUILTIN_SERVICES.map((item) => [item.id, item]));

	it('marks catalog-public builtins as public', () => {
		expect(byId[E_SIGNATURE_SERVICE_ID]?.isPublic).toBe(true);
		expect(byId[EMPLOYEE_DIRECTORY_SERVICE_ID]?.isPublic).toBe(true);
		expect(byId[DOCTOR_DIRECTORY_SERVICE_ID]?.isPublic).toBe(true);
	});

	it('keeps private builtins private', () => {
		expect(byId[RATING_SERVICE_ID]?.isPublic).toBe(false);
	});

	it('exposes e-signature on the public tools path', () => {
		expect(byId[E_SIGNATURE_SERVICE_ID]?.path).toBe(E_SIGNATURE_SERVICE_PATH);
		expect(PUBLIC_ROUTES.eSignature).toBe(E_SIGNATURE_SERVICE_PATH);
	});
});
