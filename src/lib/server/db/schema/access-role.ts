import { relations } from 'drizzle-orm';
import { boolean, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { accessRoleService } from './access-role-service';
import { accessRoleApp } from './access-role-app';
import { accessRoleCommunityLink } from './access-role-community-link';

export const accessRole = pgTable('access_role', {
	id: uuid('id').primaryKey().defaultRandom(),
	name: text('name').notNull(),
	slug: text('slug').notNull().unique(),
	description: text('description'),
	navDashboard: boolean('nav_dashboard').notNull().default(true),
	navEmployees: boolean('nav_employees').notNull().default(true),
	navDepartments: boolean('nav_departments').notNull().default(true),
	navFacilities: boolean('nav_facilities').notNull().default(true),
	navTools: boolean('nav_tools').notNull().default(true),
	navSettings: boolean('nav_settings').notNull().default(false),
	employeeReadAll: boolean('employee_read_all').notNull().default(false),
	employeeWrite: boolean('employee_write').notNull().default(false),
	employeeDelete: boolean('employee_delete').notNull().default(false),
	departmentReadAll: boolean('department_read_all').notNull().default(false),
	departmentWrite: boolean('department_write').notNull().default(false),
	facilityReadAll: boolean('facility_read_all').notNull().default(false),
	facilityWrite: boolean('facility_write').notNull().default(false),
	isSystem: boolean('is_system').notNull().default(false),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
});

export const accessRoleRelations = relations(accessRole, ({ many }) => ({
	serviceAssignments: many(accessRoleService),
	appAssignments: many(accessRoleApp),
	communityLinkAssignments: many(accessRoleCommunityLink)
}));

export type AccessRole = typeof accessRole.$inferSelect;
export type NewAccessRole = typeof accessRole.$inferInsert;
