import { DOCS_ORIGIN } from '$app/env/private';
import { getActiveAnnouncement } from '$lib/server/services/announcement';
import { listPublicApps } from '$lib/server/services/app';
import { listPublicNotifications } from '$lib/server/services/notification';
import { listPublicServices } from '$lib/server/services/service';
import { PUBLIC_ROUTES } from '$lib/constants/public-routes';
import type { LayoutServerLoad } from './$types';

function isOnboardingPath(pathname: string) {
	return pathname === PUBLIC_ROUTES.onboarding || pathname.startsWith(`${PUBLIC_ROUTES.onboarding}/`);
}

export const load: LayoutServerLoad = async ({ locals, url }) => {
	const userId = locals.user?.id ?? null;
	const onOnboarding = isOnboardingPath(url.pathname);
	const docsHref = DOCS_ORIGIN?.trim().replace(/\/$/, '') || null;

	const [announcement, notificationData, publicServices, publicApps] = await Promise.all([
		onOnboarding ? getActiveAnnouncement() : Promise.resolve(null),
		listPublicNotifications(userId),
		listPublicServices(),
		listPublicApps()
	]);

	return {
		announcement,
		notifications: notificationData.notifications,
		dismissedNotificationIds: notificationData.dismissedIds,
		defaultSoundUrl: notificationData.defaultSoundUrl,
		user: locals.user ?? null,
		docsHref,
		onboardingSections: {
			hasServices: publicServices.length > 0,
			hasApps: publicApps.length > 0
		}
	};
};
