import { relations } from 'drizzle-orm';
import { notificationSound } from './notification-sound';
import { notification } from './notification';

export const notificationSoundRelations = relations(notificationSound, ({ many }) => ({
	notifications: many(notification)
}));
