import { query, command } from '$app/server';
import { getRequestEvent } from '$app/server';
import { error } from '@sveltejs/kit';
import { z } from 'zod';
import * as portalUserService from '$lib/server/services/portal-user';
import * as inviteService from '$lib/server/services/user-invite';
import * as facilityService from '$lib/server/services/facility';
import * as departmentService from '$lib/server/services/department';
import { deletePortalUserSchema, updateUserAccessSchema } from '$lib/schemas/portal-user';
import { createInviteSchema } from '$lib/schemas/user-invite';
import { getRequestPermissions } from '$lib/server/auth-guard';
import {
	canUsersInvite,
	canUsersInviteResend,
	canUsersInviteRevoke,
	canUsersRead,
	canUsersUpdate,
	type UserPermissions
} from '$lib/server/permissions';

async function userPerms() {
	return getRequestPermissions(getRequestEvent());
}

function assertCanRead(perms: UserPermissions) {
	if (!canUsersRead(perms)) error(403, 'Forbidden');
}

function assertCanInvite(perms: UserPermissions) {
	if (!canUsersInvite(perms)) error(403, 'Forbidden');
}

function assertCanUpdate(perms: UserPermissions) {
	if (!canUsersUpdate(perms)) error(403, 'Forbidden');
}

function assertCanInviteResend(perms: UserPermissions) {
	if (!canUsersInviteResend(perms)) error(403, 'Forbidden');
}

function assertCanInviteRevoke(perms: UserPermissions) {
	if (!canUsersInviteRevoke(perms)) error(403, 'Forbidden');
}

function assertIsAdmin(perms: UserPermissions) {
	if (!perms.isAdmin) error(403, 'Forbidden');
}

export const getPortalUsers = query(async () => {
	assertCanRead(await userPerms());
	return portalUserService.listPortalUsers();
});

export const getPortalUser = query(z.string().min(1), async (userId) => {
	assertCanRead(await userPerms());
	const users = await portalUserService.listPortalUsers();
	const portalUser = users.find((entry) => entry.id === userId);
	if (!portalUser) throw new Error('User not found');
	return portalUser;
});

export const getInvites = query(async () => {
	assertCanRead(await userPerms());
	return inviteService.listInvites();
});

export const getAllDepartments = query(async () => {
	assertCanRead(await userPerms());
	return departmentService.listAllDepartments();
});

export const getAllFacilities = query(async () => {
	assertCanRead(await userPerms());
	return facilityService.listAllFacilities();
});

export const updateUserAccess = command(updateUserAccessSchema, async (data) => {
	assertCanUpdate(await userPerms());
	await portalUserService.updateUserAccess(data);
	void getPortalUsers().refresh();
});

export const deletePortalUser = command(deletePortalUserSchema, async (userId) => {
	const perms = await userPerms();
	assertIsAdmin(perms);
	await portalUserService.deletePortalUser(perms, userId);
	void getPortalUsers().refresh();
});

export const createInvite = command(createInviteSchema, async (data) => {
	const perms = await userPerms();
	assertCanInvite(perms);
	await inviteService.createInvite(perms.userId, data);
	void getInvites().refresh();
});

export const resendInvite = command(z.string().uuid(), async (id) => {
	assertCanInviteResend(await userPerms());
	await inviteService.resendInvite(id);
	void getInvites().refresh();
});

export const revokeInvite = command(z.string().uuid(), async (id) => {
	assertCanInviteRevoke(await userPerms());
	await inviteService.revokeInvite(id);
	void getInvites().refresh();
});
