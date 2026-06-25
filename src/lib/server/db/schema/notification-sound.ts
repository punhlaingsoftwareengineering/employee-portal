import { boolean, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const notificationSound = pgTable('notification_sound', {
	id: uuid('id').primaryKey().defaultRandom(),
	name: text('name').notNull(),
	mp3Url: text('mp3_url').notNull(),
	isDefault: boolean('is_default').notNull().default(false),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
});

export type NotificationSound = typeof notificationSound.$inferSelect;
export type NewNotificationSound = typeof notificationSound.$inferInsert;
