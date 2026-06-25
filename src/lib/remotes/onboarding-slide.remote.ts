import { query, command } from '$app/server';
import { getRequestEvent } from '$app/server';
import { z } from 'zod';
import * as onboardingSlideService from '$lib/server/services/onboarding-slide';
import {
	createOnboardingSlideSchema,
	updateOnboardingSlideSchema
} from '$lib/schemas/onboarding-slide';
import { requireAppAccess } from '$lib/server/auth-guard';

async function perms() {
	return requireAppAccess(getRequestEvent());
}

export const getOnboardingSlides = query(async () =>
	onboardingSlideService.listOnboardingSlides(await perms())
);

export const getOnboardingSlide = query(z.string().uuid(), async (id) =>
	onboardingSlideService.getOnboardingSlide(await perms(), id)
);

export const createOnboardingSlide = command(createOnboardingSlideSchema, async (data) => {
	const record = await onboardingSlideService.createOnboardingSlide(await perms(), data);
	void getOnboardingSlides().refresh();
	return record;
});

export const updateOnboardingSlide = command(
	z.object({
		id: z.string().uuid(),
		...updateOnboardingSlideSchema.shape
	}),
	async ({ id, ...data }) => {
		const record = await onboardingSlideService.updateOnboardingSlide(await perms(), id, data);
		void getOnboardingSlides().refresh();
		void getOnboardingSlide(id).refresh();
		return record;
	}
);

export const deleteOnboardingSlide = command(z.string().uuid(), async (id) => {
	await onboardingSlideService.deleteOnboardingSlide(await perms(), id);
	void getOnboardingSlides().refresh();
});
