import { query, command } from '$app/server';
import { getRequestEvent } from '$app/server';
import { error } from '@sveltejs/kit';
import * as accessRoleService from '$lib/server/services/access-role';
import { createAccessRoleSchema, updateAccessRoleSchema } from '$lib/schemas/access-role';
import { getRequestPermissions, requireAppAccess } from '$lib/server/auth-guard';
import {
	canRolesCreate,
	canRolesDelete,
	canRolesRead,
	canRolesUpdate,
	type UserPermissions
} from '$lib/server/permissions';
import { getAvailableServices } from '$lib/remotes/service.remote';
import { getAvailableApps } from '$lib/remotes/app.remote';
import { z } from 'zod';

async function rolePerms() {
	return getRequestPermissions(getRequestEvent());
}

function assertCanRead(perms: UserPermissions) {
	if (!canRolesRead(perms)) error(403, 'Forbidden');
}

function assertCanCreate(perms: UserPermissions) {
	if (!canRolesCreate(perms)) error(403, 'Forbidden');
}

function assertCanUpdate(perms: UserPermissions) {
	if (!canRolesUpdate(perms)) error(403, 'Forbidden');
}

function assertCanDelete(perms: UserPermissions) {
	if (!canRolesDelete(perms)) error(403, 'Forbidden');
}

export const getAccessRoles = query(async () => {
	assertCanRead(await rolePerms());
	return accessRoleService.listAccessRoles();
});

export const getAssignmentRoles = query(async () => {
	await requireAppAccess(getRequestEvent());
	return accessRoleService.listRolesForAssignment();
});

export const createAccessRole = command(createAccessRoleSchema, async (data) => {
	assertCanCreate(await rolePerms());
	const role = await accessRoleService.createAccessRole(data);
	void getAccessRoles().refresh();
	void getAvailableServices().refresh();
	void getAvailableApps().refresh();
	return role;
});

export const updateAccessRole = command(updateAccessRoleSchema, async (data) => {
	assertCanUpdate(await rolePerms());
	const role = await accessRoleService.updateAccessRole(data);
	void getAccessRoles().refresh();
	void getAvailableServices().refresh();
	void getAvailableApps().refresh();
	return role;
});

export const deleteAccessRole = command(z.string().uuid(), async (id) => {
	assertCanDelete(await rolePerms());
	await accessRoleService.deleteAccessRole(id);
	void getAccessRoles().refresh();
	void getAvailableServices().refresh();
	void getAvailableApps().refresh();
});
