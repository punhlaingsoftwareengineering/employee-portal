import { and, eq } from 'drizzle-orm';
import { ORIGIN } from '$app/env/private';
import {
	BUILTIN_SERVICES,
	getBuiltinServiceDefinition,
	isBuiltinServiceId,
	type BuiltinServiceDefinition
} from '$lib/constants/builtin-services';
import { db } from '$lib/server/db';
import { accessRole } from '$lib/server/db/schema/access-role';
import { accessRoleService } from '$lib/server/db/schema/access-role-service';
import { service } from '$lib/server/db/schema/service';

let ensurePromise: Promise<void> | null = null;

function builtinServiceLink(definition: BuiltinServiceDefinition, origin: string): string {
	const base = origin.replace(/\/$/, '');
	return `${base}${definition.path}`;
}

async function assignBuiltinServiceToToolsRoles(serviceId: string) {
	const roles = await db.query.accessRole.findMany({
		where: eq(accessRole.navTools, true),
		columns: { id: true }
	});

	for (const role of roles) {
		const existing = await db.query.accessRoleService.findFirst({
			where: and(
				eq(accessRoleService.roleId, role.id),
				eq(accessRoleService.serviceId, serviceId)
			),
			columns: { serviceId: true }
		});
		if (existing) continue;

		await db.insert(accessRoleService).values({
			roleId: role.id,
			serviceId
		});
	}
}

async function upsertBuiltinService(definition: BuiltinServiceDefinition, origin: string) {
	const link = builtinServiceLink(definition, origin);
	const existing = await db.query.service.findFirst({
		where: eq(service.id, definition.id)
	});

	if (existing) {
		await db
			.update(service)
			.set({
				name: definition.name,
				description: definition.description,
				category: definition.category,
				accentColor: definition.accentColor,
				link,
				embedMode: definition.embedMode,
				isPublic: definition.isPublic,
				updatedAt: new Date()
			})
			.where(eq(service.id, definition.id));
		return;
	}

	await db.insert(service).values({
		id: definition.id,
		name: definition.name,
		description: definition.description,
		category: definition.category,
		accentColor: definition.accentColor,
		link,
		iconUrl: null,
		embedMode: definition.embedMode,
		isPublic: definition.isPublic
	});

	await assignBuiltinServiceToToolsRoles(definition.id);
}

export async function ensureBuiltinServices(origin: string = ORIGIN) {
	for (const definition of BUILTIN_SERVICES) {
		await upsertBuiltinService(definition, origin);
	}
}

export function ensureBuiltinServicesOnce(origin: string = ORIGIN): Promise<void> {
	ensurePromise ??= ensureBuiltinServices(origin).catch((error) => {
		ensurePromise = null;
		throw error;
	});
	return ensurePromise;
}

export function isBuiltinPortalServiceLink(serviceId: string, link: string, origin: string = ORIGIN): boolean {
	if (!isBuiltinServiceId(serviceId)) return false;

	const definition = getBuiltinServiceDefinition(serviceId);
	if (!definition) return false;

	try {
		const parsed = new URL(link);
		const base = new URL(origin);
		return parsed.origin === base.origin && parsed.pathname === definition.path;
	} catch {
		return false;
	}
}
