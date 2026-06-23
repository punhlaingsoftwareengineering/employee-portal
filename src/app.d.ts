import type { User, Session } from 'better-auth';
import type { UserPermissionsSummary } from '$lib/constants/permissions';
import type { ServiceSummary } from '$lib/schemas/service';
import type { AppSummary } from '$lib/schemas/app';

// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		interface Locals {
			user?: User;
			session?: Session;
		}

		interface PageData {
			user?: User;
			permissions?: UserPermissionsSummary;
			availableServices?: ServiceSummary[];
			availableApps?: AppSummary[];
		}
		// interface Error {}
		// interface Platform {}
	}
}

export {};
