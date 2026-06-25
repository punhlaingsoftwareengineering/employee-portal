import { relations } from 'drizzle-orm';
import { pgTable, text, timestamp, unique, uuid } from 'drizzle-orm/pg-core';
import { user } from './auth.schema';
import { notification } from './notification';

export const notificationRead = pgTable(
	'notification_read',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		userId: text('user_id')
			.notNull()
			.references(() => user.id, { onDelete: 'cascade' }),
		notificationId: uuid('notification_id')
			.notNull()
			.references(() => notification.id, { onDelete: 'cascade' }),
		dismissedAt: timestamp('dismissed_at', { withTimezone: true }).notNull().defaultNow()
	},
	(table) => [unique('notification_read_user_notification_unique').on(table.userId, table.notificationId)]
);

export const notificationReadRelations = relations(notificationRead, ({ one }) => ({
	user: one(user, { fields: [notificationRead.userId], references: [user.id] }),
	notification: one(notification, {
		fields: [notificationRead.notificationId],
		references: [notification.id]
	})
}));

export type NotificationRead = typeof notificationRead.$inferSelect;
export type NewNotificationRead = typeof notificationRead.$inferInsert;
