import { query, command } from '$app/server';
import { getRequestEvent } from '$app/server';
import { z } from 'zod';
import * as pharmacyMasterService from '$lib/server/services/pharmacy-master';
import {
	createPharmacyMasterSchema,
	overridePharmacyMastersFromExcelSchema,
	pharmacyMasterIdSchema,
	updatePharmacyMasterSchema
} from '$lib/schemas/pharmacy-master';
import { requirePharmacyAccess } from '$lib/server/auth-guard';

async function perms() {
	return requirePharmacyAccess(getRequestEvent());
}

export const getPharmacyMasters = query(async () =>
	pharmacyMasterService.listPharmacyMasters(await perms())
);

export const getPharmacyMaster = query(pharmacyMasterIdSchema, async (id) =>
	pharmacyMasterService.getPharmacyMaster(await perms(), id)
);

export const createPharmacyMaster = command(createPharmacyMasterSchema, async (data) => {
	const record = await pharmacyMasterService.createPharmacyMaster(await perms(), data);
	void getPharmacyMasters().refresh();
	return record;
});

export const updatePharmacyMaster = command(
	z.object({
		id: pharmacyMasterIdSchema,
		...updatePharmacyMasterSchema.shape
	}),
	async ({ id, ...data }) => {
		const record = await pharmacyMasterService.updatePharmacyMaster(await perms(), id, data);
		void getPharmacyMasters().refresh();
		void getPharmacyMaster(id).refresh();
		return record;
	}
);

export const deletePharmacyMaster = command(pharmacyMasterIdSchema, async (id) => {
	await pharmacyMasterService.deletePharmacyMaster(await perms(), id);
	void getPharmacyMasters().refresh();
});

export const overridePharmacyMastersFromExcel = command(
	overridePharmacyMastersFromExcelSchema,
	async (data) => {
		const result = await pharmacyMasterService.overridePharmacyMastersFromExcel(
			await perms(),
			data
		);
		void getPharmacyMasters().refresh();
		return result;
	}
);
