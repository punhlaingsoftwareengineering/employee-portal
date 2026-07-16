import { error } from '@sveltejs/kit';
import {
	isPortalDriveCategory,
	type PortalDriveCategory
} from '$lib/constants/drive-media-categories';
import { DrivePortalNotConfiguredError } from '$lib/server/drive-portal-client';

export function parseDriveMediaCategory(raw: string | undefined): PortalDriveCategory {
	if (!raw || !isPortalDriveCategory(raw)) {
		throw error(400, 'Invalid drive media category');
	}
	return raw;
}

function formatDriveErrorMessage(e: unknown): string {
	if (!(e instanceof Error)) return 'Drive request failed';
	const cause =
		e.cause instanceof Error
			? e.cause.message
			: typeof e.cause === 'string'
				? e.cause
				: '';
	if (cause && cause !== e.message) return `${e.message}: ${cause}`;
	return e.message;
}

export function handleDrivePortalError(e: unknown): never {
	if (e instanceof DrivePortalNotConfiguredError) {
		throw error(503, e.message);
	}
	throw error(502, formatDriveErrorMessage(e));
}
