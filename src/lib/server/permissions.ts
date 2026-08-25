import type { AccessRole } from '$lib/server/db/schema/access-role';
import type { PortalRole } from '$lib/constants/user-roles';
import type {
	AccessRolePermissionFlags,
	AccessRolePermissionKey
} from '$lib/constants/access-role-permissions';
import { ACCESS_ROLE_PERMISSION_KEYS } from '$lib/constants/access-role-permissions';

export type DepartmentRoleAssignment = {
	departmentId: string;
	roleId: string;
	facilityId: string;
	roleName?: string;
	roleSlug?: string;
	permissions: AccessRolePermissionFlags;
};

export type UserPermissions = {
	userId: string;
	portalRole: PortalRole;
	isAdmin: boolean;
	isGuest: boolean;
	departmentRoles: DepartmentRoleAssignment[];
};

export function pickRolePermissions(role: AccessRole): AccessRolePermissionFlags {
	const permissions = {} as AccessRolePermissionFlags;
	for (const key of ACCESS_ROLE_PERMISSION_KEYS) {
		permissions[key] = Boolean(role[key as keyof AccessRole]);
	}
	return permissions;
}

function getAssignment(perms: UserPermissions, departmentId: string) {
	return perms.departmentRoles.find((assignment) => assignment.departmentId === departmentId);
}

function hasFlag(perms: UserPermissions, flag: AccessRolePermissionKey): boolean {
	if (perms.isAdmin) return true;
	return perms.departmentRoles.some((assignment) => assignment.permissions[flag]);
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

/** Update an existing department — scoped to assignments with `departmentUpdate`. */
export function canUpdateDepartment(perms: UserPermissions, departmentId: string): boolean {
	if (perms.isAdmin) return true;
	const assignment = getAssignment(perms, departmentId);
	return assignment?.permissions.departmentUpdate ?? false;
}

/** @deprecated Use canUpdateDepartment */
export function canWriteDepartment(perms: UserPermissions, departmentId: string): boolean {
	return canUpdateDepartment(perms, departmentId);
}

export function canDeleteDepartment(perms: UserPermissions, departmentId: string): boolean {
	if (perms.isAdmin) return true;
	const assignment = getAssignment(perms, departmentId);
	return assignment?.permissions.departmentDelete ?? false;
}

/** Creating a department is org-wide when `departmentCreate` is set. */
export function canCreateDepartment(perms: UserPermissions): boolean {
	return hasFlag(perms, 'departmentCreate');
}

/** True if the user can update at least one department (UI affordances). */
export function canManageDepartments(perms: UserPermissions): boolean {
	if (perms.isAdmin) return true;
	return perms.departmentRoles.some((assignment) => assignment.permissions.departmentUpdate);
}

export function canReadFacility(perms: UserPermissions, facilityId: string): boolean {
	if (perms.isAdmin) return true;
	if (perms.departmentRoles.some((assignment) => assignment.permissions.facilityReadAll)) {
		return true;
	}
	return perms.departmentRoles.some(
		(assignment) =>
			assignment.facilityId === facilityId &&
			(assignment.permissions.facilityUpdate ||
				assignment.permissions.facilityDelete ||
				assignment.permissions.facilityReadAll ||
				assignment.permissions.facilityCreate)
	);
}

/** Update an existing facility — scoped to assignments with `facilityUpdate`. */
export function canUpdateFacility(perms: UserPermissions, facilityId: string): boolean {
	if (perms.isAdmin) return true;
	return perms.departmentRoles.some(
		(assignment) => assignment.facilityId === facilityId && assignment.permissions.facilityUpdate
	);
}

/** @deprecated Use canUpdateFacility */
export function canWriteFacility(perms: UserPermissions, facilityId: string): boolean {
	return canUpdateFacility(perms, facilityId);
}

export function canDeleteFacility(perms: UserPermissions, facilityId: string): boolean {
	if (perms.isAdmin) return true;
	return perms.departmentRoles.some(
		(assignment) => assignment.facilityId === facilityId && assignment.permissions.facilityDelete
	);
}

/** Creating a facility is org-wide when `facilityCreate` is set. */
export function canCreateFacility(perms: UserPermissions): boolean {
	return hasFlag(perms, 'facilityCreate');
}

/** True if the user can read any facility (page / list gate). */
export function canReadFacilities(perms: UserPermissions): boolean {
	if (perms.isAdmin) return true;
	return perms.departmentRoles.some(
		(assignment) =>
			assignment.permissions.facilityReadAll ||
			assignment.permissions.facilityUpdate ||
			assignment.permissions.facilityDelete ||
			assignment.permissions.facilityCreate
	);
}

/** True if the user can mutate at least one facility (UI affordances). */
export function canManageFacilities(perms: UserPermissions): boolean {
	if (perms.isAdmin) return true;
	return perms.departmentRoles.some((assignment) => assignment.permissions.facilityUpdate);
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
						assignment.permissions.facilityUpdate ||
						assignment.permissions.facilityDelete ||
						assignment.permissions.facilityCreate ||
						assignment.permissions.facilityReadAll
				)
				.map((assignment) => assignment.facilityId)
		)
	];
}

