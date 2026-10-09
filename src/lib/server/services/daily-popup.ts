import { and, asc, eq, inArray } from 'drizzle-orm';
import { error } from '@sveltejs/kit';
import {
	clampCarouselIntervalMs,
	clampDismissCooldownMinutes,
	DAILY_POPUP_CONFIG_ROW_ID,
	DEFAULT_DAILY_POPUP_CAROUSEL_INTERVAL_MS,
	DEFAULT_DAILY_POPUP_DISMISS_COOLDOWN_MINUTES,
	getYangonCalendarDate,
	getYangonWeekday,
	mergeDailyPopupImages,
	type DailyPopupWeekday
} from '$lib/constants/daily-popup';
import {
	createDailyPopupImageSchema,
	dailyPopupConfigSchema,
	reorderDailyPopupImagesSchema,
	updateDailyPopupImageSchema,
	upsertDateScheduleSchema,
	upsertWeekdayScheduleSchema,
	type CreateDailyPopupImageInput,
	type DailyPopupConfigView,
	type DailyPopupPublicImage,
	type DailyPopupPublicPayload,
	type UpdateDailyPopupImageInput
} from '$lib/schemas/daily-popup';
import { isOptionalFeatureDbError } from '$lib/server/db/errors';
import { db } from '$lib/server/db';
import { dailyPopupConfig } from '$lib/server/db/schema/daily-popup-config';
import { dailyPopupImage } from '$lib/server/db/schema/daily-popup-image';
import { dailyPopupSchedule } from '$lib/server/db/schema/daily-popup-schedule';
import {
	DrivePortalNotConfiguredError,
	ensurePublicUrl,
	listCategoryFiles,
	trashCategoryFile
} from '$lib/server/drive-portal-client';
import {
	canSettingsDailyPopupCreate,
	canSettingsDailyPopupDelete,
	canSettingsDailyPopupUpdate,
	type UserPermissions
} from '$lib/server/permissions';

function assertCanCreate(perms: UserPermissions) {
	if (!canSettingsDailyPopupCreate(perms)) error(403, 'Forbidden');
}

function assertCanUpdate(perms: UserPermissions) {
	if (!canSettingsDailyPopupUpdate(perms)) error(403, 'Forbidden');
}

function assertCanDelete(perms: UserPermissions) {
	if (!canSettingsDailyPopupDelete(perms)) error(403, 'Forbidden');
}

function normalizeLinkUrl(linkUrl: string | null | undefined): string | null {
	if (linkUrl == null) return null;
	const trimmed = linkUrl.trim();
	return trimmed.length > 0 ? trimmed : null;
}

