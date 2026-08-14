import { relations } from 'drizzle-orm';
import { integer, pgTable, text, timestamp, unique, uuid } from 'drizzle-orm/pg-core';
import { user } from './auth.schema';
import { department } from './department';

export const departmentRating = pgTable(
	'department_rating',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		userId: text('user_id')
			.notNull()
			.references(() => user.id, { onDelete: 'cascade' }),
		departmentId: uuid('department_id')
			.notNull()
			.references(() => department.id, { onDelete: 'cascade' }),
		score: integer('score').notNull(),
		createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
		updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
	},
	(table) => [
		unique('department_rating_user_department_unique').on(table.userId, table.departmentId)
	]
);

export const departmentRatingRelations = relations(departmentRating, ({ one }) => ({
	user: one(user, {
		fields: [departmentRating.userId],
		references: [user.id]
	}),
	department: one(department, {
		fields: [departmentRating.departmentId],
		references: [department.id]
	})
}));

export type DepartmentRating = typeof departmentRating.$inferSelect;
export type NewDepartmentRating = typeof departmentRating.$inferInsert;
