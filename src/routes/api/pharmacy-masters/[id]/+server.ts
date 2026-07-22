import { json, type RequestHandler } from '@sveltejs/kit';
import { requirePharmacyAccess } from '$lib/server/auth-guard';
import * as pharmacyMasterService from '$lib/server/services/pharmacy-master';
import { updatePharmacyMasterSchema } from '$lib/schemas/pharmacy-master';

export const GET: RequestHandler = async (event) => {
	const perms = await requirePharmacyAccess(event);
	const record = await pharmacyMasterService.getPharmacyMaster(perms, event.params.id!);
	return json(record);
};

export const PATCH: RequestHandler = async (event) => {
	const perms = await requirePharmacyAccess(event);
	const body = await event.request.json();
	const data = updatePharmacyMasterSchema.parse(body);
	const record = await pharmacyMasterService.updatePharmacyMaster(perms, event.params.id!, data);
	return json(record);
};

export const DELETE: RequestHandler = async (event) => {
	const perms = await requirePharmacyAccess(event);
	await pharmacyMasterService.deletePharmacyMaster(perms, event.params.id!);
	return new Response(null, { status: 204 });
};
