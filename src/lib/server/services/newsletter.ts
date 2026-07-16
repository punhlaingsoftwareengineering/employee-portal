import { desc, eq } from 'drizzle-orm';
import { error } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { newsletter } from '$lib/server/db/schema/newsletter';
import {
	createNewsletterSchema,
	updateNewsletterSchema,
	type CreateNewsletterInput,
	type UpdateNewsletterInput
} from '$lib/schemas/newsletter';
import type { UserPermissions } from '$lib/server/permissions';

function requireAdmin(perms: UserPermissions) {
	if (!perms.isAdmin) error(403, 'Forbidden');
}

export async function listNewsletters(_perms: UserPermissions) {
	return db.query.newsletter.findMany({
		orderBy: [desc(newsletter.createdAt)]
	});
}

/** Newest newsletters for the public onboarding page (max `limit`). */
export async function listPublicNewsletters(limit = 8) {
	return db.query.newsletter.findMany({
		orderBy: [desc(newsletter.createdAt)],
		limit
	});
}

export async function getNewsletter(perms: UserPermissions, id: string) {
	const record = await db.query.newsletter.findFirst({
		where: eq(newsletter.id, id)
	});

	if (!record) error(404, 'Newsletter not found');
	return record;
}

export async function createNewsletter(perms: UserPermissions, input: CreateNewsletterInput) {
	requireAdmin(perms);

	const data = createNewsletterSchema.parse(input);
	const [record] = await db.insert(newsletter).values(data).returning();
	return record;
}

export async function updateNewsletter(
	perms: UserPermissions,
	id: string,
	input: UpdateNewsletterInput
) {
	requireAdmin(perms);

	await getNewsletter(perms, id);
	const data = updateNewsletterSchema.parse(input);

	const [record] = await db
		.update(newsletter)
		.set({ ...data, updatedAt: new Date() })
		.where(eq(newsletter.id, id))
		.returning();

	return record;
}

export async function deleteNewsletter(perms: UserPermissions, id: string) {
	requireAdmin(perms);

	await getNewsletter(perms, id);
	await db.delete(newsletter).where(eq(newsletter.id, id));
}
