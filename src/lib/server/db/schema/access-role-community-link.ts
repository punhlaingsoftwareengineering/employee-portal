import { relations } from 'drizzle-orm';
import { pgTable, timestamp, uuid, uniqueIndex } from 'drizzle-orm/pg-core';
import { accessRole } from './access-role';
import { communityLink } from './community-link';

export const accessRoleCommunityLink = pgTable(
	'access_role_community_link',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		roleId: uuid('role_id')
			.notNull()
			.references(() => accessRole.id, { onDelete: 'cascade' }),
		communityLinkId: uuid('community_link_id')
			.notNull()
			.references(() => communityLink.id, { onDelete: 'cascade' }),
		createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
	},
	(table) => [
		uniqueIndex('access_role_community_link_role_link_idx').on(
			table.roleId,
			table.communityLinkId
		)
	]
);

export const accessRoleCommunityLinkRelations = relations(accessRoleCommunityLink, ({ one }) => ({
	role: one(accessRole, {
		fields: [accessRoleCommunityLink.roleId],
		references: [accessRole.id]
	}),
	communityLink: one(communityLink, {
		fields: [accessRoleCommunityLink.communityLinkId],
		references: [communityLink.id]
	})
}));

export type AccessRoleCommunityLink = typeof accessRoleCommunityLink.$inferSelect;
export type NewAccessRoleCommunityLink = typeof accessRoleCommunityLink.$inferInsert;
