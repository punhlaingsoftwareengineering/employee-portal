import { z } from 'zod';
import { APP_FONT_SIZES } from '$lib/constants/app-settings';

const fontSizeValueSchema = z.enum(
	APP_FONT_SIZES.map((size) => size.value) as [string, ...string[]]
);

export const portalFontSizePolicySchema = z
	.object({
		allowedFontSizes: z.array(fontSizeValueSchema).min(1, 'Select at least one text size'),
		defaultFontSize: fontSizeValueSchema
	})
	.refine((data) => data.allowedFontSizes.includes(data.defaultFontSize), {
		message: 'Default text size must be one of the allowed sizes',
		path: ['defaultFontSize']
	});

export type PortalFontSizePolicyInput = z.infer<typeof portalFontSizePolicySchema>;
