import { getActiveAnnouncement } from '$lib/server/services/announcement';
import { listPublicNotifications } from '$lib/server/services/notification';
import { PUBLIC_ROUTES } from '$lib/constants/public-routes';
import type { LayoutServerLoad } from './$types';

function isOnboardingPath(pathname: string) {
	return pathname === PUBLIC_ROUTES.onboarding || pathname.startsWith(`${PUBLIC_ROUTES.onboarding}/`);
}

export const load: LayoutServerLoad = async ({ locals, url }) => {
	const userId = locals.user?.id ?? null;
	const [announcement, notificationData] = await Promise.all([
		isOnboardingPath(url.pathname) ? getActiveAnnouncement() : Promise.resolve(null),
		listPublicNotifications(userId)
	]);

	return {
		announcement,
		notifications: notificationData.notifications,
		dismissedNotificationIds: notificationData.dismissedIds,
		defaultSoundUrl: notificationData.defaultSoundUrl,
		user: locals.user ?? null
	};
};
