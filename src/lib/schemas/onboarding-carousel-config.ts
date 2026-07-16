import { z } from 'zod';
import {
	DEFAULT_ONBOARDING_CAROUSEL_INTERVAL_MS,
	MAX_ONBOARDING_CAROUSEL_INTERVAL_MS,
	MIN_ONBOARDING_CAROUSEL_INTERVAL_MS
} from '$lib/constants/onboarding-carousel';

export const onboardingCarouselConfigSchema = z.object({
	intervalMs: z
		.number()
		.int()
		.min(MIN_ONBOARDING_CAROUSEL_INTERVAL_MS)
		.max(MAX_ONBOARDING_CAROUSEL_INTERVAL_MS)
		.default(DEFAULT_ONBOARDING_CAROUSEL_INTERVAL_MS)
});

export type OnboardingCarouselConfigInput = z.infer<typeof onboardingCarouselConfigSchema>;
export type OnboardingCarouselConfigView = { intervalMs: number };
