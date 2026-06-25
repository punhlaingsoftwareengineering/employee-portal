import { z } from 'zod';
import {
	ANNOUNCEMENT_ACCENT_PRESETS,
	ANNOUNCEMENT_TYPES
} from '$lib/constants/announcement';

const hexColorSchema = z
	.string()
	.regex(/^#[0-9A-Fa-f]{6}$/, 'Use a hex color like #3b82f6');

const announcementBaseSchema = z.object({
	title: z.string().min(1).max(200),
	body: z.string().max(500).optional(),
	linkUrl: z.string().url().max(2048).optional(),
	isActive: z.boolean().optional()
});

const announcementFieldsSchema = announcementBaseSchema.extend({
	type: z.enum(ANNOUNCEMENT_TYPES),
	imageUrl: z.string().url().max(2048).optional(),
	accentPreset: z.enum(ANNOUNCEMENT_ACCENT_PRESETS).optional(),
	accentColor: hexColorSchema.optional()
});

function requireImageUrlForImageType(
	data: { type?: (typeof ANNOUNCEMENT_TYPES)[number]; imageUrl?: string },
	ctx: z.RefinementCtx
) {
	if (data.type === 'image' && !data.imageUrl) {
		ctx.addIssue({
			code: 'custom',
			message: 'Image URL is required for image announcements',
			path: ['imageUrl']
		});
	}
}

export const createAnnouncementSchema =
	announcementFieldsSchema.superRefine(requireImageUrlForImageType);

export const updateAnnouncementSchema = announcementFieldsSchema
	.partial()
	.superRefine(requireImageUrlForImageType);

export type CreateAnnouncementInput = z.infer<typeof createAnnouncementSchema>;
export type UpdateAnnouncementInput = z.infer<typeof updateAnnouncementSchema>;
