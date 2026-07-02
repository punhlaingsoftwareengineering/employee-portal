import { eq } from 'drizzle-orm';
import { error } from '@sveltejs/kit';
import {
	DEFAULT_PORTAL_THEME_POLICY,
	APP_THEME_VALUES,
	type AppTheme,
	type PortalThemePolicy
} from '$lib/constants/app-settings';
import { portalThemePolicySchema } from '$lib/schemas/portal-theme-config';
import { isOptionalFeatureDbError } from '$lib/server/db/errors';
import { db } from '$lib/server/db';
import {
	PORTAL_THEME_CONFIG_ROW_ID,
	portalThemeConfig
} from '$lib/server/db/schema/portal-theme-config';
import type { UserPermissions } from '$lib/server/permissions';

const VALID_THEMES = new Set<AppTheme>(APP_THEME_VALUES);

function normalizePolicy(raw: {
	allowedThemes: string[];
	defaultTheme: string;
}): PortalThemePolicy {
	let allowedThemes = raw.allowedThemes.filter((theme): theme is AppTheme =>
		VALID_THEMES.has(theme as AppTheme)
	);
	if (allowedThemes.length === 0) {
		allowedThemes = [...DEFAULT_PORTAL_THEME_POLICY.allowedThemes];
	}

	let defaultTheme = VALID_THEMES.has(raw.defaultTheme as AppTheme)
		? (raw.defaultTheme as AppTheme)
		: DEFAULT_PORTAL_THEME_POLICY.defaultTheme;
	if (!allowedThemes.includes(defaultTheme)) {
		defaultTheme = allowedThemes[0];
	}

	return { allowedThemes, defaultTheme };
}

function requireAdmin(perms: UserPermissions) {
	if (!perms.isAdmin) error(403, 'Forbidden');
}

export async function getPortalThemePolicy(): Promise<PortalThemePolicy> {
	try {
		const row = await db.query.portalThemeConfig.findFirst({
			where: eq(portalThemeConfig.id, PORTAL_THEME_CONFIG_ROW_ID)
		});

		if (!row) return { ...DEFAULT_PORTAL_THEME_POLICY };
		return normalizePolicy(row);
	} catch (err) {
		if (isOptionalFeatureDbError(err)) return { ...DEFAULT_PORTAL_THEME_POLICY };
		throw err;
	}
}

export async function updatePortalThemePolicy(
	perms: UserPermissions,
	input: unknown
): Promise<PortalThemePolicy> {
	requireAdmin(perms);

	const data = portalThemePolicySchema.parse(input);
	const policy = normalizePolicy(data);

	const existing = await db.query.portalThemeConfig.findFirst({
		where: eq(portalThemeConfig.id, PORTAL_THEME_CONFIG_ROW_ID)
	});

	if (existing) {
		await db
			.update(portalThemeConfig)
			.set({
				allowedThemes: policy.allowedThemes,
				defaultTheme: policy.defaultTheme,
				updatedAt: new Date()
			})
			.where(eq(portalThemeConfig.id, PORTAL_THEME_CONFIG_ROW_ID));
	} else {
		await db.insert(portalThemeConfig).values({
			id: PORTAL_THEME_CONFIG_ROW_ID,
			allowedThemes: policy.allowedThemes,
			defaultTheme: policy.defaultTheme
		});
	}

	return policy;
}
