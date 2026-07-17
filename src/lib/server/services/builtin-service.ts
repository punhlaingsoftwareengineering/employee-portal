import { and, eq } from 'drizzle-orm';
import {
	DOCS_ORIGIN,
	DRIVE_ORIGIN,
	CALLTRACKER_ORIGIN,
	MARI_CHATBOT_ORIGIN,
	N8N_MONITOR_ORIGIN,
	ORDER_RESEND_ORIGIN,
	ORIGIN
} from '$app/env/private';
import {
	BUILTIN_SERVICES,
	CALLTRACKER_SERVICE_ID,
	DOCS_SERVICE_ID,
	MARI_CHATBOT_SERVICE_ID,
	N8N_MONITOR_SERVICE_ID,
	ORDER_RESEND_SERVICE_ID,
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

async function upsertDocsService() {
	const docsOrigin = DOCS_ORIGIN?.trim().replace(/\/$/, '');
	if (!docsOrigin) return;

	await upsertServiceRow({
		id: DOCS_SERVICE_ID,
		name: 'Documentation',
		description: 'Software documentation and CMS',
		category: 'Productivity',
		accentColor: '#0B2D5C',
		link: docsOrigin,
		embedMode: 'external',
		isPublic: false
	});
}

async function upsertOrderResendService() {
	const orderResendOrigin = ORDER_RESEND_ORIGIN?.trim().replace(/\/$/, '');
	if (!orderResendOrigin) return;

	await upsertServiceRow({
		id: ORDER_RESEND_SERVICE_ID,
		name: 'OmegaAi Order Resend',
		description: 'Search and resend RIS lab results to PACS',
		category: 'Clinical',
		accentColor: '#0B2D5C',
		link: orderResendOrigin,
		embedMode: 'external',
		isPublic: false
	});
}

async function upsertMariChatbotService() {
	const mariOrigin = MARI_CHATBOT_ORIGIN?.trim().replace(/\/$/, '');
	if (!mariOrigin) return;

	await upsertServiceRow({
		id: MARI_CHATBOT_SERVICE_ID,
		name: 'Mari Chatbot',
		description: 'AI chatbots powered by n8n workflows',
		category: 'Productivity',
		accentColor: '#0B2D5C',
		link: mariOrigin,
		embedMode: 'external',
		isPublic: false
	});
}

async function upsertN8nMonitorService() {
	const monitorOrigin = N8N_MONITOR_ORIGIN?.trim().replace(/\/$/, '');
	if (!monitorOrigin) return;

	await upsertServiceRow({
		id: N8N_MONITOR_SERVICE_ID,
		name: 'n8n Monitor',
		description: 'Realtime monitor for published n8n workflow executions',
		category: 'Productivity',
		accentColor: '#0B2D5C',
		link: monitorOrigin,
		embedMode: 'external',
		isPublic: false
	});
}

async function upsertCallTrackerService() {
	const calltrackerOrigin = CALLTRACKER_ORIGIN?.trim().replace(/\/$/, '');
	if (!calltrackerOrigin) return;

	await upsertServiceRow({
		id: CALLTRACKER_SERVICE_ID,
		name: '3CX Call Tracker',
		description: 'Dashboard for 3CX route tracker call analytics',
		category: 'Productivity',
		accentColor: '#0B2D5C',
		link: calltrackerOrigin,
		embedMode: 'external',
		isPublic: false
	});
}

export async function ensureBuiltinServices(origin: string = ORIGIN) {
	for (const definition of BUILTIN_SERVICES) {
		await upsertBuiltinService(definition, origin);
	}
	await upsertDriveService();
	await upsertDocsService();
	await upsertOrderResendService();
	await upsertMariChatbotService();
	await upsertN8nMonitorService();
	await upsertCallTrackerService();
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

	if (serviceId === DOCS_SERVICE_ID) {
		const docsOrigin = DOCS_ORIGIN?.trim().replace(/\/$/, '');
		if (!docsOrigin) return false;
		try {
			return new URL(link).origin === new URL(docsOrigin).origin;
		} catch {
			return false;
		}
	}

	if (serviceId === ORDER_RESEND_SERVICE_ID) {
		const orderResendOrigin = ORDER_RESEND_ORIGIN?.trim().replace(/\/$/, '');
		if (!orderResendOrigin) return false;
		try {
			return new URL(link).origin === new URL(orderResendOrigin).origin;
		} catch {
			return false;
		}
	}

	if (serviceId === MARI_CHATBOT_SERVICE_ID) {
		const mariOrigin = MARI_CHATBOT_ORIGIN?.trim().replace(/\/$/, '');
		if (!mariOrigin) return false;
		try {
			return new URL(link).origin === new URL(mariOrigin).origin;
		} catch {
			return false;
		}
	}

	if (serviceId === N8N_MONITOR_SERVICE_ID) {
		const monitorOrigin = N8N_MONITOR_ORIGIN?.trim().replace(/\/$/, '');
		if (!monitorOrigin) return false;
		try {
			return new URL(link).origin === new URL(monitorOrigin).origin;
		} catch {
			return false;
		}
	}

	if (serviceId === CALLTRACKER_SERVICE_ID) {
		const calltrackerOrigin = CALLTRACKER_ORIGIN?.trim().replace(/\/$/, '');
		if (!calltrackerOrigin) return false;
		try {
			return new URL(link).origin === new URL(calltrackerOrigin).origin;
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
