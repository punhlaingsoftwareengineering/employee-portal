import { integer, pgTable, text, timestamp } from 'drizzle-orm/pg-core';

export const ONBOARDING_CAROUSEL_CONFIG_ROW_ID = 'default';

export const onboardingCarouselConfig = pgTable('onboarding_carousel_config', {
	id: text('id').primaryKey(),
	intervalMs: integer('interval_ms').notNull(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
});

export type OnboardingCarouselConfig = typeof onboardingCarouselConfig.$inferSelect;
export type NewOnboardingCarouselConfig = typeof onboardingCarouselConfig.$inferInsert;
