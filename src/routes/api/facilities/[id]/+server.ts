import { json, type RequestHandler } from '@sveltejs/kit';
import { requireAppAccess } from '$lib/server/auth-guard';
import * as facilityService from '$lib/server/services/facility';
import { updateFacilitySchema } from '$lib/schemas/facility';

export const GET: RequestHandler = async (event) => {
	const perms = await requireAppAccess(event);
	const facility = await facilityService.getFacility(perms, event.params.id!);
	return json(facility);
};

export const PATCH: RequestHandler = async (event) => {
	const perms = await requireAppAccess(event);
	const body = await event.request.json();
	const data = updateFacilitySchema.parse(body);
	const facility = await facilityService.updateFacility(perms, event.params.id!, data);
	return json(facility);
};

export const DELETE: RequestHandler = async (event) => {
	const perms = await requireAppAccess(event);
	await facilityService.deleteFacility(perms, event.params.id!);
	return new Response(null, { status: 204 });
};
