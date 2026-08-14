import type { PortalRole } from '$lib/constants/user-roles';
import type { AccessRolePermissionFlags } from '$lib/constants/access-role-permissions';
import { emptyPermissionFlags } from '$lib/constants/access-role-permissions';

export type DepartmentRoleAssignment = {
	departmentId: string;
	roleId: string;
	facilityId: string;
	roleName?: string;
	roleSlug?: string;
	permissions: AccessRolePermissionFlags;
};

export type UserPermissionsSummary = {
	userId: string;
	portalRole: PortalRole;
	isAdmin: boolean;
	isGuest: boolean;
	departmentRoles: DepartmentRoleAssignment[];
};

function hasFlag(
	permissions: UserPermissionsSummary | null | undefined,
	flag: keyof AccessRolePermissionFlags
): boolean {
	if (!permissions) return false;
	if (permissions.isAdmin) return true;
	return permissions.departmentRoles.some((assignment) => assignment.permissions[flag]);
}

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

export function canAccessUsersPage(
	permissions: UserPermissionsSummary | null | undefined
): boolean {
	if (!permissions) return false;
	if (permissions.isAdmin) return true;
	return permissions.departmentRoles.some((assignment) => {
		const p = assignment.permissions;
		return (
			p.navUsers &&
			(p.usersRead ||
				p.usersInvite ||
				p.usersUpdate ||
				p.usersInviteResend ||
				p.usersInviteRevoke)
		);
	});
}

export function canAccessRolesPage(
	permissions: UserPermissionsSummary | null | undefined
): boolean {
	if (!permissions) return false;
	if (permissions.isAdmin) return true;
	return permissions.departmentRoles.some((assignment) => {
		const p = assignment.permissions;
		return p.navRoles && (p.rolesRead || p.rolesCreate || p.rolesUpdate || p.rolesDelete);
	});
}

export function canAccessToolsManage(
	permissions: UserPermissionsSummary | null | undefined
): boolean {
	if (!permissions) return false;
	if (permissions.isAdmin) return true;
	return permissions.departmentRoles.some((assignment) => {
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

export function permissionFlag(
	permissions: UserPermissionsSummary | null | undefined,
	flag: keyof AccessRolePermissionFlags
): boolean {
	return hasFlag(permissions, flag);
}

export { emptyPermissionFlags };
