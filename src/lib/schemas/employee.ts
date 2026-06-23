import { z } from 'zod';
import { EMPLOYEE_STATUSES } from '$lib/constants/employee-status';

export const employeeStatusSchema = z.enum(EMPLOYEE_STATUSES);

export const createEmployeeSchema = z.object({
	departmentId: z.string().uuid(),
	roleId: z.string().uuid(),
	facilityId: z.string().uuid(),
	firstName: z.string().min(1).max(100),
	lastName: z.string().min(1).max(100),
	email: z.string().email(),
	status: employeeStatusSchema.default('active')
});

export const updateEmployeeSchema = createEmployeeSchema.partial();

export type CreateEmployeeInput = z.infer<typeof createEmployeeSchema>;
export type UpdateEmployeeInput = z.infer<typeof updateEmployeeSchema>;
