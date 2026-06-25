import { asc, desc, eq, ne } from 'drizzle-orm';
import { error } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { notificationSound } from '$lib/server/db/schema/notification-sound';
import {
	createNotificationSoundSchema,
	updateNotificationSoundSchema,
	type CreateNotificationSoundInput,
	type UpdateNotificationSoundInput
} from '$lib/schemas/notification-sound';
import { canAccessSettings, type UserPermissions } from '$lib/server/permissions';

function requireSettingsAccess(perms: UserPermissions) {
	if (!canAccessSettings(perms)) error(403, 'Forbidden');
}

async function clearOtherDefaults(excludeId?: string) {
	await db
		.update(notificationSound)
		.set({ isDefault: false, updatedAt: new Date() })
		.where(excludeId ? ne(notificationSound.id, excludeId) : undefined);
}

export async function listNotificationSounds(perms: UserPermissions) {
	requireSettingsAccess(perms);

	return db.query.notificationSound.findMany({
		orderBy: [desc(notificationSound.isDefault), asc(notificationSound.name)]
	});
}

export async function getNotificationSound(perms: UserPermissions, id: string) {
	requireSettingsAccess(perms);

	const record = await db.query.notificationSound.findFirst({
		where: eq(notificationSound.id, id)
	});

	if (!record) error(404, 'Notification sound not found');
	return record;
}

export async function getDefaultNotificationSound() {
	const defaultSound = await db.query.notificationSound.findFirst({
		where: eq(notificationSound.isDefault, true)
	});

	if (defaultSound) return defaultSound;

	return db.query.notificationSound.findFirst({
		orderBy: [asc(notificationSound.createdAt)]
	});
}

export async function createNotificationSound(
	perms: UserPermissions,
	input: CreateNotificationSoundInput
) {
	requireSettingsAccess(perms);

	const data = createNotificationSoundSchema.parse(input);

	if (data.isDefault) {
		await clearOtherDefaults();
	}

	const [record] = await db
		.insert(notificationSound)
		.values({
			name: data.name,
			mp3Url: data.mp3Url,
			isDefault: data.isDefault ?? false
		})
		.returning();

	return record;
}

export async function updateNotificationSound(
	perms: UserPermissions,
	id: string,
	input: UpdateNotificationSoundInput
) {
	requireSettingsAccess(perms);

	await getNotificationSound(perms, id);
	const data = updateNotificationSoundSchema.parse(input);

	if (data.isDefault) {
		await clearOtherDefaults(id);
	}

	const [record] = await db
		.update(notificationSound)
		.set({ ...data, updatedAt: new Date() })
		.where(eq(notificationSound.id, id))
		.returning();

	return record;
}

export async function deleteNotificationSound(perms: UserPermissions, id: string) {
	requireSettingsAccess(perms);

	await getNotificationSound(perms, id);
	await db.delete(notificationSound).where(eq(notificationSound.id, id));
}
