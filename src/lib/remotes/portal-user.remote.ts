import { query, command } from '$app/server';
import { getRequestEvent } from '$app/server';
import { z } from 'zod';
import * as portalUserService from '$lib/server/services/portal-user';
import * as inviteService from '$lib/server/services/user-invite';
import * as facilityService from '$lib/server/services/facility';
import * as departmentService from '$lib/server/services/department';
import { updateUserAccessSchema } from '$lib/schemas/portal-user';
import { createInviteSchema } from '$lib/schemas/user-invite';
import { requireAdmin } from '$lib/server/auth-guard';

async function adminPerms() {
	return requireAdmin(getRequestEvent());
}

export const getPortalUsers = query(async () => {
	await adminPerms();
	return portalUserService.listPortalUsers();
});

export const getPortalUser = query(z.string().min(1), async (userId) => {
	await adminPerms();
	const users = await portalUserService.listPortalUsers();
	const portalUser = users.find((entry) => entry.id === userId);
	if (!portalUser) throw new Error('User not found');
	return portalUser;
});

export const getInvites = query(async () => {
	await adminPerms();
	return inviteService.listInvites();
});

export const getAllDepartments = query(async () => {
	await adminPerms();
	return departmentService.listAllDepartments();
});

export const getAllFacilities = query(async () => {
	await adminPerms();
	return facilityService.listAllFacilities();
});

export const updateUserAccess = command(updateUserAccessSchema, async (data) => {
	await adminPerms();
	await portalUserService.updateUserAccess(data);
	void getPortalUsers().refresh();
});

export const createInvite = command(createInviteSchema, async (data) => {
	const perms = await adminPerms();
	await inviteService.createInvite(perms.userId, data);
	void getInvites().refresh();
});

export const resendInvite = command(z.string().uuid(), async (id) => {
	await adminPerms();
	await inviteService.resendInvite(id);
	void getInvites().refresh();
});

export const revokeInvite = command(z.string().uuid(), async (id) => {
	await adminPerms();
	await inviteService.revokeInvite(id);
	void getInvites().refresh();
});
