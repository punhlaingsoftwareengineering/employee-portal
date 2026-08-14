import { listPublicApps } from '$lib/server/services/app';
import { getOnboardingCarouselConfig } from '$lib/server/services/onboarding-carousel-config';
import { listOnboardingFacilities } from '$lib/server/services/facility';
import {
	countNewsletters,
	listPublicNewsletters
} from '$lib/server/services/newsletter';
import { listPublicOnboardingSlides } from '$lib/server/services/onboarding-slide';
import { listPublicPharmacyMasters } from '$lib/server/services/pharmacy-master';
import { listPublicServices } from '$lib/server/services/service';
import { ONBOARDING_NEWSLETTER_DISPLAY_LIMIT } from '$lib/constants/onboarding';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const [
		publicServices,
		publicApps,
		slides,
		facilities,
		carouselConfig,
		newsletters,
		newsletterTotal,
		pharmacyMasters
	] = await Promise.all([
		listPublicServices(),
		listPublicApps(),
		listPublicOnboardingSlides(),
		listOnboardingFacilities(),
		getOnboardingCarouselConfig(),
		listPublicNewsletters(ONBOARDING_NEWSLETTER_DISPLAY_LIMIT),
		countNewsletters(),
		listPublicPharmacyMasters()
	]);

	return {
		publicServices,
		publicApps,
		slides,
		facilities,
		carouselIntervalMs: carouselConfig.intervalMs,
		newsletters,
		newsletterTotal,
		pharmacyMasters
	};
};
