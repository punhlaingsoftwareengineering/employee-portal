import { z } from 'zod';

export const createToolGuideSchema = z.object({
	title: z.string().min(1).max(200),
	description: z.string().max(1000).optional(),
	pdfUrl: z.string().url().max(2048),
	sortOrder: z.number().int().min(0).max(9999).optional()
});

export const updateToolGuideSchema = createToolGuideSchema.partial();

export type CreateToolGuideInput = z.infer<typeof createToolGuideSchema>;
export type UpdateToolGuideInput = z.infer<typeof updateToolGuideSchema>;
