import {
	APP_BRANDING_COOKIE,
	DEFAULT_APP_SETTINGS,
	type AppBranding
} from '$lib/constants/app-settings';
import type { LayoutServerLoad } from './$types';

function parseBrandingCookie(raw: string | undefined): AppBranding | undefined {
	if (!raw) return undefined;

	try {
		const parsed = JSON.parse(decodeURIComponent(raw)) as Record<string, unknown>;
		return {
			title:
				typeof parsed.title === 'string' && parsed.title.trim()
					? parsed.title.trim()
					: DEFAULT_APP_SETTINGS.title,
			iconUrl:
				typeof parsed.iconUrl === 'string'
					? parsed.iconUrl.trim() || null
					: parsed.iconUrl === null
						? null
						: DEFAULT_APP_SETTINGS.iconUrl
		};
	} catch {
		return undefined;
	}
}

export const load: LayoutServerLoad = async ({ cookies }) => {
	const appBranding = parseBrandingCookie(cookies.get(APP_BRANDING_COOKIE));

	return { appBranding };
};
