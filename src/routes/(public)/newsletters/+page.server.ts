import { listAllPublicNewsletters } from '$lib/server/services/newsletter';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const newsletters = await listAllPublicNewsletters();
	return { newsletters };
};
