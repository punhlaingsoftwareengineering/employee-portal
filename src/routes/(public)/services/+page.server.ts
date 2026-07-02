import { listPublicServices } from '$lib/server/services/service';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const publicServices = await listPublicServices();
	return { publicServices };
};
