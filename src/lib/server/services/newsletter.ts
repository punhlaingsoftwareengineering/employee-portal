import { desc, eq, sql } from 'drizzle-orm';
import { error } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { isOptionalFeatureDbError } from '$lib/server/db/errors';
import { newsletter } from '$lib/server/db/schema/newsletter';
import {
	createNewsletterSchema,
	updateNewsletterSchema,
	type CreateNewsletterInput,
	type UpdateNewsletterInput
} from '$lib/schemas/newsletter';
import {
	canSettingsNewsletterCreate,
	canSettingsNewsletterDelete,
	canSettingsNewsletterUpdate,
	type UserPermissions
} from '$lib/server/permissions';
import { resolveNewsletterMediaKind } from '$lib/server/newsletter-media-kind';
import type { NewsletterMediaKind } from '$lib/utils/newsletter-media';

const newsletterOrder = [desc(newsletter.sortOrder), desc(newsletter.createdAt)];

async function withMediaKinds<T extends { pdfUrl: string; title: string }>(
	rows: T[]
): Promise<Array<T & { mediaKind: NewsletterMediaKind }>> {
	return Promise.all(
		rows.map(async (row) => ({
			...row,
			mediaKind: await resolveNewsletterMediaKind(row.pdfUrl, row.title)
		}))
	);
}

function assertCanCreate(perms: UserPermissions) {
	if (!canSettingsNewsletterCreate(perms)) error(403, 'Forbidden');
}

function assertCanUpdate(perms: UserPermissions) {
	if (!canSettingsNewsletterUpdate(perms)) error(403, 'Forbidden');
}

function assertCanDelete(perms: UserPermissions) {
	if (!canSettingsNewsletterDelete(perms)) error(403, 'Forbidden');
}

async function nextSortOrder(): Promise<number> {
	const [row] = await db
		.select({ max: sql<number>`coalesce(max(${newsletter.sortOrder}), 0)` })
		.from(newsletter);
	return Number(row?.max ?? 0) + 1;
}

export async function listNewsletters(_perms: UserPermissions) {
	try {
		return await db.query.newsletter.findMany({
			orderBy: newsletterOrder
		});
	} catch (err) {
		if (isOptionalFeatureDbError(err)) return [];
		throw err;
	}
}

export async function countNewsletters(): Promise<number> {
	const [row] = await db.select({ count: sql<number>`count(*)::int` }).from(newsletter);
	return Number(row?.count ?? 0);
}

/** Latest newsletters for public onboarding (by sort order, then created). */
export async function listPublicNewsletters(limit = 8) {
	try {
		const rows = await db.query.newsletter.findMany({
			orderBy: newsletterOrder,
			limit
		});
		return withMediaKinds(rows);
	} catch (err) {
		if (isOptionalFeatureDbError(err)) return [];
		throw err;
	}
}

/** Full public list (see more page). */
export async function listAllPublicNewsletters() {
	try {
		const rows = await db.query.newsletter.findMany({
			orderBy: newsletterOrder
		});
		return withMediaKinds(rows);
	} catch (err) {
		if (isOptionalFeatureDbError(err)) return [];
		throw err;
	}
}

export async function getNewsletter(perms: UserPermissions, id: string) {
	const record = await db.query.newsletter.findFirst({
		where: eq(newsletter.id, id)
	});

	if (!record) error(404, 'Newsletter not found');
	return record;
}

export async function createNewsletter(perms: UserPermissions, input: CreateNewsletterInput) {
	assertCanCreate(perms);

	const data = createNewsletterSchema.parse(input);
	const sortOrder = data.sortOrder ?? (await nextSortOrder());
	const [record] = await db
		.insert(newsletter)
		.values({
			title: data.title,
			pdfUrl: data.pdfUrl,
			sortOrder
		})
		.returning();
	return record;
}

export async function updateNewsletter(
	perms: UserPermissions,
	id: string,
	input: UpdateNewsletterInput
) {
	assertCanUpdate(perms);

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
	assertCanDelete(perms);

	await getNewsletter(perms, id);
	await db.delete(newsletter).where(eq(newsletter.id, id));
}
