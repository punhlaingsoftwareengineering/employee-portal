import { query, command } from '$app/server';
import { getRequestEvent } from '$app/server';
import * as appService from '$lib/server/services/app';
import { createAppSchema, updateAppSchema } from '$lib/schemas/app';
import { requireAdmin, requireToolsAccess } from '$lib/server/auth-guard';
import { getUserPermissions } from '$lib/server/services/portal-user';
import { z } from 'zod';

async function adminPerms() {
	return requireAdmin(getRequestEvent());
}

async function toolsPerms() {
	const event = getRequestEvent();
	const perms = await requireToolsAccess(event);
	return { event, perms };
}

export const getApps = query(async () => {
	await adminPerms();
	return appService.listApps();
});

export const getAvailableApps = query(async () => {
	const { perms } = await toolsPerms();
	return appService.getAppsForUser(perms);
});

export const getRoleAppIds = query(z.string().uuid(), async (roleId) => {
	await adminPerms();
	return appService.getRoleAppIds(roleId);
});

export const getApp = query(z.string().uuid(), async (id) => {
	const { perms } = await toolsPerms();
	return appService.getAppForUser(perms, id);
});

export const createApp = command(createAppSchema, async (data) => {
	await adminPerms();
	const record = await appService.createApp(data);
	void getApps().refresh();
	void getAvailableApps().refresh();
	return record;
});

export const updateApp = command(updateAppSchema, async (data) => {
	await adminPerms();
	const record = await appService.updateApp(data);
	void getApps().refresh();
	void getAvailableApps().refresh();
	void getApp(data.id).refresh();
	return record;
});

export const deleteApp = command(z.string().uuid(), async (id) => {
	await adminPerms();
	await appService.deleteApp(id);
	void getApps().refresh();
	void getAvailableApps().refresh();
});
