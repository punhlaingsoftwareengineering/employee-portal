import { boolean, date, pgTable, text, timestamp } from 'drizzle-orm/pg-core';

export const employee = pgTable('employee', {
	id: text('id').primaryKey(),
	employeeNo: text('employee_no').unique(),
	employeeName: text('employee_name'),
	position: text('position'),
	department: text('department'),
	joinDate: date('join_date'),
	facility: text('facility'),
	entryDate: timestamp('entry_date', { withTimezone: true }).defaultNow(),
	userId: text('user_id'),
	active: boolean('active').default(true)
});

export type Employee = typeof employee.$inferSelect;
export type NewEmployee = typeof employee.$inferInsert;
