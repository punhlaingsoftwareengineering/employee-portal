import { getPublicApp } from '$lib/server/services/app';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const app = await getPublicApp(params.id);
	return { app };
};
