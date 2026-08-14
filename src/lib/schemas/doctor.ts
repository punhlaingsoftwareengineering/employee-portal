import { z } from 'zod';

const optionalText = z
	.string()
	.trim()
	.max(255)
	.optional()
	.nullable()
	.transform((value) => (value && value.length > 0 ? value : null));

const optionalInt = z
	.union([z.number(), z.string(), z.null(), z.undefined()])
	.transform((value, ctx) => {
		if (value == null || value === '') return null;
		const n = typeof value === 'number' ? value : Number(String(value).trim());
		if (!Number.isFinite(n)) {
			ctx.addIssue({ code: 'custom', message: 'Must be a number' });
			return z.NEVER;
		}
		return Math.trunc(n);
	});

export const doctorIdSchema = z.coerce.number().int().positive();

export const createDoctorSchema = z.object({
	hisid: optionalInt,
	facilityName: optionalText,
	drnno: optionalText,
	doctorName: optionalText,
	specialization: optionalText,
	active: z.boolean().optional().nullable()
});

export const updateDoctorSchema = createDoctorSchema.partial();

export const overrideDoctorsFromExcelSchema = z.object({
	fileBase64: z.string().min(1),
	fileName: z.string().min(1).max(255)
});

export type CreateDoctorInput = z.infer<typeof createDoctorSchema>;
export type UpdateDoctorInput = z.infer<typeof updateDoctorSchema>;
export type OverrideDoctorsFromExcelInput = z.infer<typeof overrideDoctorsFromExcelSchema>;
