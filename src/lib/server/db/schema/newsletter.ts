import { integer, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const newsletter = pgTable('newsletter', {
	id: uuid('id').primaryKey().defaultRandom(),
	title: text('title').notNull(),
	/** Media URL: PDF or image. */
	pdfUrl: text('pdf_url').notNull(),
	/** Higher numbers appear first (latest). Auto-assigned on create if omitted. */
	sortOrder: integer('sort_order').notNull().default(0),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
});

export type Newsletter = typeof newsletter.$inferSelect;
export type NewNewsletter = typeof newsletter.$inferInsert;
