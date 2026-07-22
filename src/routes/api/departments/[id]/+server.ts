import { json, type RequestHandler } from '@sveltejs/kit';
import { requireDepartmentsAccess } from '$lib/server/auth-guard';
import * as departmentService from '$lib/server/services/department';
import { updateDepartmentSchema } from '$lib/schemas/department';

export const GET: RequestHandler = async (event) => {
	const perms = await requireDepartmentsAccess(event);
	const department = await departmentService.getDepartment(perms, event.params.id!);
	return json(department);
};

export const PATCH: RequestHandler = async (event) => {
	const perms = await requireDepartmentsAccess(event);
	const body = await event.request.json();
	const data = updateDepartmentSchema.parse(body);
	const department = await departmentService.updateDepartment(perms, event.params.id!, data);
	return json(department);
};

export const DELETE: RequestHandler = async (event) => {
	const perms = await requireDepartmentsAccess(event);
	await departmentService.deleteDepartment(perms, event.params.id!);
	return new Response(null, { status: 204 });
};
