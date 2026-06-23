import { query, command } from '$app/server';
import { getRequestEvent } from '$app/server';
import * as accessRoleService from '$lib/server/services/access-role';
import { createAccessRoleSchema, updateAccessRoleSchema } from '$lib/schemas/access-role';
import { requireAdmin, requireAppAccess } from '$lib/server/auth-guard';
import { getAvailableServices } from '$lib/remotes/service.remote';
import { getAvailableApps } from '$lib/remotes/app.remote';
import { z } from 'zod';

async function adminPerms() {
	return requireAdmin(getRequestEvent());
}

export const getAccessRoles = query(async () => {
	await adminPerms();
	return accessRoleService.listAccessRoles();
});

export const getAssignmentRoles = query(async () => {
	await requireAppAccess(getRequestEvent());
	return accessRoleService.listRolesForAssignment();
});

export const createAccessRole = command(createAccessRoleSchema, async (data) => {
	await adminPerms();
	const role = await accessRoleService.createAccessRole(data);
	void getAccessRoles().refresh();
	void getAvailableServices().refresh();
	void getAvailableApps().refresh();
	return role;
});

export const updateAccessRole = command(updateAccessRoleSchema, async (data) => {
	await adminPerms();
	const role = await accessRoleService.updateAccessRole(data);
	void getAccessRoles().refresh();
	void getAvailableServices().refresh();
	void getAvailableApps().refresh();
	return role;
});

export const deleteAccessRole = command(z.string().uuid(), async (id) => {
	await adminPerms();
	await accessRoleService.deleteAccessRole(id);
	void getAccessRoles().refresh();
	void getAvailableServices().refresh();
	void getAvailableApps().refresh();
});
