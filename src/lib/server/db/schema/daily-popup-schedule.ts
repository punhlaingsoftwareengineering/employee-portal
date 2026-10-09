import { boolean, date, integer, pgEnum, pgTable, timestamp, uuid } from 'drizzle-orm/pg-core';
import { DAILY_POPUP_SCHEDULE_KINDS } from '$lib/constants/daily-popup';

export const dailyPopupScheduleKindEnum = pgEnum(
	'daily_popup_schedule_kind',
	DAILY_POPUP_SCHEDULE_KINDS
);

export const dailyPopupSchedule = pgTable('daily_popup_schedule', {
	id: uuid('id').primaryKey().defaultRandom(),
	kind: dailyPopupScheduleKindEnum('kind').notNull(),
	/** 0=Sunday … 6=Saturday when kind=weekday */
	weekday: integer('weekday'),
	/** YYYY-MM-DD when kind=date */
	calendarDate: date('calendar_date', { mode: 'string' }),
	enabled: boolean('enabled').notNull().default(true),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
});

export type DailyPopupSchedule = typeof dailyPopupSchedule.$inferSelect;
export type NewDailyPopupSchedule = typeof dailyPopupSchedule.$inferInsert;
