import { integer, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const onboardingSlide = pgTable('onboarding_slide', {
	id: uuid('id').primaryKey().defaultRandom(),
	title: text('title').notNull(),
	description: text('description'),
	imageUrl: text('image_url').notNull(),
	sortOrder: integer('sort_order').notNull().default(0),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
});

export type OnboardingSlide = typeof onboardingSlide.$inferSelect;
export type NewOnboardingSlide = typeof onboardingSlide.$inferInsert;
