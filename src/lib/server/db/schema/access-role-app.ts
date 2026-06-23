import { relations } from 'drizzle-orm';
import { pgTable, timestamp, uuid, uniqueIndex } from 'drizzle-orm/pg-core';
import { accessRole } from './access-role';
import { app } from './app';

export const accessRoleApp = pgTable(
	'access_role_app',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		roleId: uuid('role_id')
			.notNull()
			.references(() => accessRole.id, { onDelete: 'cascade' }),
		appId: uuid('app_id')
			.notNull()
			.references(() => app.id, { onDelete: 'cascade' }),
		createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
	},
	(table) => [uniqueIndex('access_role_app_role_app_idx').on(table.roleId, table.appId)]
);

export const accessRoleAppRelations = relations(accessRoleApp, ({ one }) => ({
	role: one(accessRole, {
		fields: [accessRoleApp.roleId],
		references: [accessRole.id]
	}),
	app: one(app, {
		fields: [accessRoleApp.appId],
		references: [app.id]
	})
}));

export type AccessRoleApp = typeof accessRoleApp.$inferSelect;
export type NewAccessRoleApp = typeof accessRoleApp.$inferInsert;
