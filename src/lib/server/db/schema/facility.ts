import { boolean, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const facility = pgTable('facility', {
	id: uuid('id').primaryKey().defaultRandom(),
	name: text('name').notNull(),
	description: text('description'),
	address: text('address'),
	imageUrl: text('image_url'),
	phone: text('phone'),
	/** When true, facility appears on the public onboarding page. */
	showOnOnboarding: boolean('show_on_onboarding').notNull().default(false),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
});

export type Facility = typeof facility.$inferSelect;
export type NewFacility = typeof facility.$inferInsert;
