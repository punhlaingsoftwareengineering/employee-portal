import { json, type RequestHandler } from '@sveltejs/kit';
import { requireAppAccess } from '$lib/server/auth-guard';
import * as facilityService from '$lib/server/services/facility';
import { createFacilitySchema } from '$lib/schemas/facility';

export const GET: RequestHandler = async (event) => {
	const perms = await requireAppAccess(event);
	const facilities = await facilityService.listFacilities(perms);
	return json(facilities);
};

export const POST: RequestHandler = async (event) => {
	const perms = await requireAppAccess(event);
	const body = await event.request.json();
	const data = createFacilitySchema.parse(body);
	const facility = await facilityService.createFacility(perms, data);
	return json(facility, { status: 201 });
};
