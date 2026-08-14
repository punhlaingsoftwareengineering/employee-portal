import { pgTable, text, timestamp } from 'drizzle-orm/pg-core';

export const PORTAL_FONT_SIZE_CONFIG_ROW_ID = 'default';

export const portalFontSizeConfig = pgTable('portal_font_size_config', {
	id: text('id').primaryKey(),
	allowedFontSizes: text('allowed_font_sizes').array().notNull(),
	defaultFontSize: text('default_font_size').notNull(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
});

export type PortalFontSizeConfig = typeof portalFontSizeConfig.$inferSelect;
export type NewPortalFontSizeConfig = typeof portalFontSizeConfig.$inferInsert;
