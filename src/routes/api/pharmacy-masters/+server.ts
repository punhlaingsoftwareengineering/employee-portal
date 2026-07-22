import { json, type RequestHandler } from '@sveltejs/kit';
import { requirePharmacyAccess } from '$lib/server/auth-guard';
import * as pharmacyMasterService from '$lib/server/services/pharmacy-master';
import { createPharmacyMasterSchema } from '$lib/schemas/pharmacy-master';

export const GET: RequestHandler = async (event) => {
	const perms = await requirePharmacyAccess(event);
	const records = await pharmacyMasterService.listPharmacyMasters(perms);
	return json(records);
};

export const POST: RequestHandler = async (event) => {
	const perms = await requirePharmacyAccess(event);
	const body = await event.request.json();
	const data = createPharmacyMasterSchema.parse(body);
	const record = await pharmacyMasterService.createPharmacyMaster(perms, data);
	return json(record, { status: 201 });
};
