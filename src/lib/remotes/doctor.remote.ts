import { query, command } from '$app/server';
import { getRequestEvent } from '$app/server';
import { z } from 'zod';
import * as doctorService from '$lib/server/services/doctor';
import {
	createDoctorSchema,
	doctorIdSchema,
	overrideDoctorsFromExcelSchema,
	updateDoctorSchema
} from '$lib/schemas/doctor';
import { requireDoctorsAccess } from '$lib/server/auth-guard';

async function perms() {
	return requireDoctorsAccess(getRequestEvent());
}

export const getDoctors = query(async () => doctorService.listDoctors(await perms()));

export const getDoctor = query(doctorIdSchema, async (id) =>
	doctorService.getDoctor(await perms(), id)
);

export const createDoctor = command(createDoctorSchema, async (data) => {
	const doctor = await doctorService.createDoctor(await perms(), data);
	void getDoctors().refresh();
	return doctor;
});

export const updateDoctor = command(
	z.object({
		id: doctorIdSchema,
		...updateDoctorSchema.shape
	}),
	async ({ id, ...data }) => {
		const doctor = await doctorService.updateDoctor(await perms(), id, data);
		void getDoctors().refresh();
		void getDoctor(id).refresh();
		return doctor;
	}
);

export const deleteDoctor = command(doctorIdSchema, async (id) => {
	await doctorService.deleteDoctor(await perms(), id);
	void getDoctors().refresh();
});

export const overrideDoctorsFromExcel = command(overrideDoctorsFromExcelSchema, async (data) => {
	const result = await doctorService.overrideDoctorsFromExcel(await perms(), data);
	void getDoctors().refresh();
	return result;
});
