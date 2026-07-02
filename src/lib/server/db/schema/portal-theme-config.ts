import { pgTable, text, timestamp } from 'drizzle-orm/pg-core';

export const PORTAL_THEME_CONFIG_ROW_ID = 'default';

export const portalThemeConfig = pgTable('portal_theme_config', {
	id: text('id').primaryKey(),
	allowedThemes: text('allowed_themes').array().notNull(),
	defaultTheme: text('default_theme').notNull(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
});

export type PortalThemeConfig = typeof portalThemeConfig.$inferSelect;
export type NewPortalThemeConfig = typeof portalThemeConfig.$inferInsert;
