import { relations } from 'drizzle-orm';
import { pgTable, text, timestamp, uuid, uniqueIndex } from 'drizzle-orm/pg-core';
import { user } from './auth.schema';
import { department } from './department';
import { facility } from './facility';
import { accessRole } from './access-role';

export const userDepartmentRole = pgTable(
	'user_department_role',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		userId: text('user_id')
			.notNull()
			.references(() => user.id, { onDelete: 'cascade' }),
		departmentId: uuid('department_id')
			.notNull()
			.references(() => department.id, { onDelete: 'cascade' }),
		roleId: uuid('role_id')
			.notNull()
			.references(() => accessRole.id, { onDelete: 'restrict' }),
		facilityId: uuid('facility_id')
			.notNull()
			.references(() => facility.id, { onDelete: 'restrict' }),
		createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
		updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
	},
	(table) => [
		uniqueIndex('user_department_role_user_dept_facility_idx').on(
			table.userId,
			table.departmentId,
			table.facilityId
		)
	]
);

export const userDepartmentRoleRelations = relations(userDepartmentRole, ({ one }) => ({
	user: one(user, { fields: [userDepartmentRole.userId], references: [user.id] }),
	department: one(department, {
		fields: [userDepartmentRole.departmentId],
		references: [department.id]
	}),
	role: one(accessRole, {
		fields: [userDepartmentRole.roleId],
		references: [accessRole.id]
	}),
	facility: one(facility, {
		fields: [userDepartmentRole.facilityId],
		references: [facility.id]
	})
}));

export type UserDepartmentRole = typeof userDepartmentRole.$inferSelect;
export type NewUserDepartmentRole = typeof userDepartmentRole.$inferInsert;
