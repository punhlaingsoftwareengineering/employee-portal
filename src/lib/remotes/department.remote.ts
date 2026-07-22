import { query, command } from '$app/server';
import { getRequestEvent } from '$app/server';
import { z } from 'zod';
import * as departmentService from '$lib/server/services/department';
import { createDepartmentSchema, updateDepartmentSchema } from '$lib/schemas/department';
import { requireDepartmentsAccess } from '$lib/server/auth-guard';

async function perms() {
	return requireDepartmentsAccess(getRequestEvent());
}

export const getDepartments = query(async () => departmentService.listDepartments(await perms()));

export const getDepartment = query(z.string().uuid(), async (id) =>
	departmentService.getDepartment(await perms(), id)
);

export const createDepartment = command(createDepartmentSchema, async (data) => {
	const department = await departmentService.createDepartment(await perms(), data);
	void getDepartments().refresh();
	return department;
});

export const updateDepartment = command(
	z.object({
		id: z.string().uuid(),
		...updateDepartmentSchema.shape
	}),
	async ({ id, ...data }) => {
		const department = await departmentService.updateDepartment(await perms(), id, data);
		void getDepartments().refresh();
		void getDepartment(id).refresh();
		return department;
	}
);

export const deleteDepartment = command(z.string().uuid(), async (id) => {
	await departmentService.deleteDepartment(await perms(), id);
	void getDepartments().refresh();
});
