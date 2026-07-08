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

export function handleDrivePortalError(e: unknown): never {
	if (e instanceof DrivePortalNotConfiguredError) {
		throw error(503, e.message);
	}
	const msg = e instanceof Error ? e.message : 'Drive request failed';
	throw error(502, msg);
}
