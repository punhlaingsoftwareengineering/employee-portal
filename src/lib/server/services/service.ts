import { eq, asc, inArray, sql, and } from 'drizzle-orm';
import { error } from '@sveltejs/kit';
import { isBuiltinServiceId } from '$lib/constants/builtin-services';
import { db } from '$lib/server/db';
import { service } from '$lib/server/db/schema/service';
import { accessRoleService } from '$lib/server/db/schema/access-role-service';
import {
	createServiceSchema,
	updateServiceSchema,
	serviceEmbedModeSchema,
	type CreateServiceInput,
	type UpdateServiceInput,
	type ServiceSummary
} from '$lib/schemas/service';
import type { UserPermissions } from '$lib/server/permissions';
import {
	checkServiceLinkHealth,
	mapWithConcurrency,
	type ServiceLinkHealth
} from '$lib/server/services/service-link-health';
import {
	ensureBuiltinServicesOnce,
	isBuiltinPortalServiceLink
} from '$lib/server/services/builtin-service';

export type ServiceLinkStatusMap = Record<string, ServiceLinkHealth>;

export async function listServices() {
	await ensureBuiltinServicesOnce();
	return db.query.service.findMany({ orderBy: [asc(service.name)] });
}

async function listPublicServiceRows() {
	return db.query.service.findMany({
		where: eq(service.isPublic, true),
		orderBy: [asc(service.name)]
	});
}

export async function listPublicServices(): Promise<ServiceSummary[]> {
	const rows = await listPublicServiceRows();
	return rows.map(toServiceSummary);
}

function toServiceSummary(row: typeof service.$inferSelect): ServiceSummary {
	const embedMode = serviceEmbedModeSchema.safeParse(row.embedMode);
	return {
		id: row.id,
		name: row.name,
		description: row.description,
		category: row.category,
		accentColor: row.accentColor,
		link: row.link,
		iconUrl: row.iconUrl,
		embedMode: embedMode.success ? embedMode.data : 'external',
		isPublic: row.isPublic
	};
}

function mergeServicesByName(
	...lists: (typeof service.$inferSelect)[][]
): (typeof service.$inferSelect)[] {
	const seen = new Set<string>();
	const results: (typeof service.$inferSelect)[] = [];

	for (const list of lists) {
		for (const item of list) {
			if (seen.has(item.id)) continue;
			seen.add(item.id);
			results.push(item);
		}
	}

	return results.sort((a, b) => a.name.localeCompare(b.name));
}

export async function getService(id: string) {
	const record = await db.query.service.findFirst({
		where: eq(service.id, id)
	});
	if (!record) error(404, 'Service not found');
	return record;
}

export async function createService(input: CreateServiceInput) {
	const data = createServiceSchema.parse(input);
	const [record] = await db
		.insert(service)
		.values({ ...data, embedMode: data.embedMode ?? 'external', isPublic: data.isPublic ?? false })
		.returning();
	return record;
}

export async function updateService(input: UpdateServiceInput) {
	const data = updateServiceSchema.parse(input);
	await getService(data.id);

	const { id, embedMode: _embedMode, ...patch } = data;
	const [record] = await db
		.update(service)
		.set({ ...patch, embedMode: 'external', updatedAt: new Date() })
		.where(eq(service.id, id))
		.returning();

	return record;
}

export async function deleteService(id: string) {
	if (isBuiltinServiceId(id)) {
		error(400, 'Built-in portal services cannot be deleted');
	}
	await getService(id);
	await db.delete(service).where(eq(service.id, id));
}

export async function getRoleServiceIds(roleId: string): Promise<string[]> {
	const rows = await db.query.accessRoleService.findMany({
		where: eq(accessRoleService.roleId, roleId),
		columns: { serviceId: true }
	});
	return rows.map((row) => row.serviceId);
}

