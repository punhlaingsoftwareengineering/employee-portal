import { requireEmployeesAccess } from '$lib/server/auth-guard';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async (event) => {
	await requireEmployeesAccess(event);
};
