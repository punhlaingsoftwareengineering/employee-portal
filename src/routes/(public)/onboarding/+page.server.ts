import { listPublicApps } from '$lib/server/services/app';
import { listPublicServices } from '$lib/server/services/service';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const [publicServices, publicApps] = await Promise.all([listPublicServices(), listPublicApps()]);

	return { publicServices, publicApps };
};
