import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const department = pgTable('department', {
	id: uuid('id').primaryKey().defaultRandom(),
	name: text('name').notNull(),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
});

export type Department = typeof department.$inferSelect;
export type NewDepartment = typeof department.$inferInsert;
