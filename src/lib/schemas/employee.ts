import { z } from 'zod';

const optionalText = z
	.string()
	.trim()
	.max(500)
	.optional()
	.nullable()
	.transform((value) => (value && value.length > 0 ? value : null));

export const employeeIdSchema = z.string().trim().min(1).max(100);

export const createEmployeeSchema = z.object({
	id: employeeIdSchema,
	employeeNo: optionalText,
	employeeName: optionalText,
	position: optionalText,
	department: optionalText,
	joinDate: optionalText,
	facility: optionalText,
	userId: optionalText,
	entryDate: z.union([z.string(), z.date()]).optional().nullable(),
	active: z.boolean().optional().nullable()
});

export const updateEmployeeSchema = createEmployeeSchema.omit({ id: true }).partial();

export const overrideEmployeesFromExcelSchema = z.object({
	fileBase64: z.string().min(1),
	fileName: z.string().min(1).max(255)
});

export type CreateEmployeeInput = z.infer<typeof createEmployeeSchema>;
export type UpdateEmployeeInput = z.infer<typeof updateEmployeeSchema>;
export type OverrideEmployeesFromExcelInput = z.infer<typeof overrideEmployeesFromExcelSchema>;