export async function setRoleServices(roleId: string, serviceIds: string[]) {
	const uniqueIds = [...new Set(serviceIds)];

	if (uniqueIds.length > 0) {
		const existing = await db.query.service.findMany({
			where: inArray(service.id, uniqueIds),
			columns: { id: true }
		});
		if (existing.length !== uniqueIds.length) {
			error(400, 'One or more services do not exist');
		}
	}

	await db.delete(accessRoleService).where(eq(accessRoleService.roleId, roleId));

	if (uniqueIds.length === 0) return;

	await db.insert(accessRoleService).values(
		uniqueIds.map((serviceId) => ({
			roleId,
			serviceId
		}))
	);
}

export async function getServiceCountsByRole(): Promise<Map<string, number>> {
	const rows = await db
		.select({
			roleId: accessRoleService.roleId,
			count: sql<number>`count(*)::int`
		})
		.from(accessRoleService)
		.groupBy(accessRoleService.roleId);

	return new Map(rows.map((row) => [row.roleId, row.count]));
}

export async function getServicesForUser(permissions: UserPermissions) {
	await ensureBuiltinServicesOnce();

	if (permissions.isAdmin) {
		return listServices();
	}

	const publicServices = await listPublicServiceRows();

	const roleIds = [...new Set(permissions.departmentRoles.map((assignment) => assignment.roleId))];
	if (roleIds.length === 0) return publicServices;

	const assignments = await db.query.accessRoleService.findMany({
		where: inArray(accessRoleService.roleId, roleIds),
		with: { service: true }
	});

	const roleServices = assignments.map((assignment) => assignment.service);
	return mergeServicesByName(publicServices, roleServices);
}

export async function canUserAccessService(
	permissions: UserPermissions,
	serviceId: string
): Promise<boolean> {
	const record = await db.query.service.findFirst({
		where: eq(service.id, serviceId),
		columns: { id: true, isPublic: true }
	});
	if (!record) return false;
	if (record.isPublic) return true;

	if (permissions.isAdmin) return true;

	const roleIds = [...new Set(permissions.departmentRoles.map((assignment) => assignment.roleId))];
	if (roleIds.length === 0) return false;

	const assignment = await db.query.accessRoleService.findFirst({
		where: and(
			eq(accessRoleService.serviceId, serviceId),
			inArray(accessRoleService.roleId, roleIds)
		),
		columns: { serviceId: true }
	});

	return assignment !== undefined;
}

async function resolveAuthorizedServices(
	serviceIds: string[],
	permissions: UserPermissions | 'public'
): Promise<Array<{ id: string; link: string }>> {
	const uniqueIds = [...new Set(serviceIds)];
	if (uniqueIds.length === 0) return [];

	if (permissions === 'public') {
		const rows = await db.query.service.findMany({
			where: and(inArray(service.id, uniqueIds), eq(service.isPublic, true)),
			columns: { id: true, link: true }
		});
		return rows;
	}

	const allowed = await getServicesForUser(permissions);
	const idSet = new Set(uniqueIds);

	return allowed
		.filter((item) => idSet.has(item.id))
		.map((item) => ({ id: item.id, link: item.link }));
}

export async function getServiceLinkStatuses(
	serviceIds: string[],
	permissions: UserPermissions | 'public'
): Promise<ServiceLinkStatusMap> {
	const authorized = await resolveAuthorizedServices(serviceIds, permissions);
	const statuses: ServiceLinkStatusMap = {};

	for (const id of serviceIds) {
		statuses[id] = 'down';
	}

	const urlToIds = new Map<string, string[]>();
	for (const item of authorized) {
		const ids = urlToIds.get(item.link) ?? [];
		ids.push(item.id);
		urlToIds.set(item.link, ids);
	}

	const uniqueUrls = [...urlToIds.keys()];
	const healthResults = await mapWithConcurrency(uniqueUrls, 5, async (url) => {
		const serviceIds = urlToIds.get(url) ?? [];
		if (serviceIds.some((id) => isBuiltinPortalServiceLink(id, url))) {
			return { url, health: 'up' as const };
		}
		return {
			url,
			health: await checkServiceLinkHealth(url)
		};
	});

	for (const { url, health } of healthResults) {
		for (const id of urlToIds.get(url) ?? []) {
			statuses[id] = health;
		}
	}

	return statuses;
}
