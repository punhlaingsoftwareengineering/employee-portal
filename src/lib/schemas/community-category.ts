import { z } from 'zod';
import { COMMUNITY_PLATFORMS } from '$lib/constants/community';

export const createCommunityCategorySchema = z.object({
	name: z.string().min(1).max(120),
	description: z.string().max(1000).optional(),
	sortOrder: z.number().int().min(0).max(9999).optional()
});

export const updateCommunityCategorySchema = createCommunityCategorySchema.partial();

export type CreateCommunityCategoryInput = z.infer<typeof createCommunityCategorySchema>;
export type UpdateCommunityCategoryInput = z.infer<typeof updateCommunityCategorySchema>;
