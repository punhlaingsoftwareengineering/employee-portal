import { relations } from 'drizzle-orm';
import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { notificationPriorityEnum } from './enums';
import { notificationSound } from './notification-sound';

export const notification = pgTable('notification', {
	id: uuid('id').primaryKey().defaultRandom(),
	title: text('title').notNull(),
	body: text('body'),
	linkUrl: text('link_url'),
	priority: notificationPriorityEnum('priority').notNull().default('info'),
	iconName: text('icon_name'),
	imageUrl: text('image_url'),
	soundId: uuid('sound_id').references(() => notificationSound.id, { onDelete: 'set null' }),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
});

export const notificationRelations = relations(notification, ({ one }) => ({
	sound: one(notificationSound, {
		fields: [notification.soundId],
		references: [notificationSound.id]
	})
}));

export type Notification = typeof notification.$inferSelect;
export type NewNotification = typeof notification.$inferInsert;
