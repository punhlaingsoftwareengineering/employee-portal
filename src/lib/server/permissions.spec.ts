import { describe, expect, it } from 'vitest';
import { emptyPermissionFlags } from '$lib/constants/access-role-permissions';
import {
	canAccessToolsManage,
	canAccessUsersPage,
	canCreateDepartment,
	canCreateFacility,
	canReadFacility,
	canUpdateDepartment,
	canUpdateFacility,
	getReadableFacilityIds,
	type UserPermissions
} from './permissions';

function member(
	overrides: Partial<UserPermissions['departmentRoles'][number]> = {}
): UserPermissions {
	const basePermissions = emptyPermissionFlags({
		navDashboard: true,
		navEmployees: true,
		navDepartments: true,
		navFacilities: true,
		employeeUpdate: true,
		departmentUpdate: true,
		facilityUpdate: true
	});

	const { permissions: permissionOverrides, ...assignmentOverrides } = overrides;

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
				...assignmentOverrides,
				permissions: {
					...basePermissions,
					...(permissionOverrides ?? {})
				}
			}
		]
	};
}

describe('department/facility org scope', () => {
	it('does not allow creating departments or facilities without create flags', () => {
		const perms = member();
		expect(canCreateDepartment(perms)).toBe(false);
		expect(canCreateFacility(perms)).toBe(false);
	});

	it('allows creating departments or facilities when create flags are set', () => {
		const perms = member({
			permissions: emptyPermissionFlags({
				departmentCreate: true,
				facilityCreate: true
			})
		});
		expect(canCreateDepartment(perms)).toBe(true);
		expect(canCreateFacility(perms)).toBe(true);
	});

	it('scopes department update to assigned departments', () => {
		const perms = member();
		expect(canUpdateDepartment(perms, 'dept-a')).toBe(true);
		expect(canUpdateDepartment(perms, 'dept-b')).toBe(false);
	});

	it('scopes facility read/update to assigned facilities when not read-all', () => {
		const perms = member();
		expect(canReadFacility(perms, 'fac-a')).toBe(true);
		expect(canReadFacility(perms, 'fac-b')).toBe(false);
		expect(canUpdateFacility(perms, 'fac-a')).toBe(true);
		expect(canUpdateFacility(perms, 'fac-b')).toBe(false);
		expect(getReadableFacilityIds(perms)).toEqual(['fac-a']);
	});

	it('allows reading all facilities with facilityReadAll', () => {
		const perms = member({
			permissions: emptyPermissionFlags({
				facilityReadAll: true,
				facilityUpdate: false
			})
		});
		expect(canReadFacility(perms, 'fac-b')).toBe(true);
		expect(canUpdateFacility(perms, 'fac-b')).toBe(false);
		expect(getReadableFacilityIds(perms)).toBe('all');
	});
});

describe('users and tools manage page access', () => {
	it('requires navUsers plus a users capability', () => {
		expect(
			canAccessUsersPage(
				member({
					permissions: emptyPermissionFlags({ navUsers: true, usersRead: true })
				})
			)
		).toBe(true);
		expect(
			canAccessUsersPage(
				member({
					permissions: emptyPermissionFlags({ navUsers: true })
				})
			)
		).toBe(false);
	});

	it('allows tools manage when any tools manage flag is set', () => {
		expect(
			canAccessToolsManage(
				member({
					permissions: emptyPermissionFlags({ toolsServiceUpdate: true })
				})
			)
		).toBe(true);
		expect(canAccessToolsManage(member())).toBe(false);
	});
});
