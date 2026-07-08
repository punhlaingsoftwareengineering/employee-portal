import { pgTable, text, timestamp } from 'drizzle-orm/pg-core';

export const PORTAL_FONT_CONFIG_ROW_ID = 'default';

export const portalFontConfig = pgTable('portal_font_config', {
	id: text('id').primaryKey(),
	allowedFonts: text('allowed_fonts').array().notNull(),
	defaultFont: text('default_font').notNull(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
});

export type PortalFontConfig = typeof portalFontConfig.$inferSelect;
export type NewPortalFontConfig = typeof portalFontConfig.$inferInsert;
