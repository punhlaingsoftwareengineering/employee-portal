import { eq } from 'drizzle-orm';
import { error } from '@sveltejs/kit';
import {
	DEFAULT_ONBOARDING_CAROUSEL_INTERVAL_MS,
	MAX_ONBOARDING_CAROUSEL_INTERVAL_MS,
	MIN_ONBOARDING_CAROUSEL_INTERVAL_MS
} from '$lib/constants/onboarding-carousel';
import { onboardingCarouselConfigSchema } from '$lib/schemas/onboarding-carousel-config';
import type { OnboardingCarouselConfigView } from '$lib/schemas/onboarding-carousel-config';
import { isOptionalFeatureDbError } from '$lib/server/db/errors';
import { db } from '$lib/server/db';
import {
	ONBOARDING_CAROUSEL_CONFIG_ROW_ID,
	onboardingCarouselConfig
} from '$lib/server/db/schema/onboarding-carousel-config';
import type { UserPermissions } from '$lib/server/permissions';

function clampIntervalMs(value: number): number {
	return Math.min(
		MAX_ONBOARDING_CAROUSEL_INTERVAL_MS,
		Math.max(MIN_ONBOARDING_CAROUSEL_INTERVAL_MS, Math.round(value))
	);
}

function requireAdmin(perms: UserPermissions) {
	if (!perms.isAdmin) error(403, 'Forbidden');
}

export async function getOnboardingCarouselConfig(): Promise<OnboardingCarouselConfigView> {
	try {
		const row = await db.query.onboardingCarouselConfig.findFirst({
			where: eq(onboardingCarouselConfig.id, ONBOARDING_CAROUSEL_CONFIG_ROW_ID)
		});

		if (!row) {
			return { intervalMs: DEFAULT_ONBOARDING_CAROUSEL_INTERVAL_MS };
		}
		return { intervalMs: clampIntervalMs(row.intervalMs) };
	} catch (err) {
		if (isOptionalFeatureDbError(err)) {
			return { intervalMs: DEFAULT_ONBOARDING_CAROUSEL_INTERVAL_MS };
		}
		throw err;
	}
}

export async function updateOnboardingCarouselConfig(
	perms: UserPermissions,
	input: unknown
): Promise<OnboardingCarouselConfigView> {
	requireAdmin(perms);

	const data = onboardingCarouselConfigSchema.parse(input);
	const intervalMs = clampIntervalMs(data.intervalMs);

	const existing = await db.query.onboardingCarouselConfig.findFirst({
		where: eq(onboardingCarouselConfig.id, ONBOARDING_CAROUSEL_CONFIG_ROW_ID)
	});

	if (existing) {
		await db
			.update(onboardingCarouselConfig)
			.set({ intervalMs, updatedAt: new Date() })
			.where(eq(onboardingCarouselConfig.id, ONBOARDING_CAROUSEL_CONFIG_ROW_ID));
	} else {
		await db.insert(onboardingCarouselConfig).values({
			id: ONBOARDING_CAROUSEL_CONFIG_ROW_ID,
			intervalMs
		});
	}

	return { intervalMs };
}
