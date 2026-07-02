import { listPublicApps } from '$lib/server/services/app';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const publicApps = await listPublicApps();
	return { publicApps };
};
