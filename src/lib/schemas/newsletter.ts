import { z } from 'zod';

export const createNewsletterSchema = z.object({
	title: z.string().min(1).max(200),
	pdfUrl: z.string().url().max(2048),
	sortOrder: z.number().int().min(0).max(999999).optional()
});

export const updateNewsletterSchema = createNewsletterSchema.partial();

export type CreateNewsletterInput = z.infer<typeof createNewsletterSchema>;
export type UpdateNewsletterInput = z.infer<typeof updateNewsletterSchema>;
