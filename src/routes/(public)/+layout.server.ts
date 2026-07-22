import { DOCS_ORIGIN } from '$app/env/private';
import { getActiveAnnouncement } from '$lib/server/services/announcement';
import { listPublicApps } from '$lib/server/services/app';
import { listUserNotifications } from '$lib/server/services/notification';
import { listPublicServices } from '$lib/server/services/service';
import { hasAppAccess } from '$lib/server/permissions';
import { getUserPermissions } from '$lib/server/services/portal-user';
import { PUBLIC_ROUTES } from '$lib/constants/public-routes';
import type { LayoutServerLoad } from './$types';

function isOnboardingPath(pathname: string) {
	return pathname === PUBLIC_ROUTES.onboarding || pathname.startsWith(`${PUBLIC_ROUTES.onboarding}/`);
}

const emptyNotifications = {
	notifications: [] as Awaited<ReturnType<typeof listUserNotifications>>['notifications'],
	dismissedIds: [] as string[],
	defaultSoundUrl: null as string | null
};

export const load: LayoutServerLoad = async ({ locals, url }) => {
	const onOnboarding = isOnboardingPath(url.pathname);
	const docsHref = DOCS_ORIGIN?.trim().replace(/\/$/, '') || null;

	const canUseNotifications = locals.user
		? hasAppAccess(await getUserPermissions(locals.user.id))
		: false;

	const [announcement, notificationData, publicServices, publicApps] = await Promise.all([
		onOnboarding ? getActiveAnnouncement() : Promise.resolve(null),
		canUseNotifications && locals.user
			? listUserNotifications(locals.user.id)
			: Promise.resolve(emptyNotifications),
		listPublicServices(),
		listPublicApps()
	]);

	return {
		announcement,
		notifications: notificationData.notifications,
		dismissedNotificationIds: notificationData.dismissedIds,
		defaultSoundUrl: notificationData.defaultSoundUrl,
		canUseNotifications,
		user: locals.user ?? null,
		docsHref,
		onboardingSections: {
			hasServices: publicServices.length > 0,
			hasApps: publicApps.length > 0
		}
	};
};
