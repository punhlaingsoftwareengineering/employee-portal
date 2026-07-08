import { eq } from 'drizzle-orm';
import { error } from '@sveltejs/kit';
import {
	APP_FONT_VALUES,
	DEFAULT_PORTAL_FONT_POLICY,
	type AppFont,
	type PortalFontPolicy
} from '$lib/constants/app-settings';
import { portalFontPolicySchema } from '$lib/schemas/portal-font-config';
import { isOptionalFeatureDbError } from '$lib/server/db/errors';
import { db } from '$lib/server/db';
import {
	PORTAL_FONT_CONFIG_ROW_ID,
	portalFontConfig
} from '$lib/server/db/schema/portal-font-config';
import type { UserPermissions } from '$lib/server/permissions';

const VALID_FONTS = new Set<AppFont>(APP_FONT_VALUES);

function normalizePolicy(raw: {
	allowedFonts: string[];
	defaultFont: string;
}): PortalFontPolicy {
	let allowedFonts = raw.allowedFonts.filter((font): font is AppFont =>
		VALID_FONTS.has(font as AppFont)
	);
	if (allowedFonts.length === 0) {
		allowedFonts = [...DEFAULT_PORTAL_FONT_POLICY.allowedFonts];
	}

	let defaultFont = VALID_FONTS.has(raw.defaultFont as AppFont)
		? (raw.defaultFont as AppFont)
		: DEFAULT_PORTAL_FONT_POLICY.defaultFont;
	if (!allowedFonts.includes(defaultFont)) {
		defaultFont = allowedFonts[0];
	}

	return { allowedFonts, defaultFont };
}

function requireAdmin(perms: UserPermissions) {
	if (!perms.isAdmin) error(403, 'Forbidden');
}

export async function getPortalFontPolicy(): Promise<PortalFontPolicy> {
	try {
		const row = await db.query.portalFontConfig.findFirst({
			where: eq(portalFontConfig.id, PORTAL_FONT_CONFIG_ROW_ID)
		});

		if (!row) return { ...DEFAULT_PORTAL_FONT_POLICY };
		return normalizePolicy(row);
	} catch (err) {
		if (isOptionalFeatureDbError(err)) return { ...DEFAULT_PORTAL_FONT_POLICY };
		throw err;
	}
}

export async function updatePortalFontPolicy(
	perms: UserPermissions,
	input: unknown
): Promise<PortalFontPolicy> {
	requireAdmin(perms);

	const data = portalFontPolicySchema.parse(input);
	const policy = normalizePolicy(data);

	const existing = await db.query.portalFontConfig.findFirst({
		where: eq(portalFontConfig.id, PORTAL_FONT_CONFIG_ROW_ID)
	});

	if (existing) {
		await db
			.update(portalFontConfig)
			.set({
				allowedFonts: policy.allowedFonts,
				defaultFont: policy.defaultFont,
				updatedAt: new Date()
			})
			.where(eq(portalFontConfig.id, PORTAL_FONT_CONFIG_ROW_ID));
	} else {
		await db.insert(portalFontConfig).values({
			id: PORTAL_FONT_CONFIG_ROW_ID,
			allowedFonts: policy.allowedFonts,
			defaultFont: policy.defaultFont
		});
	}

	return policy;
}
