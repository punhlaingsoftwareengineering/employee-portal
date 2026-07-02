import { integer, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const toolLearning = pgTable('tool_learning', {
	id: uuid('id').primaryKey().defaultRandom(),
	title: text('title').notNull(),
	description: text('description'),
	videoUrl: text('video_url').notNull(),
	duration: text('duration'),
	sortOrder: integer('sort_order').notNull().default(0),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
});

export type ToolLearning = typeof toolLearning.$inferSelect;
export type NewToolLearning = typeof toolLearning.$inferInsert;
