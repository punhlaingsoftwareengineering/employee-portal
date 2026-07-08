import type { ServiceEmbedMode } from '$lib/constants/service-embed';

/** Stable ID — upserted by ensureBuiltinServices(). */
export const E_SIGNATURE_SERVICE_ID = 'c8e4f2a1-9b3d-4e5f-a1b2-3c4d5e6f7081';

/** Stable ID — link synced from DRIVE_ORIGIN env on startup. */
export const PHH_DRIVE_SERVICE_ID = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';

/** Stable ID — link synced from DOCS_ORIGIN env on startup. */
export const DOCS_SERVICE_ID = 'a3b5c7d9-e1f2-4a6b-8c0d-1e2f3a4b5c6d';

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

const BUILTIN_SERVICE_IDS = new Set([
	...BUILTIN_SERVICES.map((item) => item.id),
	PHH_DRIVE_SERVICE_ID,
	DOCS_SERVICE_ID
]);

export function isBuiltinServiceId(id: string): boolean {
	return BUILTIN_SERVICE_IDS.has(id);
}

export function getBuiltinServiceDefinition(id: string): BuiltinServiceDefinition | undefined {
	return BUILTIN_SERVICES.find((item) => item.id === id);
}
