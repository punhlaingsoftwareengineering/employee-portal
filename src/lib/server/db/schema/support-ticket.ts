import { relations } from 'drizzle-orm';
import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { user } from './auth.schema';
import {
	supportTicketCategoryEnum,
	supportTicketStatusEnum,
	supportTicketUrgencyEnum
} from './enums';

export const supportTicket = pgTable('support_ticket', {
	id: uuid('id').primaryKey().defaultRandom(),
	userId: text('user_id').references(() => user.id, { onDelete: 'set null' }),
	guestName: text('guest_name'),
	guestEmail: text('guest_email'),
	category: supportTicketCategoryEnum('category').notNull().default('technical'),
	urgency: supportTicketUrgencyEnum('urgency').notNull().default('normal'),
	contactPhone: text('contact_phone'),
	subject: text('subject').notNull(),
	description: text('description').notNull(),
	status: supportTicketStatusEnum('status').notNull().default('open'),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
});

export const supportTicketRelations = relations(supportTicket, ({ one }) => ({
	user: one(user, {
		fields: [supportTicket.userId],
		references: [user.id]
	})
}));

export type SupportTicket = typeof supportTicket.$inferSelect;
export type NewSupportTicket = typeof supportTicket.$inferInsert;
