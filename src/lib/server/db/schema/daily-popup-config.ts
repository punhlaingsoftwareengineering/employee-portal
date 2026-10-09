import { integer, pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { DAILY_POPUP_CONFIG_ROW_ID } from '$lib/constants/daily-popup';

export { DAILY_POPUP_CONFIG_ROW_ID };

export const dailyPopupConfig = pgTable('daily_popup_config', {
	id: text('id').primaryKey(),
	dismissCooldownMinutes: integer('dismiss_cooldown_minutes').notNull(),
	carouselIntervalMs: integer('carousel_interval_ms').notNull(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
});

export type DailyPopupConfig = typeof dailyPopupConfig.$inferSelect;
export type NewDailyPopupConfig = typeof dailyPopupConfig.$inferInsert;
