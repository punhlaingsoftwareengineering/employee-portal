import { command, query } from '$app/server';
import { getRequestEvent } from '$app/server';
import { z } from 'zod';
import { RATING_SERVICE_ID } from '$lib/constants/builtin-services';
import { saveDepartmentRatingSchema } from '$lib/schemas/rating';
import { requireServiceAccess } from '$lib/server/auth-guard';
import * as ratingService from '$lib/server/services/rating';

async function perms() {
	return requireServiceAccess(getRequestEvent(), RATING_SERVICE_ID);
}

export const getRatingDepartments = query(async () =>
	ratingService.listRatingDepartments(await perms())
);

export const getMyDepartmentRating = query(z.string().uuid(), async (departmentId) =>
	ratingService.getMyDepartmentRating(await perms(), departmentId)
);

export const saveDepartmentRating = command(saveDepartmentRatingSchema, async (data) => {
	const result = await ratingService.saveDepartmentRating(await perms(), data);
	void getMyDepartmentRating(data.departmentId).refresh();
	return result;
});
