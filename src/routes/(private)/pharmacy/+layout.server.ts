import { requirePharmacyAccess } from '$lib/server/auth-guard';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async (event) => {
	await requirePharmacyAccess(event);
};
