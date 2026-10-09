/** Asia/Yangon — used for “today” weekday + calendar date resolution. */
export const DAILY_POPUP_TIMEZONE = 'Asia/Yangon';

export const DAILY_POPUP_CONFIG_ROW_ID = 'default';

export const DEFAULT_DAILY_POPUP_DISMISS_COOLDOWN_MINUTES = 15;
export const MIN_DAILY_POPUP_DISMISS_COOLDOWN_MINUTES = 1;
export const MAX_DAILY_POPUP_DISMISS_COOLDOWN_MINUTES = 24 * 60;

export const DEFAULT_DAILY_POPUP_CAROUSEL_INTERVAL_MS = 5000;
export const MIN_DAILY_POPUP_CAROUSEL_INTERVAL_MS = 2000;
export const MAX_DAILY_POPUP_CAROUSEL_INTERVAL_MS = 60_000;

/** localStorage key — stores ISO timestamp of last dismiss. */
export const DAILY_POPUP_DISMISSED_AT_KEY = 'employee-portal-daily-popup-dismissed-at-v1';

/** Force-open preview on onboarding: `/onboarding?dailyPopup=1` */
export const DAILY_POPUP_FORCE_QUERY = 'dailyPopup';

export const DAILY_POPUP_SCHEDULE_KINDS = ['weekday', 'date'] as const;
export type DailyPopupScheduleKind = (typeof DAILY_POPUP_SCHEDULE_KINDS)[number];

/** 0 = Sunday … 6 = Saturday (JS getDay / Asia/Yangon). */
export const DAILY_POPUP_WEEKDAYS = [
	{ value: 0, label: 'Sunday', short: 'Sun' },
	{ value: 1, label: 'Monday', short: 'Mon' },
	{ value: 2, label: 'Tuesday', short: 'Tue' },
	{ value: 3, label: 'Wednesday', short: 'Wed' },
	{ value: 4, label: 'Thursday', short: 'Thu' },
	{ value: 5, label: 'Friday', short: 'Fri' },
	{ value: 6, label: 'Saturday', short: 'Sat' }
] as const;

export type DailyPopupWeekday = (typeof DAILY_POPUP_WEEKDAYS)[number]['value'];

const WEEKDAY_SHORT_TO_VALUE: Record<string, DailyPopupWeekday> = {
	Sun: 0,
	Mon: 1,
	Tue: 2,
	Wed: 3,
	Thu: 4,
	Fri: 5,
	Sat: 6
};

/** YYYY-MM-DD in Asia/Yangon. */
export function getYangonCalendarDate(now: Date = new Date()): string {
	return new Intl.DateTimeFormat('en-CA', {
		timeZone: DAILY_POPUP_TIMEZONE,
		year: 'numeric',
		month: '2-digit',
		day: '2-digit'
	}).format(now);
}

/** 0=Sun … 6=Sat in Asia/Yangon. */
export function getYangonWeekday(now: Date = new Date()): DailyPopupWeekday {
	const short = new Intl.DateTimeFormat('en-US', {
		timeZone: DAILY_POPUP_TIMEZONE,
		weekday: 'short'
	}).format(now);
	return WEEKDAY_SHORT_TO_VALUE[short] ?? 0;
}

export function clampDismissCooldownMinutes(value: number): number {
	return Math.min(
		MAX_DAILY_POPUP_DISMISS_COOLDOWN_MINUTES,
		Math.max(MIN_DAILY_POPUP_DISMISS_COOLDOWN_MINUTES, Math.round(value))
	);
}

export function clampCarouselIntervalMs(value: number): number {
	return Math.min(
		MAX_DAILY_POPUP_CAROUSEL_INTERVAL_MS,
		Math.max(MIN_DAILY_POPUP_CAROUSEL_INTERVAL_MS, Math.round(value))
	);
}

/** Merge calendar-date images first, then weekday images (each already sorted). */
export function mergeDailyPopupImages<T>(calendarImages: T[], weekdayImages: T[]): T[] {
	return [...calendarImages, ...weekdayImages];
}

export function shouldShowDailyPopup(
	dismissedAtIso: string | null | undefined,
	cooldownMinutes: number,
	nowMs: number = Date.now()
): boolean {
	if (!dismissedAtIso) return true;
	const dismissedAt = Date.parse(dismissedAtIso);
	if (Number.isNaN(dismissedAt)) return true;
	const cooldownMs = clampDismissCooldownMinutes(cooldownMinutes) * 60_000;
	return nowMs - dismissedAt >= cooldownMs;
}
