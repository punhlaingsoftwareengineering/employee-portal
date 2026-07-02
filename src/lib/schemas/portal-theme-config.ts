import { z } from 'zod';
import { APP_THEME_VALUES } from '$lib/constants/app-settings';

const themeValueSchema = z.enum(APP_THEME_VALUES);

export const portalThemePolicySchema = z
	.object({
		allowedThemes: z.array(themeValueSchema).min(1, 'Select at least one theme'),
		defaultTheme: themeValueSchema
	})
	.refine((data) => data.allowedThemes.includes(data.defaultTheme), {
		message: 'Default theme must be one of the allowed themes',
		path: ['defaultTheme']
	});

export type PortalThemePolicyInput = z.infer<typeof portalThemePolicySchema>;
