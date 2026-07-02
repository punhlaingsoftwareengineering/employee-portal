import { desc, eq, ne } from 'drizzle-orm';
import { error } from '@sveltejs/kit';
import { isOptionalFeatureDbError } from '$lib/server/db/errors';
import { db } from '$lib/server/db';
import { announcement } from '$lib/server/db/schema/announcement';
import {
	createAnnouncementSchema,
	updateAnnouncementSchema,
	type CreateAnnouncementInput,
	type UpdateAnnouncementInput
} from '$lib/schemas/announcement';
import type { UserPermissions } from '$lib/server/permissions';

function requireAdmin(perms: UserPermissions) {
	if (!perms.isAdmin) error(403, 'Forbidden');
}

async function deactivateOtherAnnouncements(excludeId?: string) {
	const where = excludeId
		? ne(announcement.id, excludeId)
		: undefined;

	await db
		.update(announcement)
		.set({ isActive: false, updatedAt: new Date() })
		.where(where);
}

function normalizeAnnouncementInput(
	input: CreateAnnouncementInput | UpdateAnnouncementInput
): Partial<CreateAnnouncementInput> {
	const data = { ...input };

	if (data.type === 'image') {
		data.accentPreset = undefined;
		data.accentColor = undefined;
	} else if (data.type === 'text') {
		data.imageUrl = undefined;
		if (!data.accentPreset) {
			data.accentPreset = 'primary';
		}
	}

	return data;
}

export async function listAnnouncements(_perms: UserPermissions) {
	return db.query.announcement.findMany({
		orderBy: [desc(announcement.updatedAt)]
	});
}

export async function getActiveAnnouncement() {
	try {
		return await db.query.announcement.findFirst({
			where: eq(announcement.isActive, true),
			orderBy: [desc(announcement.updatedAt)]
		});
	} catch (err) {
		if (isOptionalFeatureDbError(err)) {
			console.error('[announcement] skipped — database unavailable:', err);
			return null;
		}
		throw err;
	}
}

export async function getAnnouncement(perms: UserPermissions, id: string) {
	const record = await db.query.announcement.findFirst({
		where: eq(announcement.id, id)
	});

	if (!record) error(404, 'Announcement not found');
	return record;
}

export async function createAnnouncement(perms: UserPermissions, input: CreateAnnouncementInput) {
	requireAdmin(perms);

	const parsed = createAnnouncementSchema.parse(input);
	const data = normalizeAnnouncementInput(parsed) as CreateAnnouncementInput;

	if (data.isActive) {
		await deactivateOtherAnnouncements();
	}

	const [record] = await db
		.insert(announcement)
		.values({
			type: data.type,
			title: data.title,
			body: data.body ?? null,
			linkUrl: data.linkUrl ?? null,
			imageUrl: data.type === 'image' ? (data.imageUrl ?? null) : null,
			accentPreset: data.type === 'text' ? (data.accentPreset ?? 'primary') : 'primary',
			accentColor: data.type === 'text' ? (data.accentColor ?? null) : null,
			isActive: data.isActive ?? false
		})
		.returning();

	return record;
}

export async function updateAnnouncement(
	perms: UserPermissions,
	id: string,
	input: UpdateAnnouncementInput
) {
	requireAdmin(perms);

	const existing = await getAnnouncement(perms, id);
	const data = updateAnnouncementSchema.parse(input);

	if (data.isActive) {
		await deactivateOtherAnnouncements(id);
	}

	const type = data.type ?? existing.type;
	const payload: Partial<typeof announcement.$inferInsert> = {
		updatedAt: new Date()
	};

	if (data.type !== undefined) payload.type = data.type;
	if (data.title !== undefined) payload.title = data.title;
	if (data.body !== undefined) payload.body = data.body ?? null;
	if (data.linkUrl !== undefined) payload.linkUrl = data.linkUrl ?? null;
	if (data.isActive !== undefined) payload.isActive = data.isActive;

	if (type === 'image') {
		if (data.imageUrl !== undefined) payload.imageUrl = data.imageUrl;
		if (data.type === 'image') {
			payload.accentColor = null;
			payload.accentPreset = 'primary';
		}
	} else {
		payload.imageUrl = null;
		if (data.accentPreset !== undefined) payload.accentPreset = data.accentPreset;
		if (data.accentColor !== undefined) payload.accentColor = data.accentColor ?? null;
	}

	const [record] = await db
		.update(announcement)
		.set(payload)
		.where(eq(announcement.id, id))
		.returning();

	return record;
}

export async function deleteAnnouncement(perms: UserPermissions, id: string) {
	requireAdmin(perms);

	await getAnnouncement(perms, id);
	await db.delete(announcement).where(eq(announcement.id, id));
}
