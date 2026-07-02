import { z } from 'zod';

export const createToolLearningSchema = z.object({
	title: z.string().min(1).max(200),
	description: z.string().max(1000).optional(),
	videoUrl: z.string().url().max(2048),
	duration: z.string().max(40).optional(),
	sortOrder: z.number().int().min(0).max(9999).optional()
});

export const updateToolLearningSchema = createToolLearningSchema.partial();

export type CreateToolLearningInput = z.infer<typeof createToolLearningSchema>;
export type UpdateToolLearningInput = z.infer<typeof updateToolLearningSchema>;
