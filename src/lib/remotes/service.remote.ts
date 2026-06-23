import { query, command } from '$app/server';
import { getRequestEvent } from '$app/server';
import * as serviceService from '$lib/server/services/service';
import { createServiceSchema, updateServiceSchema } from '$lib/schemas/service';
import { requireAdmin, requireAppAccess } from '$lib/server/auth-guard';
import { z } from 'zod';

async function adminPerms() {
	return requireAdmin(getRequestEvent());
}

async function appPerms() {
	const event = getRequestEvent();
	const perms = await requireAppAccess(event);
	return { event, perms };
}

export const getServices = query(async () => {
	await adminPerms();
	return serviceService.listServices();
});

export const getAvailableServices = query(async () => {
	const { perms } = await appPerms();
	return serviceService.getServicesForUser(perms);
});

export const getRoleServiceIds = query(z.string().uuid(), async (roleId) => {
	await adminPerms();
	return serviceService.getRoleServiceIds(roleId);
});

export const createService = command(createServiceSchema, async (data) => {
	await adminPerms();
	const record = await serviceService.createService(data);
	void getServices().refresh();
	void getAvailableServices().refresh();
	return record;
});

export const updateService = command(updateServiceSchema, async (data) => {
	await adminPerms();
	const record = await serviceService.updateService(data);
	void getServices().refresh();
	void getAvailableServices().refresh();
	return record;
});

export const deleteService = command(z.string().uuid(), async (id) => {
	await adminPerms();
	await serviceService.deleteService(id);
	void getServices().refresh();
	void getAvailableServices().refresh();
});

export const getServiceLinkStatuses = query(z.array(z.string().uuid()), async (serviceIds) => {
	const event = getRequestEvent();
	if (event.locals.user) {
		const perms = await requireAppAccess(event);
		return serviceService.getServiceLinkStatuses(serviceIds, perms);
	}
	return serviceService.getServiceLinkStatuses(serviceIds, 'public');
});
