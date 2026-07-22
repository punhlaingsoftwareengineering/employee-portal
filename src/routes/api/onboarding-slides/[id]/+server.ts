import { json, type RequestHandler } from '@sveltejs/kit';
import { requireSettingsAccess } from '$lib/server/auth-guard';
import * as onboardingSlideService from '$lib/server/services/onboarding-slide';
import { updateOnboardingSlideSchema } from '$lib/schemas/onboarding-slide';

export const GET: RequestHandler = async (event) => {
	const perms = await requireSettingsAccess(event);
	const record = await onboardingSlideService.getOnboardingSlide(perms, event.params.id!);
	return json(record);
};

export const PATCH: RequestHandler = async (event) => {
	const perms = await requireSettingsAccess(event);
	const body = await event.request.json();
	const data = updateOnboardingSlideSchema.parse(body);
	const record = await onboardingSlideService.updateOnboardingSlide(
		perms,
		event.params.id!,
		data
	);
	return json(record);
};

export const DELETE: RequestHandler = async (event) => {
	const perms = await requireSettingsAccess(event);
	await onboardingSlideService.deleteOnboardingSlide(perms, event.params.id!);
	return new Response(null, { status: 204 });
};