export function canReadPharmacy(perms: UserPermissions): boolean {
	if (perms.isAdmin) return true;
	return perms.departmentRoles.some(
		(assignment) =>
			assignment.permissions.pharmacyReadAll ||
			assignment.permissions.pharmacyCreate ||
			assignment.permissions.pharmacyUpdate ||
			assignment.permissions.pharmacyDelete ||
			assignment.permissions.pharmacyExcelOverride ||
			assignment.permissions.pharmacyExport
	);
}

export function canCreatePharmacy(perms: UserPermissions): boolean {
	return hasFlag(perms, 'pharmacyCreate');
}

export function canUpdatePharmacy(perms: UserPermissions): boolean {
	return hasFlag(perms, 'pharmacyUpdate');
}

export function canDeletePharmacy(perms: UserPermissions): boolean {
	return hasFlag(perms, 'pharmacyDelete');
}

export function canExcelOverridePharmacy(perms: UserPermissions): boolean {
	return hasFlag(perms, 'pharmacyExcelOverride');
}

export function canExportPharmacy(perms: UserPermissions): boolean {
	return hasFlag(perms, 'pharmacyExport');
}

/** @deprecated Prefer canCreate/Update/ExcelOverridePharmacy */
export function canManagePharmacy(perms: UserPermissions): boolean {
	return canCreatePharmacy(perms) || canUpdatePharmacy(perms) || canExcelOverridePharmacy(perms);
}

export function canReadDoctorMaster(perms: UserPermissions): boolean {
	if (perms.isAdmin) return true;
	return perms.departmentRoles.some(
		(assignment) =>
			assignment.permissions.doctorReadAll ||
			assignment.permissions.doctorCreate ||
			assignment.permissions.doctorUpdate ||
			assignment.permissions.doctorDelete ||
			assignment.permissions.doctorExcelOverride ||
			assignment.permissions.doctorExport
	);
}

export function canCreateDoctorMaster(perms: UserPermissions): boolean {
	return hasFlag(perms, 'doctorCreate');
}

export function canUpdateDoctorMaster(perms: UserPermissions): boolean {
	return hasFlag(perms, 'doctorUpdate');
}

export function canDeleteDoctorMaster(perms: UserPermissions): boolean {
	return hasFlag(perms, 'doctorDelete');
}

export function canExcelOverrideDoctorMaster(perms: UserPermissions): boolean {
	return hasFlag(perms, 'doctorExcelOverride');
}

export function canExportDoctorMaster(perms: UserPermissions): boolean {
	return hasFlag(perms, 'doctorExport');
}

/** @deprecated Prefer canCreate/UpdateDoctorMaster */
export function canManageDoctorMaster(perms: UserPermissions): boolean {
	return (
		canCreateDoctorMaster(perms) ||
		canUpdateDoctorMaster(perms) ||
		canExcelOverrideDoctorMaster(perms)
	);
}

