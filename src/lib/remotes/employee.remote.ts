import { query, form, command } from '$app/server';
import { getRequestEvent } from '$app/server';
import { redirect } from '@sveltejs/kit';
import { z } from 'zod';
import * as employeeService from '$lib/server/services/employee';
import { createEmployeeSchema, updateEmployeeSchema } from '$lib/schemas/employee';
import { requireAppAccess } from '$lib/server/auth-guard';

async function perms() {
	return requireAppAccess(getRequestEvent());
}

export const getEmployees = query(async () => employeeService.listEmployees(await perms()));

export const getEmployee = query(z.string().uuid(), async (id) =>
	employeeService.getEmployee(await perms(), id)
);

export const createEmployee = command(createEmployeeSchema, async (data) => {
	const employee = await employeeService.createEmployee(await perms(), data);
	void getEmployees().refresh();
	return employee;
});

export const updateEmployee = form(
	z.object({
		id: z.string().uuid(),
		...updateEmployeeSchema.shape
	}),
	async ({ id, ...data }) => {
		await employeeService.updateEmployee(await perms(), id, data);
		void getEmployees().refresh();
		void getEmployee(id).refresh();
		redirect(303, `/employees/${id}`);
	}
);

export const deleteEmployee = command(z.string().uuid(), async (id) => {
	await employeeService.deleteEmployee(await perms(), id);
	void getEmployees().refresh();
});
