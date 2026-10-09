import { integer, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { dailyPopupSchedule } from './daily-popup-schedule';

export const dailyPopupImage = pgTable('daily_popup_image', {
	id: uuid('id').primaryKey().defaultRandom(),
	scheduleId: uuid('schedule_id')
		.notNull()
		.references(() => dailyPopupSchedule.id, { onDelete: 'cascade' }),
	imageUrl: text('image_url').notNull(),
	/** Optional Drive file id for hard-delete on remove */
	driveFileId: text('drive_file_id'),
	linkUrl: text('link_url'),
	sortOrder: integer('sort_order').notNull().default(0),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
});

export type DailyPopupImage = typeof dailyPopupImage.$inferSelect;
export type NewDailyPopupImage = typeof dailyPopupImage.$inferInsert;
