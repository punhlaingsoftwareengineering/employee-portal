import { and, eq } from 'drizzle-orm';
import { DRIVE_ORIGIN, ORIGIN } from '$app/env/private';
import {
	BUILTIN_SERVICES,
	PHH_DRIVE_SERVICE_ID,
	getBuiltinServiceDefinition,
	isBuiltinServiceId,
	type BuiltinServiceDefinition
} from '$lib/constants/builtin-services';
import type { ServiceEmbedMode } from '$lib/constants/service-embed';
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

async function upsertServiceRow(input: {
	id: string;
	name: string;
	description: string;
	category: string;
	accentColor: string;
	link: string;
	embedMode: ServiceEmbedMode;
	isPublic: boolean;
	assignToolsRoles?: boolean;
}) {
	const existing = await db.query.service.findFirst({
		where: eq(service.id, input.id)
	});

	if (existing) {
		await db
			.update(service)
			.set({
				name: input.name,
				description: input.description,
				category: input.category,
				accentColor: input.accentColor,
				link: input.link,
				embedMode: input.embedMode,
				isPublic: input.isPublic,
				updatedAt: new Date()
			})
			.where(eq(service.id, input.id));
		return;
	}

	await db.insert(service).values({
		id: input.id,
		name: input.name,
		description: input.description,
		category: input.category,
		accentColor: input.accentColor,
		link: input.link,
		iconUrl: null,
		embedMode: input.embedMode,
		isPublic: input.isPublic
	});

	if (input.assignToolsRoles !== false) {
		await assignBuiltinServiceToToolsRoles(input.id);
	}
}

async function upsertBuiltinService(definition: BuiltinServiceDefinition, origin: string) {
	await upsertServiceRow({
		id: definition.id,
		name: definition.name,
		description: definition.description,
		category: definition.category,
		accentColor: definition.accentColor,
		link: builtinServiceLink(definition, origin),
		embedMode: definition.embedMode,
		isPublic: definition.isPublic
	});
}

async function upsertDriveService() {
	const driveOrigin = DRIVE_ORIGIN?.trim().replace(/\/$/, '');
	if (!driveOrigin) return;

	await upsertServiceRow({
		id: PHH_DRIVE_SERVICE_ID,
		name: 'PHH-DRIVE',
		description: 'Team file storage and sharing',
		category: 'Productivity',
		accentColor: '#0B2D5C',
		link: driveOrigin,
		embedMode: 'external',
		isPublic: false
	});
}

export async function ensureBuiltinServices(origin: string = ORIGIN) {
	for (const definition of BUILTIN_SERVICES) {
		await upsertBuiltinService(definition, origin);
	}
	await upsertDriveService();
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

	if (serviceId === PHH_DRIVE_SERVICE_ID) {
		const driveOrigin = DRIVE_ORIGIN?.trim().replace(/\/$/, '');
		if (!driveOrigin) return false;
		try {
			return new URL(link).origin === new URL(driveOrigin).origin;
		} catch {
			return false;
		}
	}

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
