import { query, command } from '$app/server';
import { getRequestEvent } from '$app/server';
import * as serviceService from '$lib/server/services/service';
import { createServiceSchema, updateServiceSchema } from '$lib/schemas/service';
import { requireToolsAccess } from '$lib/server/auth-guard';
import { z } from 'zod';

async function toolsPerms() {
	const event = getRequestEvent();
	const perms = await requireToolsAccess(event);
	return { event, perms };
}

export const getServices = query(async () => {
	await toolsPerms();
	return serviceService.listServices();
});

export const getAvailableServices = query(async () => {
	const { perms } = await toolsPerms();
	return serviceService.getServicesForUser(perms);
});

export const getRoleServiceIds = query(z.string().uuid(), async (roleId) => {
	await toolsPerms();
	return serviceService.getRoleServiceIds(roleId);
});

export const createService = command(createServiceSchema, async (data) => {
	const { perms } = await toolsPerms();
	const record = await serviceService.createService(perms, data);
	void getServices().refresh();
	void getAvailableServices().refresh();
	return record;
});

export const updateService = command(updateServiceSchema, async (data) => {
	const { perms } = await toolsPerms();
	const record = await serviceService.updateService(perms, data);
	void getServices().refresh();
	void getAvailableServices().refresh();
	return record;
});

export const deleteService = command(z.string().uuid(), async (id) => {
	const { perms } = await toolsPerms();
	await serviceService.deleteService(perms, id);
	void getServices().refresh();
	void getAvailableServices().refresh();
});

export const getServiceLinkStatuses = query(z.array(z.string().uuid()), async (serviceIds) => {
	const event = getRequestEvent();
	if (event.locals.user) {
		const perms = await requireToolsAccess(event);
		return serviceService.getServiceLinkStatuses(serviceIds, perms);
	}
	return serviceService.getServiceLinkStatuses(serviceIds, 'public');
});
