import type { ServiceEmbedMode } from '$lib/constants/service-embed';

/** Stable ID — upserted by ensureBuiltinServices(). */
export const E_SIGNATURE_SERVICE_ID = 'c8e4f2a1-9b3d-4e5f-a1b2-3c4d5e6f7081';

/** Stable ID — link synced from DRIVE_ORIGIN env on startup. */
export const PHH_DRIVE_SERVICE_ID = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';

/** Stable ID — link synced from DOCS_ORIGIN env on startup. */
export const DOCS_SERVICE_ID = 'a3b5c7d9-e1f2-4a6b-8c0d-1e2f3a4b5c6d';

/** Stable ID — link synced from ORDER_RESEND_ORIGIN env on startup. */
export const ORDER_RESEND_SERVICE_ID = 'b4c6d8e0-f2a3-5b7c-9d1e-2f3a4b5c6d7e';

/** Stable ID — link synced from MARI_CHATBOT_ORIGIN env on startup. */
export const MARI_CHATBOT_SERVICE_ID = 'c5d7e9f1-a3b4-6c8d-0e2f-3a4b5c6d7e8f';

/** Stable ID — link synced from N8N_MONITOR_ORIGIN env on startup. */
export const N8N_MONITOR_SERVICE_ID = 'd6e8f0a2-b4c5-6d8e-9f0a-1b2c3d4e5f6a';

/** Stable ID — link synced from CALLTRACKER_ORIGIN env on startup. */
export const CALLTRACKER_SERVICE_ID = 'e7f9a1b3-c5d6-7e9f-0a1b-2c3d4e5f6a7b';

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
	DOCS_SERVICE_ID,
	ORDER_RESEND_SERVICE_ID,
	MARI_CHATBOT_SERVICE_ID,
	N8N_MONITOR_SERVICE_ID,
	CALLTRACKER_SERVICE_ID
]);

export function isBuiltinServiceId(id: string): boolean {
	return BUILTIN_SERVICE_IDS.has(id);
}

export function getBuiltinServiceDefinition(id: string): BuiltinServiceDefinition | undefined {
	return BUILTIN_SERVICES.find((item) => item.id === id);
}
