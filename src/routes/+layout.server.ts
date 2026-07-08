import {
	APP_BRANDING_COOKIE,
	DEFAULT_APP_SETTINGS,
	type AppBranding
} from '$lib/constants/app-settings';
import { getPortalThemePolicy } from '$lib/server/services/portal-theme-config';
import { getPortalFontPolicy } from '$lib/server/services/portal-font-config';
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

export const load: LayoutServerLoad = async ({ cookies, locals }) => {
	const appBranding = parseBrandingCookie(cookies.get(APP_BRANDING_COOKIE));
	const [portalThemePolicy, portalFontPolicy] = await Promise.all([
		getPortalThemePolicy(),
		getPortalFontPolicy()
	]);

	return {
		appBranding,
		portalThemePolicy,
		portalFontPolicy,
		user: locals.user ?? null
	};
};
