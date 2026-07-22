import { z } from 'zod';

const optionalText = z
	.string()
	.trim()
	.max(500)
	.optional()
	.nullable()
	.transform((value) => (value && value.length > 0 ? value : null));

export const pharmacyMasterIdSchema = z.string().trim().min(1).max(100);

export const createPharmacyMasterSchema = z.object({
	id: pharmacyMasterIdSchema,
	itemClass: optionalText,
	subClass: optionalText,
	itemName: optionalText,
	genericName: optionalText,
	strengthValue: optionalText,
	issueUnit: optionalText,
	facilityId: optionalText,
	entryDate: z.union([z.string(), z.date()]).optional().nullable(),
	active: z.boolean().optional().nullable()
});

export const updatePharmacyMasterSchema = createPharmacyMasterSchema.omit({ id: true }).partial();

export const overridePharmacyMastersFromExcelSchema = z.object({
	fileBase64: z.string().min(1),
	fileName: z.string().min(1).max(255)
});

export type CreatePharmacyMasterInput = z.infer<typeof createPharmacyMasterSchema>;
export type UpdatePharmacyMasterInput = z.infer<typeof updatePharmacyMasterSchema>;
export type OverridePharmacyMastersFromExcelInput = z.infer<
	typeof overridePharmacyMastersFromExcelSchema
>;
