import { z } from 'zod';

export const createOnboardingSlideSchema = z.object({
	title: z.string().min(1).max(120),
	description: z.string().max(500).optional(),
	imageUrl: z.string().url().max(2048),
	sortOrder: z.number().int().min(0).optional()
});

export const updateOnboardingSlideSchema = createOnboardingSlideSchema.partial();

export type CreateOnboardingSlideInput = z.infer<typeof createOnboardingSlideSchema>;
export type UpdateOnboardingSlideInput = z.infer<typeof updateOnboardingSlideSchema>;
