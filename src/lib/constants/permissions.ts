import type { PortalRole } from '$lib/constants/user-roles';

export type DepartmentRoleAssignment = {
	departmentId: string;
	roleId: string;
	facilityId: string;
	roleName?: string;
	roleSlug?: string;
	permissions: {
		navDashboard: boolean;
		navEmployees: boolean;
		navDepartments: boolean;
		navFacilities: boolean;
		navPharmacy: boolean;
		navTools: boolean;
		navSettings: boolean;
		navCommunity: boolean;
		employeeReadAll: boolean;
		employeeWrite: boolean;
		employeeDelete: boolean;
		departmentReadAll: boolean;
		departmentWrite: boolean;
		facilityReadAll: boolean;
		facilityWrite: boolean;
		pharmacyReadAll: boolean;
		pharmacyWrite: boolean;
	};
};

export type UserPermissionsSummary = {
	userId: string;
	portalRole: PortalRole;
	isAdmin: boolean;
	isGuest: boolean;
	departmentRoles: DepartmentRoleAssignment[];
};

export function canAccessTools(permissions: UserPermissionsSummary | null | undefined): boolean {
	if (!permissions) return false;
	if (permissions.isAdmin) return true;
	return permissions.departmentRoles.some((assignment) => assignment.permissions.navTools);
}

export function canManageCommunity(
	permissions: UserPermissionsSummary | null | undefined
): boolean {
	if (!permissions) return false;
	if (permissions.isAdmin) return true;
	return permissions.departmentRoles.some((assignment) => assignment.permissions.navCommunity);
}
