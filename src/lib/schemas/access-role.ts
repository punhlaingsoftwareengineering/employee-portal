import { z } from 'zod';
import { ACCESS_ROLE_SLUG_REGEX } from '$lib/utils/slug';

export const accessRolePermissionsSchema = z.object({
	navDashboard: z.boolean().default(true),
	navEmployees: z.boolean().default(true),
	navDepartments: z.boolean().default(true),
	navFacilities: z.boolean().default(true),
	navPharmacy: z.boolean().default(true),
	navDoctors: z.boolean().default(true),
	navTools: z.boolean().default(true),
	navSettings: z.boolean().default(false),
	navCommunity: z.boolean().default(false),
	navUsers: z.boolean().default(false),
	navRoles: z.boolean().default(false),
	employeeReadAll: z.boolean().default(false),
	employeeCreate: z.boolean().default(false),
	employeeUpdate: z.boolean().default(false),
	employeeDelete: z.boolean().default(false),
	employeeExcelOverride: z.boolean().default(false),
	employeeExport: z.boolean().default(false),
	departmentReadAll: z.boolean().default(false),
	departmentCreate: z.boolean().default(false),
	departmentUpdate: z.boolean().default(false),
	departmentDelete: z.boolean().default(false),
	facilityReadAll: z.boolean().default(false),
	facilityCreate: z.boolean().default(false),
	facilityUpdate: z.boolean().default(false),
	facilityDelete: z.boolean().default(false),
	pharmacyReadAll: z.boolean().default(false),
	pharmacyCreate: z.boolean().default(false),
	pharmacyUpdate: z.boolean().default(false),
	pharmacyDelete: z.boolean().default(false),
	pharmacyExcelOverride: z.boolean().default(false),
	pharmacyExport: z.boolean().default(false),
	doctorReadAll: z.boolean().default(false),
	doctorCreate: z.boolean().default(false),
	doctorUpdate: z.boolean().default(false),
	doctorDelete: z.boolean().default(false),
	doctorExcelOverride: z.boolean().default(false),
	doctorExport: z.boolean().default(false),
	usersRead: z.boolean().default(false),
	usersInvite: z.boolean().default(false),
	usersUpdate: z.boolean().default(false),
	usersInviteResend: z.boolean().default(false),
	usersInviteRevoke: z.boolean().default(false),
	rolesRead: z.boolean().default(false),
	rolesCreate: z.boolean().default(false),
	rolesUpdate: z.boolean().default(false),
	rolesDelete: z.boolean().default(false),
	communityCategoryCreate: z.boolean().default(false),
	communityCategoryUpdate: z.boolean().default(false),
	communityCategoryDelete: z.boolean().default(false),
	communityLinkCreate: z.boolean().default(false),
	communityLinkUpdate: z.boolean().default(false),
	communityLinkDelete: z.boolean().default(false),
	settingsThemeUpdate: z.boolean().default(false),
	settingsNewsletterCreate: z.boolean().default(false),
	settingsNewsletterUpdate: z.boolean().default(false),
	settingsNewsletterDelete: z.boolean().default(false),
	settingsOnboardingCreate: z.boolean().default(false),
	settingsOnboardingUpdate: z.boolean().default(false),
	settingsOnboardingDelete: z.boolean().default(false),
	settingsAnnouncementCreate: z.boolean().default(false),
	settingsAnnouncementUpdate: z.boolean().default(false),
	settingsAnnouncementDelete: z.boolean().default(false),
	settingsSoundCreate: z.boolean().default(false),
	settingsSoundUpdate: z.boolean().default(false),
	settingsSoundDelete: z.boolean().default(false),
	settingsNotificationCreate: z.boolean().default(false),
	settingsNotificationUpdate: z.boolean().default(false),
	settingsNotificationDelete: z.boolean().default(false),
	toolsServiceCreate: z.boolean().default(false),
	toolsServiceUpdate: z.boolean().default(false),
	toolsServiceDelete: z.boolean().default(false),
	toolsAppCreate: z.boolean().default(false),
	toolsAppUpdate: z.boolean().default(false),
	toolsAppDelete: z.boolean().default(false),
	toolsGuideCreate: z.boolean().default(false),
	toolsGuideUpdate: z.boolean().default(false),
	toolsGuideDelete: z.boolean().default(false),
	toolsLearningCreate: z.boolean().default(false),
	toolsLearningUpdate: z.boolean().default(false),
	toolsLearningDelete: z.boolean().default(false)
});

export type AccessRolePermissions = z.infer<typeof accessRolePermissionsSchema>;

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
