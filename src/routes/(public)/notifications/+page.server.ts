import { listPublicNotifications } from '$lib/server/services/notification';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const userId = locals.user?.id ?? null;
	const data = await listPublicNotifications(userId);
	return {
		notifications: data.notifications,
		defaultSoundUrl: data.defaultSoundUrl,
		user: locals.user ?? null
	};
};
