import { z } from 'zod';

const nullableUrl = z.string().url().max(2048).nullable().optional();

export const createFacilitySchema = z.object({
	name: z.string().min(1).max(100),
	description: z.string().max(500).optional(),
	address: z.string().max(300).optional(),
	imageUrl: nullableUrl,
	phone: z.string().max(30).optional()
});

export const updateFacilitySchema = createFacilitySchema.partial();

export type CreateFacilityInput = z.infer<typeof createFacilitySchema>;
export type UpdateFacilityInput = z.infer<typeof updateFacilitySchema>;
