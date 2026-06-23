import { z } from 'zod';

export const createNewsletterSchema = z.object({
	title: z.string().min(1).max(200),
	pdfUrl: z.string().url().max(2048)
});

export const updateNewsletterSchema = createNewsletterSchema.partial();

export type CreateNewsletterInput = z.infer<typeof createNewsletterSchema>;
export type UpdateNewsletterInput = z.infer<typeof updateNewsletterSchema>;
