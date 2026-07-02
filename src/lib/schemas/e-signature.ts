import { z } from 'zod';
import { E_SIGNATURE_DEFAULT_WEB } from '$lib/constants/e-signature';

function normalizeWebDisplay(value: string): string {
	const trimmed = value.trim();
	return trimmed.replace(/^https?:\/\//i, '').replace(/\/$/, '');
}

export const eSignatureFormSchema = z.object({
	employeeNo: z.string().trim().min(1, 'Employee number is required').max(20),
	name: z.string().trim().min(1, 'Name is required').max(80),
	designation: z.string().trim().min(1, 'Designation is required').max(80),
	department: z.string().trim().min(1, 'Department is required').max(80),
	email: z.string().trim().email('Enter a valid email').max(120),
	phone: z.string().trim().min(1, 'Phone is required').max(30),
	location: z.string().trim().min(1, 'Location is required').max(120),
	web: z
		.string()
		.trim()
		.max(120)
		.optional()
		.transform((value) => normalizeWebDisplay(value || E_SIGNATURE_DEFAULT_WEB))
});

export type ESignatureFormData = z.infer<typeof eSignatureFormSchema>;

export const eSignatureDefaultFormData: ESignatureFormData = {
	employeeNo: '',
	name: '',
	designation: '',
	department: '',
	email: '',
	phone: '',
	location: '',
	web: E_SIGNATURE_DEFAULT_WEB
};
