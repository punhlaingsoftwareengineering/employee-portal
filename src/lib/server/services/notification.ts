import { desc, eq, notInArray } from 'drizzle-orm';
import { error } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { notification } from '$lib/server/db/schema/notification';
import { notificationRead } from '$lib/server/db/schema/notification-read';
import {
	createNotificationSchema,
	updateNotificationSchema,
	type CreateNotificationInput,
	type PublicNotification,
	type UpdateNotificationInput
} from '$lib/schemas/notification';
import { publishNotification } from '$lib/server/notification-bus';
import { getDefaultNotificationSound } from '$lib/server/services/notification-sound';
import { canAccessSettings, type UserPermissions } from '$lib/server/permissions';

function requireSettingsAccess(perms: UserPermissions) {
	if (!canAccessSettings(perms)) error(403, 'Forbidden');
}

function toPublicNotification(
	record: {
		id: string;
		title: string;
		body: string | null;
		linkUrl: string | null;
		priority: PublicNotification['priority'];
		iconName: string | null;
		imageUrl: string | null;
		createdAt: Date;
		sound?: { mp3Url: string } | null;
	},
	defaultMp3Url: string | null
): PublicNotification {
	return {
		id: record.id,
		title: record.title,
		body: record.body,
		linkUrl: record.linkUrl,
		priority: record.priority,
		iconName: record.iconName,
		imageUrl: record.imageUrl,
		soundMp3Url: record.sound?.mp3Url ?? defaultMp3Url,
		createdAt: record.createdAt.toISOString()
	};
}

async function getDefaultMp3Url() {
	const sound = await getDefaultNotificationSound();
	return sound?.mp3Url ?? null;
}

async function listDismissedIds(userId: string) {
	const rows = await db.query.notificationRead.findMany({
		where: eq(notificationRead.userId, userId),
		columns: { notificationId: true }
	});
	return rows.map((row) => row.notificationId);
}

export async function listNotifications(perms: UserPermissions) {
	requireSettingsAccess(perms);

	return db.query.notification.findMany({
		with: { sound: true },
		orderBy: [desc(notification.createdAt)]
	});
}

export async function listPublicNotifications(userId: string | null) {
	const defaultMp3Url = await getDefaultMp3Url();
	const dismissedIds = userId ? await listDismissedIds(userId) : [];

	const rows = await db.query.notification.findMany({
		with: { sound: true },
		...(dismissedIds.length > 0
			? { where: notInArray(notification.id, dismissedIds) }
			: {}),
		orderBy: [desc(notification.createdAt)]
	});

	return {
		notifications: rows.map((row) => toPublicNotification(row, defaultMp3Url)),
		dismissedIds,
		defaultSoundUrl: defaultMp3Url
	};
}

export async function getNotification(perms: UserPermissions, id: string) {
	requireSettingsAccess(perms);

	const record = await db.query.notification.findFirst({
		where: eq(notification.id, id),
		with: { sound: true }
	});

	if (!record) error(404, 'Notification not found');
	return record;
}

export async function createNotification(perms: UserPermissions, input: CreateNotificationInput) {
	requireSettingsAccess(perms);

	const data = createNotificationSchema.parse(input);
	const [record] = await db
		.insert(notification)
		.values({
			title: data.title,
			body: data.body ?? null,
			linkUrl: data.linkUrl ?? null,
			priority: data.priority ?? 'info',
			iconName: data.iconName?.trim() || null,
			imageUrl: data.imageUrl ?? null,
			soundId: data.soundId ?? null
		})
		.returning();

	const withSound = await db.query.notification.findFirst({
		where: eq(notification.id, record.id),
		with: { sound: true }
	});

	if (!withSound) error(500, 'Failed to load created notification');

	const defaultMp3Url = await getDefaultMp3Url();
	const payload = toPublicNotification(withSound, defaultMp3Url);
	publishNotification(payload);

	return withSound;
}

export async function updateNotification(
	perms: UserPermissions,
	id: string,
	input: UpdateNotificationInput
) {
	requireSettingsAccess(perms);

	await getNotification(perms, id);
	const data = updateNotificationSchema.parse(input);

	const [record] = await db
		.update(notification)
		.set({
			...(data.title !== undefined ? { title: data.title } : {}),
			...(data.body !== undefined ? { body: data.body ?? null } : {}),
			...(data.linkUrl !== undefined ? { linkUrl: data.linkUrl ?? null } : {}),
			...(data.priority !== undefined ? { priority: data.priority } : {}),
			...(data.iconName !== undefined ? { iconName: data.iconName?.trim() || null } : {}),
			...(data.imageUrl !== undefined ? { imageUrl: data.imageUrl ?? null } : {}),
			...(data.soundId !== undefined ? { soundId: data.soundId ?? null } : {}),
			updatedAt: new Date()
		})
		.where(eq(notification.id, id))
		.returning();

	return db.query.notification.findFirst({
		where: eq(notification.id, record.id),
		with: { sound: true }
	});
}

export async function deleteNotification(perms: UserPermissions, id: string) {
	requireSettingsAccess(perms);

	await getNotification(perms, id);
	await db.delete(notification).where(eq(notification.id, id));
}

export async function dismissNotification(userId: string, notificationId: string) {
	const existing = await db.query.notification.findFirst({
		where: eq(notification.id, notificationId)
	});

	if (!existing) error(404, 'Notification not found');

	await db
		.insert(notificationRead)
		.values({ userId, notificationId })
		.onConflictDoUpdate({
			target: [notificationRead.userId, notificationRead.notificationId],
			set: { dismissedAt: new Date() }
		});
}

export async function dismissAllNotifications(userId: string, notificationIds: string[]) {
	await Promise.all(notificationIds.map((id) => dismissNotification(userId, id)));
}
