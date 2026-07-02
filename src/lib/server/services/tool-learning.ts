import { asc, desc, eq } from 'drizzle-orm';
import { error } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { toolLearning } from '$lib/server/db/schema/tool-learning';
import {
	createToolLearningSchema,
	updateToolLearningSchema,
	type CreateToolLearningInput,
	type UpdateToolLearningInput
} from '$lib/schemas/tool-learning';
import type { UserPermissions } from '$lib/server/permissions';

const learningOrder = [asc(toolLearning.sortOrder), desc(toolLearning.createdAt)];

function requireAdmin(perms: UserPermissions) {
	if (!perms.isAdmin) error(403, 'Forbidden');
}

export async function listToolLearnings(_perms: UserPermissions) {
	return db.query.toolLearning.findMany({
		orderBy: learningOrder
	});
}

export async function getToolLearning(perms: UserPermissions, id: string) {
	const record = await db.query.toolLearning.findFirst({
		where: eq(toolLearning.id, id)
	});

	if (!record) error(404, 'Learning item not found');
	return record;
}

export async function createToolLearning(perms: UserPermissions, input: CreateToolLearningInput) {
	requireAdmin(perms);

	const data = createToolLearningSchema.parse(input);
	const [record] = await db.insert(toolLearning).values(data).returning();
	return record;
}

export async function updateToolLearning(
	perms: UserPermissions,
	id: string,
	input: UpdateToolLearningInput
) {
	requireAdmin(perms);

	await getToolLearning(perms, id);
	const data = updateToolLearningSchema.parse(input);

	const [record] = await db
		.update(toolLearning)
		.set({ ...data, updatedAt: new Date() })
		.where(eq(toolLearning.id, id))
		.returning();

	return record;
}

export async function deleteToolLearning(perms: UserPermissions, id: string) {
	requireAdmin(perms);

	await getToolLearning(perms, id);
	await db.delete(toolLearning).where(eq(toolLearning.id, id));
}
