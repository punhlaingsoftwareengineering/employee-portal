import { describe, expect, it } from 'vitest';
import {
	canCreateDepartment,
	canCreateFacility,
	canReadFacility,
	canWriteDepartment,
	canWriteFacility,
	getReadableFacilityIds,
	type UserPermissions
} from './permissions';

function member(overrides: Partial<UserPermissions['departmentRoles'][number]> = {}): UserPermissions {
	return {
		userId: 'u1',
		portalRole: 'member',
		isAdmin: false,
		isGuest: false,
		departmentRoles: [
			{
				departmentId: 'dept-a',
				roleId: 'role-1',
				facilityId: 'fac-a',
				permissions: {
					navDashboard: true,
					navEmployees: true,
					navDepartments: true,
					navFacilities: true,
					navPharmacy: false,
					navTools: false,
					navSettings: false,
					navCommunity: false,
					employeeReadAll: false,
					employeeWrite: true,
					employeeDelete: false,
					departmentReadAll: false,
					departmentWrite: true,
					facilityReadAll: false,
					facilityWrite: true,
					pharmacyReadAll: false,
					pharmacyWrite: false
				},
				...overrides
			}
		]
	};
}

describe('department/facility org scope', () => {
	it('does not allow creating departments or facilities without admin', () => {
		const perms = member();
		expect(canCreateDepartment(perms)).toBe(false);
		expect(canCreateFacility(perms)).toBe(false);
	});

	it('scopes department write to assigned departments', () => {
		const perms = member();
		expect(canWriteDepartment(perms, 'dept-a')).toBe(true);
		expect(canWriteDepartment(perms, 'dept-b')).toBe(false);
	});

	it('scopes facility read/write to assigned facilities when not read-all', () => {
		const perms = member();
		expect(canReadFacility(perms, 'fac-a')).toBe(true);
		expect(canReadFacility(perms, 'fac-b')).toBe(false);
		expect(canWriteFacility(perms, 'fac-a')).toBe(true);
		expect(canWriteFacility(perms, 'fac-b')).toBe(false);
		expect(getReadableFacilityIds(perms)).toEqual(['fac-a']);
	});

	it('allows reading all facilities with facilityReadAll', () => {
		const perms = member({
			permissions: {
				...member().departmentRoles[0]!.permissions,
				facilityReadAll: true,
				facilityWrite: false
			}
		});
		expect(canReadFacility(perms, 'fac-b')).toBe(true);
		expect(canWriteFacility(perms, 'fac-b')).toBe(false);
		expect(getReadableFacilityIds(perms)).toBe('all');
	});
});
