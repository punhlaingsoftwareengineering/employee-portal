import { z } from 'zod';
import { APP_FONTS } from '$lib/constants/app-settings';

const fontValueSchema = z.enum(APP_FONTS.map((font) => font.value) as [string, ...string[]]);

export const portalFontPolicySchema = z
	.object({
		allowedFonts: z.array(fontValueSchema).min(1, 'Select at least one font'),
		defaultFont: fontValueSchema
	})
	.refine((data) => data.allowedFonts.includes(data.defaultFont), {
		message: 'Default font must be one of the allowed fonts',
		path: ['defaultFont']
	});

export type PortalFontPolicyInput = z.infer<typeof portalFontPolicySchema>;
