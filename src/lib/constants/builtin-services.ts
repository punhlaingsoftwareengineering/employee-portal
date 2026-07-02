import type { ServiceEmbedMode } from '$lib/constants/service-embed';

/** Stable ID — upserted by ensureBuiltinServices(). */
export const E_SIGNATURE_SERVICE_ID = 'c8e4f2a1-9b3d-4e5f-a1b2-3c4d5e6f7081';

export const E_SIGNATURE_SERVICE_PATH = '/tools/e-signature';

export type BuiltinServiceDefinition = {
	id: string;
	name: string;
	description: string;
	category: string;
	accentColor: string;
	path: string;
	embedMode: ServiceEmbedMode;
	isPublic: boolean;
};

export const BUILTIN_SERVICES: readonly BuiltinServiceDefinition[] = [
	{
		id: E_SIGNATURE_SERVICE_ID,
		name: 'E-Signature Generator',
		description: 'Create Pun Hlaing email footer signatures as PNG and GIF.',
		category: 'Internal',
		accentColor: '#0B2D5C',
		path: E_SIGNATURE_SERVICE_PATH,
		embedMode: 'external',
		isPublic: false
	}
] as const;

const BUILTIN_SERVICE_IDS = new Set(BUILTIN_SERVICES.map((item) => item.id));

export function isBuiltinServiceId(id: string): boolean {
	return BUILTIN_SERVICE_IDS.has(id);
}

export function getBuiltinServiceDefinition(id: string): BuiltinServiceDefinition | undefined {
	return BUILTIN_SERVICES.find((item) => item.id === id);
}
