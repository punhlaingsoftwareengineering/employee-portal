import { listPublicApps } from '$lib/server/services/app';
import { listPublicOnboardingSlides } from '$lib/server/services/onboarding-slide';
import { listPublicServices } from '$lib/server/services/service';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const [publicServices, publicApps, slides] = await Promise.all([
		listPublicServices(),
		listPublicApps(),
		listPublicOnboardingSlides()
	]);

	return { publicServices, publicApps, slides };
};
