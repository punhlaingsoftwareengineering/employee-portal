import { relations } from 'drizzle-orm';
import { jsonb, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { inviteStatusEnum, portalRoleEnum } from './enums';
import { user } from './auth.schema';

export type InviteAssignment = {
	departmentId: string;
	roleId: string;
	facilityId: string;
};

export const userInvite = pgTable('user_invite', {
	id: uuid('id').primaryKey().defaultRandom(),
	email: text('email').notNull(),
	name: text('name').notNull(),
	tokenHash: text('token_hash').notNull(),
	expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
	invitedBy: text('invited_by')
		.notNull()
		.references(() => user.id, { onDelete: 'restrict' }),
	status: inviteStatusEnum('status').notNull().default('pending'),
	portalRole: portalRoleEnum('portal_role').notNull().default('member'),
	assignments: jsonb('assignments').$type<InviteAssignment[]>().notNull().default([]),
	acceptedByUserId: text('accepted_by_user_id').references(() => user.id, {
		onDelete: 'set null'
	}),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
});

export const userInviteRelations = relations(userInvite, ({ one }) => ({
	invitedByUser: one(user, {
		fields: [userInvite.invitedBy],
		references: [user.id],
		relationName: 'invitedBy'
	}),
	acceptedByUser: one(user, {
		fields: [userInvite.acceptedByUserId],
		references: [user.id],
		relationName: 'acceptedBy'
	})
}));

export type UserInvite = typeof userInvite.$inferSelect;
export type NewUserInvite = typeof userInvite.$inferInsert;
