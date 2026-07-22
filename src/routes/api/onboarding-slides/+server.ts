import { json, type RequestHandler } from '@sveltejs/kit';
import { requireSettingsAccess } from '$lib/server/auth-guard';
import * as onboardingSlideService from '$lib/server/services/onboarding-slide';
import { createOnboardingSlideSchema } from '$lib/schemas/onboarding-slide';

export const GET: RequestHandler = async (event) => {
	const perms = await requireSettingsAccess(event);
	const slides = await onboardingSlideService.listOnboardingSlides(perms);
	return json(slides);
};

export const POST: RequestHandler = async (event) => {
	const perms = await requireSettingsAccess(event);
	const body = await event.request.json();
	const data = createOnboardingSlideSchema.parse(body);
	const record = await onboardingSlideService.createOnboardingSlide(perms, data);
	return json(record, { status: 201 });
};
