import { z } from 'zod';
import { ACCESS_ROLE_SLUG_REGEX } from '$lib/utils/slug';

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

/** Optional; clients should omit — server generates from name. */
export const accessRoleSlugInputSchema = z
	.string()
	.max(40)
	.optional()
	.transform((value) => {
		const trimmed = value?.trim() ?? '';
		return trimmed.length > 0 ? trimmed : undefined;
	})
	.refine(
		(value) => value === undefined || ACCESS_ROLE_SLUG_REGEX.test(value),
		'Slug must be lowercase letters, numbers, _ or -'
	);

export const createAccessRoleSchema = z.object({
	name: z.string().min(1).max(80),
	slug: accessRoleSlugInputSchema,
	description: z.string().max(300).optional(),
	serviceIds: z.array(z.string().uuid()).optional(),
	appIds: z.array(z.string().uuid()).optional(),
	communityLinkIds: z.array(z.string().uuid()).optional(),
	...accessRolePermissionsSchema.shape
});

export const updateAccessRoleSchema = createAccessRoleSchema.partial().extend({
	id: z.string().uuid()
});

export type CreateAccessRoleInput = z.infer<typeof createAccessRoleSchema>;
export type UpdateAccessRoleInput = z.infer<typeof updateAccessRoleSchema>;
