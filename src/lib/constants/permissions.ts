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
		navTools: boolean;
		navSettings: boolean;
		employeeReadAll: boolean;
		employeeWrite: boolean;
		employeeDelete: boolean;
		departmentReadAll: boolean;
		departmentWrite: boolean;
		facilityReadAll: boolean;
		facilityWrite: boolean;
	};
};

export type UserPermissionsSummary = {
	userId: string;
	portalRole: PortalRole;
	isAdmin: boolean;
	isGuest: boolean;
	departmentRoles: DepartmentRoleAssignment[];
};
