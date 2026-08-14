import { eq } from 'drizzle-orm';
import { error } from '@sveltejs/kit';
import {
	APP_FONT_SIZE_VALUES,
	DEFAULT_PORTAL_FONT_SIZE_POLICY,
	type AppFontSize,
	type PortalFontSizePolicy
} from '$lib/constants/app-settings';
import { portalFontSizePolicySchema } from '$lib/schemas/portal-font-size-config';
import { isOptionalFeatureDbError } from '$lib/server/db/errors';
import { db } from '$lib/server/db';
import {
	PORTAL_FONT_SIZE_CONFIG_ROW_ID,
	portalFontSizeConfig
} from '$lib/server/db/schema/portal-font-size-config';
import { canSettingsThemeUpdate, type UserPermissions } from '$lib/server/permissions';

const VALID_SIZES = new Set<AppFontSize>(APP_FONT_SIZE_VALUES);

function normalizePolicy(raw: {
	allowedFontSizes: string[];
	defaultFontSize: string;
}): PortalFontSizePolicy {
	let allowedFontSizes = raw.allowedFontSizes.filter((size): size is AppFontSize =>
		VALID_SIZES.has(size as AppFontSize)
	);
	if (allowedFontSizes.length === 0) {
		allowedFontSizes = [...DEFAULT_PORTAL_FONT_SIZE_POLICY.allowedFontSizes];
	}

	let defaultFontSize = VALID_SIZES.has(raw.defaultFontSize as AppFontSize)
		? (raw.defaultFontSize as AppFontSize)
		: DEFAULT_PORTAL_FONT_SIZE_POLICY.defaultFontSize;
	if (!allowedFontSizes.includes(defaultFontSize)) {
		defaultFontSize = allowedFontSizes[0];
	}

	return { allowedFontSizes, defaultFontSize };
}

function assertCanUpdate(perms: UserPermissions) {
	if (!canSettingsThemeUpdate(perms)) error(403, 'Forbidden');
}

export async function getPortalFontSizePolicy(): Promise<PortalFontSizePolicy> {
	try {
		const row = await db.query.portalFontSizeConfig.findFirst({
			where: eq(portalFontSizeConfig.id, PORTAL_FONT_SIZE_CONFIG_ROW_ID)
		});

		if (!row) return { ...DEFAULT_PORTAL_FONT_SIZE_POLICY };
		return normalizePolicy(row);
	} catch (err) {
		if (isOptionalFeatureDbError(err)) return { ...DEFAULT_PORTAL_FONT_SIZE_POLICY };
		throw err;
	}
}

export async function updatePortalFontSizePolicy(
	perms: UserPermissions,
	input: unknown
): Promise<PortalFontSizePolicy> {
	assertCanUpdate(perms);

	const data = portalFontSizePolicySchema.parse(input);
	const policy = normalizePolicy(data);

	const existing = await db.query.portalFontSizeConfig.findFirst({
		where: eq(portalFontSizeConfig.id, PORTAL_FONT_SIZE_CONFIG_ROW_ID)
	});

	if (existing) {
		await db
			.update(portalFontSizeConfig)
			.set({
				allowedFontSizes: policy.allowedFontSizes,
				defaultFontSize: policy.defaultFontSize,
				updatedAt: new Date()
			})
			.where(eq(portalFontSizeConfig.id, PORTAL_FONT_SIZE_CONFIG_ROW_ID));
	} else {
		await db.insert(portalFontSizeConfig).values({
			id: PORTAL_FONT_SIZE_CONFIG_ROW_ID,
			allowedFontSizes: policy.allowedFontSizes,
			defaultFontSize: policy.defaultFontSize
		});
	}

	return policy;
}
