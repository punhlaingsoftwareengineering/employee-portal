import { relations } from 'drizzle-orm';
import { pgTable, timestamp, uuid, uniqueIndex } from 'drizzle-orm/pg-core';
import { accessRole } from './access-role';
import { service } from './service';

export const accessRoleService = pgTable(
	'access_role_service',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		roleId: uuid('role_id')
			.notNull()
			.references(() => accessRole.id, { onDelete: 'cascade' }),
		serviceId: uuid('service_id')
			.notNull()
			.references(() => service.id, { onDelete: 'cascade' }),
		createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
	},
	(table) => [uniqueIndex('access_role_service_role_service_idx').on(table.roleId, table.serviceId)]
);

export const accessRoleServiceRelations = relations(accessRoleService, ({ one }) => ({
	role: one(accessRole, {
		fields: [accessRoleService.roleId],
		references: [accessRole.id]
	}),
	service: one(service, {
		fields: [accessRoleService.serviceId],
		references: [service.id]
	})
}));

export type AccessRoleService = typeof accessRoleService.$inferSelect;
export type NewAccessRoleService = typeof accessRoleService.$inferInsert;
