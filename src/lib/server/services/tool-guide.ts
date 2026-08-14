import { asc, desc, eq } from 'drizzle-orm';
import { error } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { toolGuide } from '$lib/server/db/schema/tool-guide';
import {
	createToolGuideSchema,
	updateToolGuideSchema,
	type CreateToolGuideInput,
	type UpdateToolGuideInput
} from '$lib/schemas/tool-guide';
import {
	canToolsGuideCreate,
	canToolsGuideDelete,
	canToolsGuideUpdate,
	type UserPermissions
} from '$lib/server/permissions';

const guideOrder = [asc(toolGuide.sortOrder), desc(toolGuide.createdAt)];

function assertCanCreate(perms: UserPermissions) {
	if (!canToolsGuideCreate(perms)) error(403, 'Forbidden');
}

function assertCanUpdate(perms: UserPermissions) {
	if (!canToolsGuideUpdate(perms)) error(403, 'Forbidden');
}

function assertCanDelete(perms: UserPermissions) {
	if (!canToolsGuideDelete(perms)) error(403, 'Forbidden');
}

export async function listToolGuides(_perms: UserPermissions) {
	return db.query.toolGuide.findMany({
		orderBy: guideOrder
	});
}

export async function getToolGuide(perms: UserPermissions, id: string) {
	const record = await db.query.toolGuide.findFirst({
		where: eq(toolGuide.id, id)
	});

	if (!record) error(404, 'Guide not found');
	return record;
}

export async function createToolGuide(perms: UserPermissions, input: CreateToolGuideInput) {
	assertCanCreate(perms);

	const data = createToolGuideSchema.parse(input);
	const [record] = await db.insert(toolGuide).values(data).returning();
	return record;
}

export async function updateToolGuide(
	perms: UserPermissions,
	id: string,
	input: UpdateToolGuideInput
) {
	assertCanUpdate(perms);

	await getToolGuide(perms, id);
	const data = updateToolGuideSchema.parse(input);

	const [record] = await db
		.update(toolGuide)
		.set({ ...data, updatedAt: new Date() })
		.where(eq(toolGuide.id, id))
		.returning();

	return record;
}

export async function deleteToolGuide(perms: UserPermissions, id: string) {
	assertCanDelete(perms);

	await getToolGuide(perms, id);
	await db.delete(toolGuide).where(eq(toolGuide.id, id));
}
