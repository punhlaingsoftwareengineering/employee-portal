import { relations } from 'drizzle-orm';
import { dailyPopupImage } from './daily-popup-image';
import { dailyPopupSchedule } from './daily-popup-schedule';

export const dailyPopupScheduleRelations = relations(dailyPopupSchedule, ({ many }) => ({
	images: many(dailyPopupImage)
}));

export const dailyPopupImageRelations = relations(dailyPopupImage, ({ one }) => ({
	schedule: one(dailyPopupSchedule, {
		fields: [dailyPopupImage.scheduleId],
		references: [dailyPopupSchedule.id]
	})
}));
