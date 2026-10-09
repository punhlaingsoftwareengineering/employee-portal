import { z } from 'zod';
import {
	DAILY_POPUP_SCHEDULE_KINDS,
	MAX_DAILY_POPUP_CAROUSEL_INTERVAL_MS,
	MAX_DAILY_POPUP_DISMISS_COOLDOWN_MINUTES,
	MIN_DAILY_POPUP_CAROUSEL_INTERVAL_MS,
	MIN_DAILY_POPUP_DISMISS_COOLDOWN_MINUTES
} from '$lib/constants/daily-popup';

export const dailyPopupConfigSchema = z.object({
	dismissCooldownMinutes: z
		.number()
		.int()
		.min(MIN_DAILY_POPUP_DISMISS_COOLDOWN_MINUTES)
		.max(MAX_DAILY_POPUP_DISMISS_COOLDOWN_MINUTES),
	carouselIntervalMs: z
		.number()
		.int()
		.min(MIN_DAILY_POPUP_CAROUSEL_INTERVAL_MS)
		.max(MAX_DAILY_POPUP_CAROUSEL_INTERVAL_MS)
});

export type DailyPopupConfigInput = z.infer<typeof dailyPopupConfigSchema>;
export type DailyPopupConfigView = DailyPopupConfigInput;

export const upsertWeekdayScheduleSchema = z.object({
	weekday: z.number().int().min(0).max(6),
	enabled: z.boolean()
});

export const upsertDateScheduleSchema = z.object({
	calendarDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD'),
	enabled: z.boolean()
});

const optionalLinkUrlSchema = z.preprocess(
	(value) => (typeof value === 'string' && value.trim() === '' ? null : value),
	z.string().url().max(2048).nullable().optional()
);

export const createDailyPopupImageSchema = z.object({
	scheduleId: z.string().uuid(),
	imageUrl: z.string().url().max(2048),
	driveFileId: z.string().max(128).optional().nullable(),
	linkUrl: optionalLinkUrlSchema,
	sortOrder: z.number().int().min(0).optional()
});

export const updateDailyPopupImageSchema = z.object({
	imageUrl: z.string().url().max(2048).optional(),
	driveFileId: z.string().max(128).optional().nullable(),
	linkUrl: optionalLinkUrlSchema,
	sortOrder: z.number().int().min(0).optional()
});

export const reorderDailyPopupImagesSchema = z.object({
	scheduleId: z.string().uuid(),
	orderedIds: z.array(z.string().uuid()).min(1)
});

export const previewDailyPopupSchema = z.object({
	weekday: z.number().int().min(0).max(6).optional(),
	calendarDate: z
		.string()
		.regex(/^\d{4}-\d{2}-\d{2}$/)
		.optional()
});

export type CreateDailyPopupImageInput = z.infer<typeof createDailyPopupImageSchema>;
export type UpdateDailyPopupImageInput = z.infer<typeof updateDailyPopupImageSchema>;

export const dailyPopupPublicImageSchema = z.object({
	id: z.string().uuid(),
	imageUrl: z.string(),
	linkUrl: z.string().nullable(),
	sortOrder: z.number().int(),
	source: z.enum(DAILY_POPUP_SCHEDULE_KINDS)
});

export type DailyPopupPublicImage = z.infer<typeof dailyPopupPublicImageSchema>;

export const dailyPopupPublicPayloadSchema = z.object({
	images: z.array(dailyPopupPublicImageSchema),
	dismissCooldownMinutes: z.number().int(),
	carouselIntervalMs: z.number().int(),
	calendarDate: z.string(),
	weekday: z.number().int()
});

export type DailyPopupPublicPayload = z.infer<typeof dailyPopupPublicPayloadSchema>;
