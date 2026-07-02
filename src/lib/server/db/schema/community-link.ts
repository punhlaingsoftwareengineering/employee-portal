import { relations } from 'drizzle-orm';
import { boolean, integer, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { accessRoleCommunityLink } from './access-role-community-link';
import { communityCategory } from './community-category';
import { communityPlatformEnum } from './enums';

export const communityLink = pgTable('community_link', {
	id: uuid('id').primaryKey().defaultRandom(),
	categoryId: uuid('category_id')
		.notNull()
		.references(() => communityCategory.id, { onDelete: 'cascade' }),
	title: text('title').notNull(),
	description: text('description'),
	url: text('url').notNull(),
	platform: communityPlatformEnum('platform').notNull().default('website'),
	sortOrder: integer('sort_order').notNull().default(0),
	showQr: boolean('show_qr').notNull().default(true),
	isPublic: boolean('is_public').notNull().default(true),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
});

export const communityLinkRelations = relations(communityLink, ({ one, many }) => ({
	category: one(communityCategory, {
		fields: [communityLink.categoryId],
		references: [communityCategory.id]
	}),
	roleAssignments: many(accessRoleCommunityLink)
}));

export type CommunityLink = typeof communityLink.$inferSelect;
export type NewCommunityLink = typeof communityLink.$inferInsert;
