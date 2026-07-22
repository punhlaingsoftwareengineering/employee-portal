import { query, command } from '$app/server';
import { getRequestEvent } from '$app/server';
import { z } from 'zod';
import * as facilityService from '$lib/server/services/facility';
import { createFacilitySchema, updateFacilitySchema } from '$lib/schemas/facility';
import { requireFacilitiesAccess } from '$lib/server/auth-guard';

async function perms() {
	return requireFacilitiesAccess(getRequestEvent());
}

export const getFacilities = query(async () => facilityService.listFacilities(await perms()));

export const getFacility = query(z.string().uuid(), async (id) =>
	facilityService.getFacility(await perms(), id)
);

export const createFacility = command(createFacilitySchema, async (data) => {
	const record = await facilityService.createFacility(await perms(), data);
	void getFacilities().refresh();
	return record;
});

export const updateFacility = command(
	z.object({
		id: z.string().uuid(),
		...updateFacilitySchema.shape
	}),
	async ({ id, ...data }) => {
		const record = await facilityService.updateFacility(await perms(), id, data);
		void getFacilities().refresh();
		void getFacility(id).refresh();
		return record;
	}
);

export const deleteFacility = command(z.string().uuid(), async (id) => {
	await facilityService.deleteFacility(await perms(), id);
	void getFacilities().refresh();
});
