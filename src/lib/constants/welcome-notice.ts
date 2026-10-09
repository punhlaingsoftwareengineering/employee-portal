import { PUBLIC_ROUTES } from '$lib/constants/public-routes';

/** localStorage key — bump the version suffix when the notice content changes. */
export const WELCOME_NOTICE_DISMISSED_KEY = 'employee-portal-welcome-notice-dismissed-v1';

/**
 * Legacy welcome notice — replaced by DailyPopupDialog on `/onboarding`.
 * Kept for reference / optional revive; auto-open stays off.
 * Forced preview still works via `?notice=1` if the component is remounted.
 */
export const WELCOME_NOTICE_AUTO_OPEN = false;

/** Query flag to force-open the mockup even after dismiss: `/onboarding?notice=1` */
export const WELCOME_NOTICE_FORCE_QUERY = 'notice';

export const WELCOME_NOTICE_MOCK = {
	eyebrow: 'Notice',
	title: 'Welcome to Employee Portal',
	body: 'Find services, apps, pharmacy master, and facility updates in one place. Check Tips & Tutorials anytime you need a quick walkthrough.',
	ctaLabel: 'Got it',
	secondaryLabel: 'Tips & Tutorials',
	secondaryHref: PUBLIC_ROUTES.tipsAndTutorials
} as const;
