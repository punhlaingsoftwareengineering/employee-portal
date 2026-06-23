import { relations } from 'drizzle-orm';
import { pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { portalRoleEnum } from './enums';
import { user } from './auth.schema';

export const userProfile = pgTable('user_profile', {
	userId: text('user_id')
		.primaryKey()
		.references(() => user.id, { onDelete: 'cascade' }),
	portalRole: portalRoleEnum('portal_role').notNull().default('guest'),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
});

export const userProfileRelations = relations(userProfile, ({ one }) => ({
	user: one(user, { fields: [userProfile.userId], references: [user.id] })
}));

export type UserProfile = typeof userProfile.$inferSelect;
export type NewUserProfile = typeof userProfile.$inferInsert;
