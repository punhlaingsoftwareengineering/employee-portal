import { command, getRequestEvent, query } from '$app/server';
import { z } from 'zod';
import {
	createDailyPopupImageSchema,
	dailyPopupConfigSchema,
	previewDailyPopupSchema,
	reorderDailyPopupImagesSchema,
	updateDailyPopupImageSchema,
	upsertDateScheduleSchema,
	upsertWeekdayScheduleSchema
} from '$lib/schemas/daily-popup';
import { requireSettingsAccess } from '$lib/server/auth-guard';
import * as dailyPopupService from '$lib/server/services/daily-popup';

async function perms() {
	return requireSettingsAccess(getRequestEvent());
}

export const getDailyPopupConfig = query(async () => dailyPopupService.getDailyPopupConfig());

export const updateDailyPopupConfig = command(dailyPopupConfigSchema, async (data) => {
	const record = await dailyPopupService.updateDailyPopupConfig(await perms(), data);
	void getDailyPopupConfig().refresh();
	return record;
});

export const getDailyPopupSchedules = query(async () =>
	dailyPopupService.listDailyPopupSchedules(await perms())
);

export const upsertDailyPopupWeekdaySchedule = command(upsertWeekdayScheduleSchema, async (data) => {
	const record = await dailyPopupService.upsertWeekdaySchedule(await perms(), data);
	void getDailyPopupSchedules().refresh();
	return record;
});

export const upsertDailyPopupDateSchedule = command(upsertDateScheduleSchema, async (data) => {
	const record = await dailyPopupService.upsertDateSchedule(await perms(), data);
	void getDailyPopupSchedules().refresh();
	return record;
});

export const ensureDailyPopupWeekdaySchedule = command(
	z.object({ weekday: z.number().int().min(0).max(6) }),
	async ({ weekday }) => {
		const record = await dailyPopupService.ensureWeekdaySchedule(
			await perms(),
			weekday as 0 | 1 | 2 | 3 | 4 | 5 | 6
		);
		void getDailyPopupSchedules().refresh();
		return record;
	}
);

export const ensureDailyPopupDateSchedule = command(
	z.object({ calendarDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/) }),
	async ({ calendarDate }) => {
		const record = await dailyPopupService.ensureDateSchedule(await perms(), calendarDate);
		void getDailyPopupSchedules().refresh();
		return record;
	}
);

export const deleteDailyPopupDateSchedule = command(z.string().uuid(), async (id) => {
	await dailyPopupService.deleteDateSchedule(await perms(), id);
	void getDailyPopupSchedules().refresh();
});

export const createDailyPopupImage = command(createDailyPopupImageSchema, async (data) => {
	const record = await dailyPopupService.createDailyPopupImage(await perms(), data);
	void getDailyPopupSchedules().refresh();
	return record;
});

export const updateDailyPopupImage = command(
	z.object({
		id: z.string().uuid(),
		...updateDailyPopupImageSchema.shape
	}),
	async ({ id, ...data }) => {
		const record = await dailyPopupService.updateDailyPopupImage(await perms(), id, data);
		void getDailyPopupSchedules().refresh();
		return record;
	}
);

export const deleteDailyPopupImage = command(z.string().uuid(), async (id) => {
	await dailyPopupService.deleteDailyPopupImage(await perms(), id);
	void getDailyPopupSchedules().refresh();
});

export const reorderDailyPopupImages = command(reorderDailyPopupImagesSchema, async (data) => {
	const record = await dailyPopupService.reorderDailyPopupImages(await perms(), data);
	void getDailyPopupSchedules().refresh();
	return record;
});

export const previewDailyPopup = command(previewDailyPopupSchema, async (data) =>
	dailyPopupService.previewDailyPopupPayload(await perms(), data)
);

/** Public — no settings gate. Used by onboarding dialog. */
export const getPublicDailyPopup = query(async () => dailyPopupService.getPublicDailyPopupPayload());
