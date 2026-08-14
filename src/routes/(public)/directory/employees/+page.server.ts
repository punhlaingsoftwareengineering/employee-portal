import { listPublicEmployees } from '$lib/server/services/employee';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const employees = await listPublicEmployees();
	return { employees };
};
