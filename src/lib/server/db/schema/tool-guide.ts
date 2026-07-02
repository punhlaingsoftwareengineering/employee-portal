import { integer, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const toolGuide = pgTable('tool_guide', {
	id: uuid('id').primaryKey().defaultRandom(),
	title: text('title').notNull(),
	description: text('description'),
	pdfUrl: text('pdf_url').notNull(),
	sortOrder: integer('sort_order').notNull().default(0),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
});

export type ToolGuide = typeof toolGuide.$inferSelect;
export type NewToolGuide = typeof toolGuide.$inferInsert;
