import { relations } from 'drizzle-orm';
import { integer, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { communityLink } from './community-link';

export const communityCategory = pgTable('community_category', {
	id: uuid('id').primaryKey().defaultRandom(),
	name: text('name').notNull(),
	description: text('description'),
	sortOrder: integer('sort_order').notNull().default(0),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
});

export const communityCategoryRelations = relations(communityCategory, ({ many }) => ({
	links: many(communityLink)
}));

export type CommunityCategory = typeof communityCategory.$inferSelect;
export type NewCommunityCategory = typeof communityCategory.$inferInsert;
