import { relations } from 'drizzle-orm';
import { boolean, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { accessRoleService } from './access-role-service';

export const service = pgTable('service', {
	id: uuid('id').primaryKey().defaultRandom(),
	name: text('name').notNull(),
	description: text('description'),
	link: text('link').notNull(),
	iconUrl: text('icon_url'),
	embedMode: text('embed_mode').notNull().default('external'),
	isPublic: boolean('is_public').notNull().default(false),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
});

export const serviceRelations = relations(service, ({ many }) => ({
	roleAssignments: many(accessRoleService)
}));

export type Service = typeof service.$inferSelect;
export type NewService = typeof service.$inferInsert;
