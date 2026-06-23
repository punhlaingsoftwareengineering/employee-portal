import { json, type RequestHandler } from '@sveltejs/kit';
import { requireAppAccess } from '$lib/server/auth-guard';
import * as employeeService from '$lib/server/services/employee';
import { createEmployeeSchema } from '$lib/schemas/employee';

export const GET: RequestHandler = async (event) => {
	const perms = await requireAppAccess(event);
	const employees = await employeeService.listEmployees(perms);
	return json(employees);
};

export const POST: RequestHandler = async (event) => {
	const perms = await requireAppAccess(event);
	const body = await event.request.json();
	const data = createEmployeeSchema.parse(body);
	const employee = await employeeService.createEmployee(perms, data);
	return json(employee, { status: 201 });
};
