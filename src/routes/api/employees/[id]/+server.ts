import { json, type RequestHandler } from '@sveltejs/kit';
import { requireEmployeesAccess } from '$lib/server/auth-guard';
import * as employeeService from '$lib/server/services/employee';
import { updateEmployeeSchema } from '$lib/schemas/employee';

export const GET: RequestHandler = async (event) => {
	const perms = await requireEmployeesAccess(event);
	const employee = await employeeService.getEmployee(perms, event.params.id!);
	return json(employee);
};

export const PATCH: RequestHandler = async (event) => {
	const perms = await requireEmployeesAccess(event);
	const body = await event.request.json();
	const data = updateEmployeeSchema.parse(body);
	const employee = await employeeService.updateEmployee(perms, event.params.id!, data);
	return json(employee);
};

export const DELETE: RequestHandler = async (event) => {
	const perms = await requireEmployeesAccess(event);
	await employeeService.deleteEmployee(perms, event.params.id!);
	return new Response(null, { status: 204 });
};
