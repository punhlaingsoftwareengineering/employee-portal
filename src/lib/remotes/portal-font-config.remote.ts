import { command, query } from '$app/server';
import { getRequestEvent } from '$app/server';
import * as portalFontConfigService from '$lib/server/services/portal-font-config';
import { portalFontPolicySchema } from '$lib/schemas/portal-font-config';
import { requireSettingsAccess } from '$lib/server/auth-guard';

async function perms() {
	return requireSettingsAccess(getRequestEvent());
}

export const getPortalFontConfig = query(async () => portalFontConfigService.getPortalFontPolicy());

export const updatePortalFontConfig = command(portalFontPolicySchema, async (data) => {
	const policy = await portalFontConfigService.updatePortalFontPolicy(await perms(), data);
	void getPortalFontConfig().refresh();
	return policy;
});
