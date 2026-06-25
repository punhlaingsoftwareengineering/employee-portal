import { boolean, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { announcementAccentPresetEnum, announcementTypeEnum } from './enums';

export const announcement = pgTable('announcement', {
	id: uuid('id').primaryKey().defaultRandom(),
	type: announcementTypeEnum('type').notNull(),
	title: text('title').notNull(),
	body: text('body'),
	linkUrl: text('link_url'),
	imageUrl: text('image_url'),
	accentPreset: announcementAccentPresetEnum('accent_preset').notNull().default('primary'),
	accentColor: text('accent_color'),
	isActive: boolean('is_active').notNull().default(false),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
});

export type Announcement = typeof announcement.$inferSelect;
export type NewAnnouncement = typeof announcement.$inferInsert;
