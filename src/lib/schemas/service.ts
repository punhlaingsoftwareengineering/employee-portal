import { z } from 'zod';
import { normalizeServiceUrl } from '$lib/constants/service-link';
import { SERVICE_EMBED_MODES } from '$lib/constants/service-embed';
import type { ServiceEmbedMode } from '$lib/constants/service-embed';

const serviceUrlSchema = z
	.string()
	.max(2048)
	.transform(normalizeServiceUrl)
	.pipe(z.string().url());

export const serviceEmbedModeSchema = z.enum(
	SERVICE_EMBED_MODES.map((mode) => mode.value) as [ServiceEmbedMode, ...ServiceEmbedMode[]]
);

function expandShortHex(hex: string): string {
	if (hex.length === 3) {
		return hex
			.split('')
			.map((char) => char + char)
			.join('');
	}
	return hex;
}

export function normalizeAccentColor(input: unknown): string | null {
	if (input === null || input === undefined || input === '') return null;
	if (typeof input !== 'string') return null;

	const trimmed = input.trim();
	const match = trimmed.match(/^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/);
	if (!match) return null;

	return `#${expandShortHex(match[1]).toUpperCase()}`;
}

export const accentColorSchema = z
	.union([z.string(), z.null()])
	.optional()
	.transform((value) => {
		if (!value) return null;
		return normalizeAccentColor(value);
	});

export const createServiceSchema = z.object({
	name: z.string().min(1).max(120),
	description: z.string().max(500).optional(),
	category: z.string().trim().max(32).optional(),
	accentColor: accentColorSchema.optional(),
	link: serviceUrlSchema,
	iconUrl: z.string().url().max(2048).nullable().optional(),
	embedMode: serviceEmbedModeSchema.optional(),
	isPublic: z.boolean().optional()
});

export const updateServiceSchema = createServiceSchema.partial().extend({
	id: z.string().uuid()
});

export type CreateServiceInput = z.infer<typeof createServiceSchema>;
export type UpdateServiceInput = z.infer<typeof updateServiceSchema>;

export type ServiceSummary = {
	id: string;
	name: string;
	description: string | null;
	category: string | null;
	accentColor: string | null;
	link: string;
	iconUrl: string | null;
	embedMode: ServiceEmbedMode;
	isPublic: boolean;
};
