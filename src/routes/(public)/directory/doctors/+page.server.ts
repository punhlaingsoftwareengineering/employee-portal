import { listPublicDoctors } from '$lib/server/services/doctor';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const doctors = await listPublicDoctors();
	return { doctors };
};
