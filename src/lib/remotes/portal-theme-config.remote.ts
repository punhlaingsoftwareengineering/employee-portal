import { command, query } from '$app/server';
import { getRequestEvent } from '$app/server';
import * as portalThemeConfigService from '$lib/server/services/portal-theme-config';
import { portalThemePolicySchema } from '$lib/schemas/portal-theme-config';
import { requireSettingsAccess } from '$lib/server/auth-guard';

async function perms() {
	return requireSettingsAccess(getRequestEvent());
}

export const getPortalThemeConfig = query(async () => portalThemeConfigService.getPortalThemePolicy());

export const updatePortalThemeConfig = command(portalThemePolicySchema, async (data) => {
	const policy = await portalThemeConfigService.updatePortalThemePolicy(await perms(), data);
	void getPortalThemeConfig().refresh();
	return policy;
});
