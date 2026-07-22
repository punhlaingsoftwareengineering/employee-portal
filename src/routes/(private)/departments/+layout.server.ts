import { requireDepartmentsAccess } from '$lib/server/auth-guard';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async (event) => {
	await requireDepartmentsAccess(event);
};