export function canReadEmployeeMaster(perms: UserPermissions): boolean {
	if (perms.isAdmin) return true;
	return perms.departmentRoles.some(
		(assignment) =>
			assignment.permissions.employeeReadAll ||
			assignment.permissions.employeeCreate ||
			assignment.permissions.employeeUpdate ||
			assignment.permissions.employeeDelete ||
			assignment.permissions.employeeExcelOverride ||
			assignment.permissions.employeeExport
	);
}

export function canCreateEmployeeMaster(perms: UserPermissions): boolean {
	return hasFlag(perms, 'employeeCreate');
}

export function canUpdateEmployeeMaster(perms: UserPermissions): boolean {
	return hasFlag(perms, 'employeeUpdate');
}

export function canDeleteEmployeeMaster(perms: UserPermissions): boolean {
	return hasFlag(perms, 'employeeDelete');
}

export function canExcelOverrideEmployeeMaster(perms: UserPermissions): boolean {
	return hasFlag(perms, 'employeeExcelOverride');
}

export function canExportEmployeeMaster(perms: UserPermissions): boolean {
	return hasFlag(perms, 'employeeExport');
}

/** @deprecated Prefer canCreate/UpdateEmployeeMaster */
export function canManageEmployeeMaster(perms: UserPermissions): boolean {
	return (
		canCreateEmployeeMaster(perms) ||
		canUpdateEmployeeMaster(perms) ||
		canExcelOverrideEmployeeMaster(perms)
	);
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
	return (
		(assignment?.permissions.employeeCreate || assignment?.permissions.employeeUpdate) ?? false
	);
}

export function canCreateEmployee(perms: UserPermissions, departmentId: string): boolean {
	if (perms.isAdmin) return true;
	const assignment = getAssignment(perms, departmentId);
	return assignment?.permissions.employeeCreate ?? false;
}

