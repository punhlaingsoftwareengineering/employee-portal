import { json, type RequestHandler } from '@sveltejs/kit';
import { requireDoctorsAccess } from '$lib/server/auth-guard';
import * as doctorService from '$lib/server/services/doctor';
import { createDoctorSchema } from '$lib/schemas/doctor';

export const GET: RequestHandler = async (event) => {
	const perms = await requireDoctorsAccess(event);
	const doctors = await doctorService.listDoctors(perms);
	return json(doctors);
};

export const POST: RequestHandler = async (event) => {
	const perms = await requireDoctorsAccess(event);
	const body = await event.request.json();
	const data = createDoctorSchema.parse(body);
	const doctor = await doctorService.createDoctor(perms, data);
	return json(doctor, { status: 201 });
};
