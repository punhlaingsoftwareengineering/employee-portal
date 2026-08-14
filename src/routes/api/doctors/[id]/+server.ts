import { json, type RequestHandler } from '@sveltejs/kit';
import { requireDoctorsAccess } from '$lib/server/auth-guard';
import * as doctorService from '$lib/server/services/doctor';
import { doctorIdSchema, updateDoctorSchema } from '$lib/schemas/doctor';

export const GET: RequestHandler = async (event) => {
	const perms = await requireDoctorsAccess(event);
	const id = doctorIdSchema.parse(event.params.id);
	const doctor = await doctorService.getDoctor(perms, id);
	return json(doctor);
};

export const PATCH: RequestHandler = async (event) => {
	const perms = await requireDoctorsAccess(event);
	const id = doctorIdSchema.parse(event.params.id);
	const body = await event.request.json();
	const data = updateDoctorSchema.parse(body);
	const doctor = await doctorService.updateDoctor(perms, id, data);
	return json(doctor);
};

export const DELETE: RequestHandler = async (event) => {
	const perms = await requireDoctorsAccess(event);
	const id = doctorIdSchema.parse(event.params.id);
	await doctorService.deleteDoctor(perms, id);
	return new Response(null, { status: 204 });
};
