import { command, query } from '$app/server';
import { getRequestEvent } from '$app/server';
import { onboardingCarouselConfigSchema } from '$lib/schemas/onboarding-carousel-config';
import * as onboardingCarouselConfigService from '$lib/server/services/onboarding-carousel-config';
import { requireSettingsAccess } from '$lib/server/auth-guard';

async function perms() {
	return requireSettingsAccess(getRequestEvent());
}

export const getOnboardingCarouselConfig = query(async () =>
	onboardingCarouselConfigService.getOnboardingCarouselConfig()
);

export const updateOnboardingCarouselConfig = command(
	onboardingCarouselConfigSchema,
	async (data) => {
		const config = await onboardingCarouselConfigService.updateOnboardingCarouselConfig(
			await perms(),
			data
		);
		void getOnboardingCarouselConfig().refresh();
		return config;
	}
);
