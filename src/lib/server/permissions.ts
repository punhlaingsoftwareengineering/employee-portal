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
		| 'navPharmacy'
		| 'navTools'
		| 'navSettings'
		| 'navCommunity'
		| 'employeeReadAll'
		| 'employeeWrite'
		| 'employeeDelete'
		| 'departmentReadAll'
		| 'departmentWrite'
		| 'facilityReadAll'
		| 'facilityWrite'
		| 'pharmacyReadAll'
		| 'pharmacyWrite'
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

function hasNav(
	perms: UserPermissions,
	flag: keyof DepartmentRoleAssignment['permissions']
): boolean {
	return perms.departmentRoles.some((assignment) => assignment.permissions[flag]);
}

export function canReadDepartment(perms: UserPermissions, departmentId: string): boolean {
	if (perms.isAdmin) return true;
	if (perms.departmentRoles.some((assignment) => assignment.permissions.departmentReadAll)) {
		return true;
	}
	return getAssignment(perms, departmentId) !== undefined;
}

/** Update/delete an existing department — scoped to assignments with `departmentWrite`. */
export function canWriteDepartment(perms: UserPermissions, departmentId: string): boolean {
	if (perms.isAdmin) return true;
	const assignment = getAssignment(perms, departmentId);
	return assignment?.permissions.departmentWrite ?? false;
}

/** Creating a department is org-wide — portal admin only. */
export function canCreateDepartment(perms: UserPermissions): boolean {
	return perms.isAdmin;
}

/** True if the user can mutate at least one department (UI affordances). */
export function canManageDepartments(perms: UserPermissions): boolean {
	if (perms.isAdmin) return true;
	return perms.departmentRoles.some((assignment) => assignment.permissions.departmentWrite);
}

export function canReadFacility(perms: UserPermissions, facilityId: string): boolean {
	if (perms.isAdmin) return true;
	if (perms.departmentRoles.some((assignment) => assignment.permissions.facilityReadAll)) {
		return true;
	}
	return perms.departmentRoles.some(
		(assignment) =>
			assignment.facilityId === facilityId &&
			(assignment.permissions.facilityWrite || assignment.permissions.facilityReadAll)
	);
}

/** Update/delete an existing facility — scoped to assignments with `facilityWrite`. */
export function canWriteFacility(perms: UserPermissions, facilityId: string): boolean {
	if (perms.isAdmin) return true;
	return perms.departmentRoles.some(
		(assignment) =>
			assignment.facilityId === facilityId && assignment.permissions.facilityWrite
	);
}

/** Creating a facility is org-wide — portal admin only. */
export function canCreateFacility(perms: UserPermissions): boolean {
	return perms.isAdmin;
}

/** True if the user can read any facility (page / list gate). */
export function canReadFacilities(perms: UserPermissions): boolean {
	if (perms.isAdmin) return true;
	return perms.departmentRoles.some(
		(assignment) =>
			assignment.permissions.facilityReadAll || assignment.permissions.facilityWrite
	);
}

/** True if the user can mutate at least one facility (UI affordances). */
export function canManageFacilities(perms: UserPermissions): boolean {
	if (perms.isAdmin) return true;
	return perms.departmentRoles.some((assignment) => assignment.permissions.facilityWrite);
}

/** Assigned facility IDs the user may see when they lack `facilityReadAll`. */
export function getReadableFacilityIds(perms: UserPermissions): 'all' | string[] {
	if (perms.isAdmin) return 'all';
	if (perms.departmentRoles.some((assignment) => assignment.permissions.facilityReadAll)) {
		return 'all';
	}
	return [
		...new Set(
			perms.departmentRoles
				.filter(
					(assignment) =>
						assignment.permissions.facilityWrite || assignment.permissions.facilityReadAll
				)
				.map((assignment) => assignment.facilityId)
		)
	];
}

export function canReadPharmacy(perms: UserPermissions): boolean {
	if (perms.isAdmin) return true;
	return perms.departmentRoles.some(
		(assignment) =>
			assignment.permissions.pharmacyReadAll || assignment.permissions.pharmacyWrite
	);
}

export function canManagePharmacy(perms: UserPermissions): boolean {
	if (perms.isAdmin) return true;
	return perms.departmentRoles.some((assignment) => assignment.permissions.pharmacyWrite);
}

export function canReadEmployeeMaster(perms: UserPermissions): boolean {
	if (perms.isAdmin) return true;
	return perms.departmentRoles.some(
		(assignment) =>
			assignment.permissions.employeeReadAll ||
			assignment.permissions.employeeWrite ||
			assignment.permissions.employeeDelete
	);
}

export function canManageEmployeeMaster(perms: UserPermissions): boolean {
	if (perms.isAdmin) return true;
	return perms.departmentRoles.some((assignment) => assignment.permissions.employeeWrite);
}

export function canDeleteEmployeeMaster(perms: UserPermissions): boolean {
	if (perms.isAdmin) return true;
	return perms.departmentRoles.some((assignment) => assignment.permissions.employeeDelete);
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

/** Sidebar / page: Dashboard */
export function canAccessDashboard(perms: UserPermissions): boolean {
	if (perms.isAdmin) return true;
	return hasNav(perms, 'navDashboard');
}

/** Sidebar / page: Employees (nav + employee capability) */
export function canAccessEmployeesPage(perms: UserPermissions): boolean {
	if (perms.isAdmin) return true;
	return perms.departmentRoles.some((assignment) => {
		const p = assignment.permissions;
		return (
			p.navEmployees && (p.employeeReadAll || p.employeeWrite || p.employeeDelete)
		);
	});
}

/** Sidebar / page: Departments */
export function canAccessDepartmentsPage(perms: UserPermissions): boolean {
	if (perms.isAdmin) return true;
	return perms.departmentRoles.some((assignment) => {
		const p = assignment.permissions;
		return p.navDepartments && (p.departmentReadAll || p.departmentWrite);
	});
}

/** Sidebar / page: Facilities */
export function canAccessFacilitiesPage(perms: UserPermissions): boolean {
	if (perms.isAdmin) return true;
	return perms.departmentRoles.some((assignment) => {
		const p = assignment.permissions;
		return p.navFacilities && (p.facilityReadAll || p.facilityWrite);
	});
}

/** Sidebar / page: Pharmacy */
export function canAccessPharmacyPage(perms: UserPermissions): boolean {
	if (perms.isAdmin) return true;
	return perms.departmentRoles.some((assignment) => {
		const p = assignment.permissions;
		return p.navPharmacy && (p.pharmacyReadAll || p.pharmacyWrite);
	});
}

export function canAccessSettings(perms: UserPermissions): boolean {
	if (perms.isAdmin) return true;
	return hasNav(perms, 'navSettings');
}

export function canAccessTools(perms: UserPermissions): boolean {
	if (perms.isAdmin) return true;
	return hasNav(perms, 'navTools');
}

/** Manage community categories/links — admin or explicit navCommunity (not navDashboard). */
export function canManageCommunity(perms: UserPermissions): boolean {
	if (perms.isAdmin) return true;
	return hasNav(perms, 'navCommunity');
}

export function canAccessService(
	availableServices: { id: string }[],
	serviceId: string
): boolean {
	return availableServices.some((service) => service.id === serviceId);
}
