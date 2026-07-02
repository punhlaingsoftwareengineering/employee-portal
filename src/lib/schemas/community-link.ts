import { z } from 'zod';
import { COMMUNITY_PLATFORMS } from '$lib/constants/community';

export const createCommunityLinkSchema = z.object({
	categoryId: z.string().uuid(),
	title: z.string().min(1).max(200),
	description: z.string().max(1000).optional(),
	url: z.string().url().max(2048),
	platform: z.enum(COMMUNITY_PLATFORMS).optional(),
	sortOrder: z.number().int().min(0).max(9999).optional(),
	showQr: z.boolean().optional(),
	isPublic: z.boolean().optional()
});

export const updateCommunityLinkSchema = createCommunityLinkSchema
	.omit({ categoryId: true })
	.partial()
	.extend({
		categoryId: z.string().uuid().optional()
	});

export type CreateCommunityLinkInput = z.infer<typeof createCommunityLinkSchema>;
export type UpdateCommunityLinkInput = z.infer<typeof updateCommunityLinkSchema>;
