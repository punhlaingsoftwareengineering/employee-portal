import { listPublicApps } from '$lib/server/services/app';
import { listOnboardingFacilities } from '$lib/server/services/facility';
import { listPublicOnboardingSlides } from '$lib/server/services/onboarding-slide';
import { listPublicServices } from '$lib/server/services/service';
import { ONBOARDING_FACILITY_DISPLAY_LIMIT } from '$lib/constants/onboarding';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const [publicServices, publicApps, slides, facilities] = await Promise.all([
		listPublicServices(),
		listPublicApps(),
		listPublicOnboardingSlides(),
		listOnboardingFacilities(ONBOARDING_FACILITY_DISPLAY_LIMIT)
	]);

	return { publicServices, publicApps, slides, facilities };
};
