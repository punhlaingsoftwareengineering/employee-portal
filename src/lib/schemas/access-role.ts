import { z } from 'zod';

export const accessRolePermissionsSchema = z.object({
	navDashboard: z.boolean().default(true),
	navEmployees: z.boolean().default(true),
	navDepartments: z.boolean().default(true),
	navFacilities: z.boolean().default(true),
	navTools: z.boolean().default(true),
	navSettings: z.boolean().default(false),
	employeeReadAll: z.boolean().default(false),
	employeeWrite: z.boolean().default(false),
	employeeDelete: z.boolean().default(false),
	departmentReadAll: z.boolean().default(false),
	departmentWrite: z.boolean().default(false),
	facilityReadAll: z.boolean().default(false),
	facilityWrite: z.boolean().default(false)
});

export const createAccessRoleSchema = z.object({
	name: z.string().min(1).max(80),
	slug: z
		.string()
		.min(1)
		.max(40)
		.regex(/^[a-z][a-z0-9_-]*$/, 'Slug must be lowercase letters, numbers, _ or -'),
	description: z.string().max(300).optional(),
	serviceIds: z.array(z.string().uuid()).optional(),
	appIds: z.array(z.string().uuid()).optional(),
	...accessRolePermissionsSchema.shape
});

export const updateAccessRoleSchema = createAccessRoleSchema.partial().extend({
	id: z.string().uuid()
});

export type CreateAccessRoleInput = z.infer<typeof createAccessRoleSchema>;
export type UpdateAccessRoleInput = z.infer<typeof updateAccessRoleSchema>;