export function canUpdateEmployee(perms: UserPermissions, departmentId: string): boolean {
	if (perms.isAdmin) return true;
	const assignment = getAssignment(perms, departmentId);
	return assignment?.permissions.employeeUpdate ?? false;
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

export function canAccessDashboard(perms: UserPermissions): boolean {
	if (perms.isAdmin) return true;
	return hasNav(perms, 'navDashboard');
}

export function canAccessEmployeesPage(perms: UserPermissions): boolean {
	if (perms.isAdmin) return true;
	return perms.departmentRoles.some((assignment) => {
		const p = assignment.permissions;
		return (
			p.navEmployees &&
			(p.employeeReadAll ||
				p.employeeCreate ||
				p.employeeUpdate ||
				p.employeeDelete ||
				p.employeeExcelOverride ||
				p.employeeExport)
		);
	});
}

export function canAccessDepartmentsPage(perms: UserPermissions): boolean {
	if (perms.isAdmin) return true;
	return perms.departmentRoles.some((assignment) => {
		const p = assignment.permissions;
		return (
			p.navDepartments &&
			(p.departmentReadAll || p.departmentCreate || p.departmentUpdate || p.departmentDelete)
		);
	});
}

export function canAccessFacilitiesPage(perms: UserPermissions): boolean {
	if (perms.isAdmin) return true;
	return perms.departmentRoles.some((assignment) => {
		const p = assignment.permissions;
		return (
			p.navFacilities &&
			(p.facilityReadAll || p.facilityCreate || p.facilityUpdate || p.facilityDelete)
		);
	});
}

export function canAccessPharmacyPage(perms: UserPermissions): boolean {
	if (perms.isAdmin) return true;
	return perms.departmentRoles.some((assignment) => {
		const p = assignment.permissions;
		return (
			p.navPharmacy &&
			(p.pharmacyReadAll ||
				p.pharmacyCreate ||
				p.pharmacyUpdate ||
				p.pharmacyDelete ||
				p.pharmacyExcelOverride ||
				p.pharmacyExport)
		);
	});
}

export function canAccessDoctorsPage(perms: UserPermissions): boolean {
	if (perms.isAdmin) return true;
	return perms.departmentRoles.some((assignment) => {
		const p = assignment.permissions;
		return (
			p.navDoctors &&
			(p.doctorReadAll ||
				p.doctorCreate ||
				p.doctorUpdate ||
				p.doctorDelete ||
				p.doctorExcelOverride ||
				p.doctorExport)
		);
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

export function canManageCommunity(perms: UserPermissions): boolean {
	if (perms.isAdmin) return true;
	return hasNav(perms, 'navCommunity');
}

export function canAccessUsersPage(perms: UserPermissions): boolean {
	if (perms.isAdmin) return true;
	return perms.departmentRoles.some((assignment) => {
		const p = assignment.permissions;
		return (
			p.navUsers &&
			(p.usersRead || p.usersInvite || p.usersUpdate || p.usersInviteResend || p.usersInviteRevoke)
		);
	});
}

export function canAccessRolesPage(perms: UserPermissions): boolean {
	if (perms.isAdmin) return true;
	return perms.departmentRoles.some((assignment) => {
		const p = assignment.permissions;
		return p.navRoles && (p.rolesRead || p.rolesCreate || p.rolesUpdate || p.rolesDelete);
	});
}

export function canAccessToolsManage(perms: UserPermissions): boolean {
	if (perms.isAdmin) return true;
	return perms.departmentRoles.some((assignment) => {
		const p = assignment.permissions;
		return (
			p.toolsServiceCreate ||
			p.toolsServiceUpdate ||
			p.toolsServiceDelete ||
			p.toolsAppCreate ||
			p.toolsAppUpdate ||
			p.toolsAppDelete ||
			p.toolsGuideCreate ||
			p.toolsGuideUpdate ||
			p.toolsGuideDelete ||
			p.toolsLearningCreate ||
			p.toolsLearningUpdate ||
			p.toolsLearningDelete
		);
	});
}

export function canUsersRead(perms: UserPermissions): boolean {
	return hasFlag(perms, 'usersRead') || canAccessUsersPage(perms);
}

export function canUsersInvite(perms: UserPermissions): boolean {
	return hasFlag(perms, 'usersInvite');
}

export function canUsersUpdate(perms: UserPermissions): boolean {
	return hasFlag(perms, 'usersUpdate');
}

export function canUsersInviteResend(perms: UserPermissions): boolean {
	return hasFlag(perms, 'usersInviteResend');
}

export function canUsersInviteRevoke(perms: UserPermissions): boolean {
	return hasFlag(perms, 'usersInviteRevoke');
}

export function canRolesRead(perms: UserPermissions): boolean {
	return hasFlag(perms, 'rolesRead') || canAccessRolesPage(perms);
}

export function canRolesCreate(perms: UserPermissions): boolean {
	return hasFlag(perms, 'rolesCreate');
}

export function canRolesUpdate(perms: UserPermissions): boolean {
	return hasFlag(perms, 'rolesUpdate');
}

export function canRolesDelete(perms: UserPermissions): boolean {
	return hasFlag(perms, 'rolesDelete');
}

export function canCommunityCategoryCreate(perms: UserPermissions): boolean {
	return hasFlag(perms, 'communityCategoryCreate');
}

export function canCommunityCategoryUpdate(perms: UserPermissions): boolean {
	return hasFlag(perms, 'communityCategoryUpdate');
}

export function canCommunityCategoryDelete(perms: UserPermissions): boolean {
	return hasFlag(perms, 'communityCategoryDelete');
}

export function canCommunityLinkCreate(perms: UserPermissions): boolean {
	return hasFlag(perms, 'communityLinkCreate');
}

export function canCommunityLinkUpdate(perms: UserPermissions): boolean {
	return hasFlag(perms, 'communityLinkUpdate');
}

export function canCommunityLinkDelete(perms: UserPermissions): boolean {
	return hasFlag(perms, 'communityLinkDelete');
}

export function canSettingsThemeUpdate(perms: UserPermissions): boolean {
	return hasFlag(perms, 'settingsThemeUpdate');
}

export function canSettingsNewsletterCreate(perms: UserPermissions): boolean {
	return hasFlag(perms, 'settingsNewsletterCreate');
}

export function canSettingsNewsletterUpdate(perms: UserPermissions): boolean {
	return hasFlag(perms, 'settingsNewsletterUpdate');
}

export function canSettingsNewsletterDelete(perms: UserPermissions): boolean {
	return hasFlag(perms, 'settingsNewsletterDelete');
}

export function canSettingsOnboardingCreate(perms: UserPermissions): boolean {
	return hasFlag(perms, 'settingsOnboardingCreate');
}

export function canSettingsOnboardingUpdate(perms: UserPermissions): boolean {
	return hasFlag(perms, 'settingsOnboardingUpdate');
}

export function canSettingsOnboardingDelete(perms: UserPermissions): boolean {
	return hasFlag(perms, 'settingsOnboardingDelete');
}

export function canSettingsAnnouncementCreate(perms: UserPermissions): boolean {
	return hasFlag(perms, 'settingsAnnouncementCreate');
}

export function canSettingsAnnouncementUpdate(perms: UserPermissions): boolean {
	return hasFlag(perms, 'settingsAnnouncementUpdate');
}

export function canSettingsAnnouncementDelete(perms: UserPermissions): boolean {
	return hasFlag(perms, 'settingsAnnouncementDelete');
}

export function canSettingsSoundCreate(perms: UserPermissions): boolean {
	return hasFlag(perms, 'settingsSoundCreate');
}

export function canSettingsSoundUpdate(perms: UserPermissions): boolean {
	return hasFlag(perms, 'settingsSoundUpdate');
}

export function canSettingsSoundDelete(perms: UserPermissions): boolean {
	return hasFlag(perms, 'settingsSoundDelete');
}

export function canSettingsNotificationCreate(perms: UserPermissions): boolean {
	return hasFlag(perms, 'settingsNotificationCreate');
}

export function canSettingsNotificationUpdate(perms: UserPermissions): boolean {
	return hasFlag(perms, 'settingsNotificationUpdate');
}

export function canSettingsNotificationDelete(perms: UserPermissions): boolean {
	return hasFlag(perms, 'settingsNotificationDelete');
}

export function canToolsServiceCreate(perms: UserPermissions): boolean {
	return hasFlag(perms, 'toolsServiceCreate');
}

export function canToolsServiceUpdate(perms: UserPermissions): boolean {
	return hasFlag(perms, 'toolsServiceUpdate');
}

export function canToolsServiceDelete(perms: UserPermissions): boolean {
	return hasFlag(perms, 'toolsServiceDelete');
}

export function canToolsAppCreate(perms: UserPermissions): boolean {
	return hasFlag(perms, 'toolsAppCreate');
}

export function canToolsAppUpdate(perms: UserPermissions): boolean {
	return hasFlag(perms, 'toolsAppUpdate');
}

export function canToolsAppDelete(perms: UserPermissions): boolean {
	return hasFlag(perms, 'toolsAppDelete');
}

export function canToolsGuideCreate(perms: UserPermissions): boolean {
	return hasFlag(perms, 'toolsGuideCreate');
}

export function canToolsGuideUpdate(perms: UserPermissions): boolean {
	return hasFlag(perms, 'toolsGuideUpdate');
}

export function canToolsGuideDelete(perms: UserPermissions): boolean {
	return hasFlag(perms, 'toolsGuideDelete');
}

export function canToolsLearningCreate(perms: UserPermissions): boolean {
	return hasFlag(perms, 'toolsLearningCreate');
}

export function canToolsLearningUpdate(perms: UserPermissions): boolean {
	return hasFlag(perms, 'toolsLearningUpdate');
}

export function canToolsLearningDelete(perms: UserPermissions): boolean {
	return hasFlag(perms, 'toolsLearningDelete');
}

export function canAccessService(availableServices: { id: string }[], serviceId: string): boolean {
	return availableServices.some((service) => service.id === serviceId);
}
