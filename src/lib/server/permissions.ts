import type { AccessRole } from '$lib/server/db/schema/access-role';
import type { PortalRole } from '$lib/constants/user-roles';

export type DepartmentRoleAssignment = {
	departmentId: string;
	roleId: string;
	facilityId: string;
	roleName?: string;
	roleSlug?: string;
	permissions: Pick<
		AccessRole,
		| 'navDashboard'
		| 'navEmployees'
		| 'navDepartments'
		| 'navFacilities'
		| 'navTools'
		| 'navSettings'
		| 'employeeReadAll'
		| 'employeeWrite'
		| 'employeeDelete'
		| 'departmentReadAll'
		| 'departmentWrite'
		| 'facilityReadAll'
		| 'facilityWrite'
	>;
};

export type UserPermissions = {
	userId: string;
	portalRole: PortalRole;
	isAdmin: boolean;
	isGuest: boolean;
	departmentRoles: DepartmentRoleAssignment[];
};

function getAssignment(perms: UserPermissions, departmentId: string) {
	return perms.departmentRoles.find((assignment) => assignment.departmentId === departmentId);
}

export function canReadDepartment(perms: UserPermissions, departmentId: string): boolean {
	if (perms.isAdmin) return true;
	if (perms.departmentRoles.some((assignment) => assignment.permissions.departmentReadAll)) {
		return true;
	}
	return getAssignment(perms, departmentId) !== undefined;
}

export function canManageDepartments(perms: UserPermissions): boolean {
	if (perms.isAdmin) return true;
	return perms.departmentRoles.some((assignment) => assignment.permissions.departmentWrite);
}

export function canReadFacilities(perms: UserPermissions): boolean {
	if (perms.isAdmin) return true;
	return perms.departmentRoles.some(
		(assignment) =>
			assignment.permissions.facilityReadAll || assignment.permissions.facilityWrite
	);
}

export function canManageFacilities(perms: UserPermissions): boolean {
	if (perms.isAdmin) return true;
	return perms.departmentRoles.some((assignment) => assignment.permissions.facilityWrite);
}

export function canReadEmployee(perms: UserPermissions, departmentId: string): boolean {
	if (perms.isAdmin) return true;
	if (perms.departmentRoles.some((assignment) => assignment.permissions.employeeReadAll)) {
		return true;
	}
	return getAssignment(perms, departmentId) !== undefined;
}

export function canWriteEmployee(perms: UserPermissions, departmentId: string): boolean {
	if (perms.isAdmin) return true;
	const assignment = getAssignment(perms, departmentId);
	return assignment?.permissions.employeeWrite ?? false;
}

export function canDeleteEmployee(perms: UserPermissions, departmentId: string): boolean {
	if (perms.isAdmin) return true;
	const assignment = getAssignment(perms, departmentId);
	return assignment?.permissions.employeeDelete ?? false;
}

export function hasAppAccess(perms: UserPermissions): boolean {
	if (perms.isGuest) return false;
	if (perms.isAdmin) return true;
	return perms.departmentRoles.length > 0;
}

export function canAccessSettings(perms: UserPermissions): boolean {
	if (perms.isAdmin) return true;
	return perms.departmentRoles.some((assignment) => assignment.permissions.navSettings);
}

export function canAccessService(
	availableServices: { id: string }[],
	serviceId: string
): boolean {
	return availableServices.some((service) => service.id === serviceId);
}
