import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const newsletter = pgTable('newsletter', {
	id: uuid('id').primaryKey().defaultRandom(),
	title: text('title').notNull(),
	pdfUrl: text('pdf_url').notNull(),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
});

export type Newsletter = typeof newsletter.$inferSelect;
export type NewNewsletter = typeof newsletter.$inferInsert;
