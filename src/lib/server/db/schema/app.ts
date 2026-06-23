import { relations } from 'drizzle-orm';
import { boolean, jsonb, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import type { AppDownloadUrls } from '$lib/constants/app-download';
import { accessRoleApp } from './access-role-app';

export const app = pgTable('app', {
	id: uuid('id').primaryKey().defaultRandom(),
	name: text('name').notNull(),
	tagline: text('tagline'),
	description: text('description'),
	iconUrl: text('icon_url'),
	bannerUrl: text('banner_url'),
	/** @deprecated use downloadUrls */
	downloadUrl: text('download_url'),
	downloadUrls: jsonb('download_urls').$type<AppDownloadUrls>().notNull().default({}),
	version: text('version'),
	developer: text('developer'),
	category: text('category'),
	screenshotUrls: jsonb('screenshot_urls').$type<string[]>().default([]),
	isPublic: boolean('is_public').notNull().default(false),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
});

export const appRelations = relations(app, ({ many }) => ({
	roleAssignments: many(accessRoleApp)
}));

export type App = typeof app.$inferSelect;
export type NewApp = typeof app.$inferInsert;
