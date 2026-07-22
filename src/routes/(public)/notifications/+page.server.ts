import { redirect } from '@sveltejs/kit';
import { AUTH_ROUTES } from '$lib/constants/auth-routes';
import { requireAppAccess } from '$lib/server/auth-guard';
import { listUserNotifications } from '$lib/server/services/notification';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	const { locals, url } = event;
	if (!locals.user) {
		const redirectTo = `${url.pathname}${url.search}`;
		redirect(303, `${AUTH_ROUTES.login}?redirectTo=${encodeURIComponent(redirectTo)}`);
	}

	try {
		await requireAppAccess(event);
	} catch {
		redirect(303, '/pending');
	}

	const data = await listUserNotifications(locals.user.id);
	return {
		notifications: data.notifications,
		defaultSoundUrl: data.defaultSoundUrl,
		user: locals.user
	};
};
