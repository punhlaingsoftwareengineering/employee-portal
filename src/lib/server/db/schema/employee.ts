import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { department } from './department';
import { facility } from './facility';
import { accessRole } from './access-role';
import { employeeStatusEnum } from './enums';

export const employee = pgTable('employee', {
	id: uuid('id').primaryKey().defaultRandom(),
	departmentId: uuid('department_id')
		.notNull()
		.references(() => department.id, { onDelete: 'restrict' }),
	roleId: uuid('role_id')
		.notNull()
		.references(() => accessRole.id, { onDelete: 'restrict' }),
	facilityId: uuid('facility_id')
		.notNull()
		.references(() => facility.id, { onDelete: 'restrict' }),
	firstName: text('first_name').notNull(),
	lastName: text('last_name').notNull(),
	email: text('email').notNull().unique(),
	status: employeeStatusEnum('status').notNull().default('active'),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
});

export const employeeRelations = relations(employee, ({ one }) => ({
	department: one(department, {
		fields: [employee.departmentId],
		references: [department.id]
	}),
	role: one(accessRole, {
		fields: [employee.roleId],
		references: [accessRole.id]
	}),
	facility: one(facility, {
		fields: [employee.facilityId],
		references: [facility.id]
	})
}));

export type Employee = typeof employee.$inferSelect;
export type NewEmployee = typeof employee.$inferInsert;
