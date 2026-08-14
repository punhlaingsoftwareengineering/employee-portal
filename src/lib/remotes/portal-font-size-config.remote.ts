import { command, query } from '$app/server';
import { getRequestEvent } from '$app/server';
import * as portalFontSizeConfigService from '$lib/server/services/portal-font-size-config';
import { portalFontSizePolicySchema } from '$lib/schemas/portal-font-size-config';
import { requireSettingsAccess } from '$lib/server/auth-guard';

async function perms() {
	return requireSettingsAccess(getRequestEvent());
}

export const getPortalFontSizeConfig = query(async () =>
	portalFontSizeConfigService.getPortalFontSizePolicy()
);

export const updatePortalFontSizeConfig = command(portalFontSizePolicySchema, async (data) => {
	const policy = await portalFontSizeConfigService.updatePortalFontSizePolicy(await perms(), data);
	void getPortalFontSizeConfig().refresh();
	return policy;
});
