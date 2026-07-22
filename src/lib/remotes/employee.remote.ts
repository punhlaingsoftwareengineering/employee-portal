import { query, command } from '$app/server';
import { getRequestEvent } from '$app/server';
import { z } from 'zod';
import * as employeeService from '$lib/server/services/employee';
import {
	createEmployeeSchema,
	employeeIdSchema,
	overrideEmployeesFromExcelSchema,
	updateEmployeeSchema
} from '$lib/schemas/employee';
import { requireEmployeesAccess } from '$lib/server/auth-guard';

async function perms() {
	return requireEmployeesAccess(getRequestEvent());
}

export const getEmployees = query(async () => employeeService.listEmployees(await perms()));

export const getEmployee = query(employeeIdSchema, async (id) =>
	employeeService.getEmployee(await perms(), id)
);

export const createEmployee = command(createEmployeeSchema, async (data) => {
	const employee = await employeeService.createEmployee(await perms(), data);
	void getEmployees().refresh();
	return employee;
});

export const updateEmployee = command(
	z.object({
		id: employeeIdSchema,
		...updateEmployeeSchema.shape
	}),
	async ({ id, ...data }) => {
		const employee = await employeeService.updateEmployee(await perms(), id, data);
		void getEmployees().refresh();
		void getEmployee(id).refresh();
		return employee;
	}
);

export const deleteEmployee = command(employeeIdSchema, async (id) => {
	await employeeService.deleteEmployee(await perms(), id);
	void getEmployees().refresh();
});

export const overrideEmployeesFromExcel = command(
	overrideEmployeesFromExcelSchema,
	async (data) => {
		const result = await employeeService.overrideEmployeesFromExcel(await perms(), data);
		void getEmployees().refresh();
		return result;
	}
);