function extractDriveFileIdFromUrl(url: string): string | null {
	try {
		const path = new URL(url).pathname;
		const uuidMatch = path.match(
			/[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/i
		);
		if (uuidMatch) return uuidMatch[0];
		const trailing = path.split('/').filter(Boolean).at(-1);
		return trailing && trailing.length >= 8 ? trailing : null;
	} catch {
		return null;
	}
}

async function trashDriveFileBestEffort(imageUrl: string, driveFileId: string | null) {
	const ids = new Set<string>();
	if (driveFileId) ids.add(driveFileId);
	const fromUrl = extractDriveFileIdFromUrl(imageUrl);
	if (fromUrl) ids.add(fromUrl);

	try {
		const files = await listCategoryFiles('daily-popups');
		for (const file of files) {
			try {
				const publicUrl = await ensurePublicUrl(file.id);
				if (publicUrl === imageUrl || imageUrl.includes(file.id)) {
					ids.add(file.id);
				}
			} catch {
				/* ignore per-file lookup failures */
			}
		}
	} catch (err) {
		if (!(err instanceof DrivePortalNotConfiguredError)) {
			console.warn('[daily-popup] listCategoryFiles failed during trash', err);
		}
	}

	for (const id of ids) {
		try {
			await trashCategoryFile(id);
		} catch (err) {
			console.warn(`[daily-popup] trashCategoryFile failed for ${id}`, err);
		}
	}
}

const imageOrder = [asc(dailyPopupImage.sortOrder), asc(dailyPopupImage.createdAt)];

export async function getDailyPopupConfig(): Promise<DailyPopupConfigView> {
	try {
		const row = await db.query.dailyPopupConfig.findFirst({
			where: eq(dailyPopupConfig.id, DAILY_POPUP_CONFIG_ROW_ID)
		});
		if (!row) {
			return {
				dismissCooldownMinutes: DEFAULT_DAILY_POPUP_DISMISS_COOLDOWN_MINUTES,
				carouselIntervalMs: DEFAULT_DAILY_POPUP_CAROUSEL_INTERVAL_MS
			};
		}
		return {
			dismissCooldownMinutes: clampDismissCooldownMinutes(row.dismissCooldownMinutes),
			carouselIntervalMs: clampCarouselIntervalMs(row.carouselIntervalMs)
		};
	} catch (err) {
		if (isOptionalFeatureDbError(err)) {
			return {
				dismissCooldownMinutes: DEFAULT_DAILY_POPUP_DISMISS_COOLDOWN_MINUTES,
				carouselIntervalMs: DEFAULT_DAILY_POPUP_CAROUSEL_INTERVAL_MS
			};
		}
		throw err;
	}
}

export async function updateDailyPopupConfig(
	perms: UserPermissions,
	input: unknown
): Promise<DailyPopupConfigView> {
	assertCanUpdate(perms);
	const data = dailyPopupConfigSchema.parse(input);
	const dismissCooldownMinutes = clampDismissCooldownMinutes(data.dismissCooldownMinutes);
	const carouselIntervalMs = clampCarouselIntervalMs(data.carouselIntervalMs);

	const existing = await db.query.dailyPopupConfig.findFirst({
		where: eq(dailyPopupConfig.id, DAILY_POPUP_CONFIG_ROW_ID)
	});

	if (existing) {
		await db
			.update(dailyPopupConfig)
			.set({ dismissCooldownMinutes, carouselIntervalMs, updatedAt: new Date() })
			.where(eq(dailyPopupConfig.id, DAILY_POPUP_CONFIG_ROW_ID));
	} else {
		await db.insert(dailyPopupConfig).values({
			id: DAILY_POPUP_CONFIG_ROW_ID,
			dismissCooldownMinutes,
			carouselIntervalMs
		});
	}

	return { dismissCooldownMinutes, carouselIntervalMs };
}

export async function listDailyPopupSchedules(_perms: UserPermissions) {
	return db.query.dailyPopupSchedule.findMany({
		with: { images: { orderBy: imageOrder } },
		orderBy: [asc(dailyPopupSchedule.kind), asc(dailyPopupSchedule.weekday), asc(dailyPopupSchedule.calendarDate)]
	});
}

async function getScheduleOrThrow(id: string) {
	const record = await db.query.dailyPopupSchedule.findFirst({
		where: eq(dailyPopupSchedule.id, id),
		with: { images: { orderBy: imageOrder } }
	});
	if (!record) error(404, 'Daily popup schedule not found');
	return record;
}

export async function upsertWeekdaySchedule(perms: UserPermissions, input: unknown) {
	assertCanUpdate(perms);
	const data = upsertWeekdayScheduleSchema.parse(input);

	const existing = await db.query.dailyPopupSchedule.findFirst({
		where: and(eq(dailyPopupSchedule.kind, 'weekday'), eq(dailyPopupSchedule.weekday, data.weekday))
	});

	if (existing) {
		const [record] = await db
			.update(dailyPopupSchedule)
			.set({ enabled: data.enabled, updatedAt: new Date() })
			.where(eq(dailyPopupSchedule.id, existing.id))
			.returning();
		return getScheduleOrThrow(record!.id);
	}

	const [record] = await db
		.insert(dailyPopupSchedule)
		.values({
			kind: 'weekday',
			weekday: data.weekday,
			calendarDate: null,
			enabled: data.enabled
		})
		.returning();
	return getScheduleOrThrow(record!.id);
}

export async function upsertDateSchedule(perms: UserPermissions, input: unknown) {
	assertCanUpdate(perms);
	const data = upsertDateScheduleSchema.parse(input);

	const existing = await db.query.dailyPopupSchedule.findFirst({
		where: and(eq(dailyPopupSchedule.kind, 'date'), eq(dailyPopupSchedule.calendarDate, data.calendarDate))
	});

	if (existing) {
		const [record] = await db
			.update(dailyPopupSchedule)
			.set({ enabled: data.enabled, updatedAt: new Date() })
			.where(eq(dailyPopupSchedule.id, existing.id))
			.returning();
		return getScheduleOrThrow(record!.id);
	}

	const [record] = await db
		.insert(dailyPopupSchedule)
		.values({
			kind: 'date',
			weekday: null,
			calendarDate: data.calendarDate,
			enabled: data.enabled
		})
		.returning();
	return getScheduleOrThrow(record!.id);
}

export async function ensureWeekdaySchedule(perms: UserPermissions, weekday: DailyPopupWeekday) {
	const existing = await db.query.dailyPopupSchedule.findFirst({
		where: and(eq(dailyPopupSchedule.kind, 'weekday'), eq(dailyPopupSchedule.weekday, weekday)),
		with: { images: { orderBy: imageOrder } }
	});
	if (existing) {
		if (!canSettingsDailyPopupCreate(perms) && !canSettingsDailyPopupUpdate(perms)) {
			error(403, 'Forbidden');
		}
		return existing;
	}
	assertCanCreate(perms);

	const [record] = await db
		.insert(dailyPopupSchedule)
		.values({
			kind: 'weekday',
			weekday,
			calendarDate: null,
			enabled: true
		})
		.returning();
	return getScheduleOrThrow(record!.id);
}

export async function ensureDateSchedule(perms: UserPermissions, calendarDate: string) {
	const existing = await db.query.dailyPopupSchedule.findFirst({
		where: and(eq(dailyPopupSchedule.kind, 'date'), eq(dailyPopupSchedule.calendarDate, calendarDate)),
		with: { images: { orderBy: imageOrder } }
	});
	if (existing) {
		if (!canSettingsDailyPopupCreate(perms) && !canSettingsDailyPopupUpdate(perms)) {
			error(403, 'Forbidden');
		}
		return existing;
	}
	assertCanCreate(perms);

	const [record] = await db
		.insert(dailyPopupSchedule)
		.values({
			kind: 'date',
			weekday: null,
			calendarDate,
			enabled: true
		})
		.returning();
	return getScheduleOrThrow(record!.id);
}

export async function deleteDateSchedule(perms: UserPermissions, scheduleId: string) {
	assertCanDelete(perms);
	const schedule = await getScheduleOrThrow(scheduleId);
	if (schedule.kind !== 'date') error(400, 'Only calendar-date schedules can be deleted');

	for (const image of schedule.images) {
		await trashDriveFileBestEffort(image.imageUrl, image.driveFileId);
	}
	await db.delete(dailyPopupSchedule).where(eq(dailyPopupSchedule.id, scheduleId));
}

async function nextSortOrder(scheduleId: string): Promise<number> {
	const rows = await db.query.dailyPopupImage.findMany({
		where: eq(dailyPopupImage.scheduleId, scheduleId),
		orderBy: [asc(dailyPopupImage.sortOrder)]
	});
	if (rows.length === 0) return 0;
	return (rows.at(-1)?.sortOrder ?? 0) + 1;
}

export async function createDailyPopupImage(perms: UserPermissions, input: CreateDailyPopupImageInput) {
	assertCanCreate(perms);
	const data = createDailyPopupImageSchema.parse(input);
	const schedule = await getScheduleOrThrow(data.scheduleId);

	/** Adding an image implies the schedule should be live on onboarding. */
	if (!schedule.enabled) {
		await db
			.update(dailyPopupSchedule)
			.set({ enabled: true, updatedAt: new Date() })
			.where(eq(dailyPopupSchedule.id, data.scheduleId));
	}

	const sortOrder = data.sortOrder ?? (await nextSortOrder(data.scheduleId));
	const [record] = await db
		.insert(dailyPopupImage)
		.values({
			scheduleId: data.scheduleId,
			imageUrl: data.imageUrl,
			driveFileId: data.driveFileId ?? extractDriveFileIdFromUrl(data.imageUrl),
			linkUrl: normalizeLinkUrl(data.linkUrl),
			sortOrder
		})
		.returning();
	return record;
}

export async function updateDailyPopupImage(
	perms: UserPermissions,
	id: string,
	input: UpdateDailyPopupImageInput
) {
	assertCanUpdate(perms);
	const existing = await db.query.dailyPopupImage.findFirst({
		where: eq(dailyPopupImage.id, id)
	});
	if (!existing) error(404, 'Daily popup image not found');

	const data = updateDailyPopupImageSchema.parse(input);
	const payload: Partial<typeof dailyPopupImage.$inferInsert> = { updatedAt: new Date() };
	if (data.imageUrl !== undefined) {
		payload.imageUrl = data.imageUrl;
		payload.driveFileId =
			data.driveFileId !== undefined
				? data.driveFileId
				: (extractDriveFileIdFromUrl(data.imageUrl) ?? existing.driveFileId);
	} else if (data.driveFileId !== undefined) {
		payload.driveFileId = data.driveFileId;
	}
	if (data.linkUrl !== undefined) payload.linkUrl = normalizeLinkUrl(data.linkUrl);
	if (data.sortOrder !== undefined) payload.sortOrder = data.sortOrder;

	const [record] = await db
		.update(dailyPopupImage)
		.set(payload)
		.where(eq(dailyPopupImage.id, id))
		.returning();
	return record;
}

export async function deleteDailyPopupImage(perms: UserPermissions, id: string) {
	assertCanDelete(perms);
	const existing = await db.query.dailyPopupImage.findFirst({
		where: eq(dailyPopupImage.id, id)
	});
	if (!existing) error(404, 'Daily popup image not found');

	await trashDriveFileBestEffort(existing.imageUrl, existing.driveFileId);
	await db.delete(dailyPopupImage).where(eq(dailyPopupImage.id, id));
}

export async function reorderDailyPopupImages(perms: UserPermissions, input: unknown) {
	assertCanUpdate(perms);
	const data = reorderDailyPopupImagesSchema.parse(input);
	await getScheduleOrThrow(data.scheduleId);

	const existing = await db.query.dailyPopupImage.findMany({
		where: eq(dailyPopupImage.scheduleId, data.scheduleId)
	});
	const existingIds = new Set(existing.map((row) => row.id));
	if (data.orderedIds.length !== existingIds.size || data.orderedIds.some((id) => !existingIds.has(id))) {
		error(400, 'orderedIds must include every image for this schedule');
	}

	await db.transaction(async (tx) => {
		for (let i = 0; i < data.orderedIds.length; i++) {
			await tx
				.update(dailyPopupImage)
				.set({ sortOrder: i, updatedAt: new Date() })
				.where(eq(dailyPopupImage.id, data.orderedIds[i]!));
		}
	});

	return getScheduleOrThrow(data.scheduleId);
}

async function imagesForScheduleFilter(kind: 'weekday' | 'date', value: number | string) {
	const schedule =
		kind === 'weekday'
			? await db.query.dailyPopupSchedule.findFirst({
					where: and(
						eq(dailyPopupSchedule.kind, 'weekday'),
						eq(dailyPopupSchedule.weekday, value as number),
						eq(dailyPopupSchedule.enabled, true)
					),
					with: { images: { orderBy: imageOrder } }
				})
			: await db.query.dailyPopupSchedule.findFirst({
					where: and(
						eq(dailyPopupSchedule.kind, 'date'),
						eq(dailyPopupSchedule.calendarDate, value as string),
						eq(dailyPopupSchedule.enabled, true)
					),
					with: { images: { orderBy: imageOrder } }
				});

	if (!schedule) return [] as DailyPopupPublicImage[];
	return schedule.images.map((img) => ({
		id: img.id,
		imageUrl: img.imageUrl,
		linkUrl: img.linkUrl,
		sortOrder: img.sortOrder,
		source: kind
	}));
}

export async function getPublicDailyPopupPayload(
	override?: { weekday?: number; calendarDate?: string }
): Promise<DailyPopupPublicPayload> {
	const config = await getDailyPopupConfig();
	const calendarDate = override?.calendarDate ?? getYangonCalendarDate();
	const weekday = (override?.weekday ?? getYangonWeekday()) as DailyPopupWeekday;

	try {
		const [calendarImages, weekdayImages] = await Promise.all([
			imagesForScheduleFilter('date', calendarDate),
			imagesForScheduleFilter('weekday', weekday)
		]);

		return {
			images: mergeDailyPopupImages(calendarImages, weekdayImages),
			dismissCooldownMinutes: config.dismissCooldownMinutes,
			carouselIntervalMs: config.carouselIntervalMs,
			calendarDate,
			weekday
		};
	} catch (err) {
		if (isOptionalFeatureDbError(err)) {
			return {
				images: [],
				dismissCooldownMinutes: config.dismissCooldownMinutes,
				carouselIntervalMs: config.carouselIntervalMs,
				calendarDate,
				weekday
			};
		}
		throw err;
	}
}

/** Used by settings preview — same merge rules with optional overrides. */
export async function previewDailyPopupPayload(
	perms: UserPermissions,
	input: { weekday?: number; calendarDate?: string }
) {
	assertCanUpdate(perms);
	return getPublicDailyPopupPayload(input);
}

export async function listImagesByIds(ids: string[]) {
	if (ids.length === 0) return [];
	return db.query.dailyPopupImage.findMany({
		where: inArray(dailyPopupImage.id, ids)
	});
}
