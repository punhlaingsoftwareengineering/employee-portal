import { json, type RequestHandler } from '@sveltejs/kit';
import { requireDepartmentsAccess } from '$lib/server/auth-guard';
import * as departmentService from '$lib/server/services/department';
import { createDepartmentSchema } from '$lib/schemas/department';

export const GET: RequestHandler = async (event) => {
	const perms = await requireDepartmentsAccess(event);
	const departments = await departmentService.listDepartments(perms);
	return json(departments);
};

export const POST: RequestHandler = async (event) => {
	const perms = await requireDepartmentsAccess(event);
	const body = await event.request.json();
	const data = createDepartmentSchema.parse(body);
	const department = await departmentService.createDepartment(perms, data);
	return json(department, { status: 201 });
};
