<script lang="ts">
	import type { PharmacyMaster } from '$lib/server/db/schema/pharmacy-master';
	import { ONBOARDING_FACILITY_TABS } from '$lib/constants/onboarding';
	import {
		createPharmacyMaster,
		updatePharmacyMaster,
		getPharmacyMasters
	} from '$lib/remotes/pharmacy-master.remote';
	import { withFormFeedback } from '$lib/form-feedback.svelte';
	import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';

	let dialog = $state<HTMLDialogElement | null>(null);
	let editing = $state<PharmacyMaster | null>(null);
	let id = $state('');
	let itemClass = $state('');
	let subClass = $state('');
	let itemName = $state('');
	let genericName = $state('');
	let strengthValue = $state('');
	let issueUnit = $state('');
	let facilityId = $state('');
	let active = $state(true);
	let submitting = $state(false);
	let error = $state<string | null>(null);

	const isEdit = $derived(Boolean(editing?.id));

	export function open(existing?: PharmacyMaster | null) {
		editing = existing ?? null;
		error = null;
		id = existing?.id ?? '';
		itemClass = existing?.itemClass ?? '';
		subClass = existing?.subClass ?? '';
		itemName = existing?.itemName ?? '';
		genericName = existing?.genericName ?? '';
		strengthValue = existing?.strengthValue ?? '';
		issueUnit = existing?.issueUnit ?? '';
		facilityId = existing?.facilityId ?? '';
		active = existing?.active ?? true;
		dialog?.showModal();
	}

	function close() {
		dialog?.close();
	}

	function resetForm() {
		editing = null;
		id = '';
		itemClass = '';
		subClass = '';
		itemName = '';
		genericName = '';
		strengthValue = '';
		issueUnit = '';
		facilityId = '';
		active = true;
		error = null;
		submitting = false;
	}

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		submitting = true;
		error = null;

		try {
			await withFormFeedback({
				successMessage: isEdit ? 'Pharmacy item updated' : 'Pharmacy item created',
				action: async () => {
					const payload = {
						itemClass: itemClass.trim() || null,
						subClass: subClass.trim() || null,
						itemName: itemName.trim() || null,
						genericName: genericName.trim() || null,
						strengthValue: strengthValue.trim() || null,
						issueUnit: issueUnit.trim() || null,
						facilityId: facilityId || null,
						active
					};

					if (editing?.id) {
						await updatePharmacyMaster({ id: editing.id, ...payload });
					} else {
						await createPharmacyMaster({ id: id.trim(), ...payload });
					}

					void getPharmacyMasters().refresh();
				}
			});
			close();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to save pharmacy item';
		} finally {
			submitting = false;
		}
	}
</script>

<dialog bind:this={dialog} class="modal" onclose={resetForm}>
	<div class="modal-box modal-box-fit max-w-2xl">
		<h3 class="text-lg font-bold">{isEdit ? 'Edit pharmacy item' : 'New pharmacy item'}</h3>

		<form class="mt-6" onsubmit={handleSubmit}>
			<table class="form-table">
				<tbody>
					<tr>
						<td class="form-table-label">ID</td>
						<td class="form-table-field">
							<input
								type="text"
								bind:value={id}
								class="input input-bordered w-full max-w-md"
								maxlength="100"
								required
								readonly={isEdit}
								placeholder="Pharmacy item id"
							/>
						</td>
					</tr>
					<tr>
						<td class="form-table-label">Class</td>
						<td class="form-table-field">
							<input
								type="text"
								bind:value={itemClass}
								class="input input-bordered w-full max-w-md"
								maxlength="100"
							/>
						</td>
					</tr>
					<tr>
						<td class="form-table-label">Sub class</td>
						<td class="form-table-field">
							<input
								type="text"
								bind:value={subClass}
								class="input input-bordered w-full max-w-md"
								maxlength="100"
							/>
						</td>
					</tr>
					<tr>
						<td class="form-table-label">Item name</td>
						<td class="form-table-field">
							<input
								type="text"
								bind:value={itemName}
								class="input input-bordered w-full max-w-md"
								maxlength="200"
							/>
						</td>
					</tr>
					<tr>
						<td class="form-table-label">Generic name</td>
						<td class="form-table-field">
							<input
								type="text"
								bind:value={genericName}
								class="input input-bordered w-full max-w-md"
								maxlength="200"
							/>
						</td>
					</tr>
					<tr>
						<td class="form-table-label">Strength</td>
						<td class="form-table-field">
							<input
								type="text"
								bind:value={strengthValue}
								class="input input-bordered w-full max-w-md"
								maxlength="100"
							/>
						</td>
					</tr>
					<tr>
						<td class="form-table-label">Issue unit</td>
						<td class="form-table-field">
							<input
								type="text"
								bind:value={issueUnit}
								class="input input-bordered w-full max-w-md"
								maxlength="50"
							/>
						</td>
					</tr>
					<tr>
						<td class="form-table-label">Facility</td>
						<td class="form-table-field">
							<select class="select select-bordered w-full max-w-md" bind:value={facilityId}>
								<option value="">—</option>
								{#each ONBOARDING_FACILITY_TABS as item (item.id)}
									<option value={item.id}>{item.name} ({item.id})</option>
								{/each}
							</select>
						</td>
					</tr>
					<tr>
						<td class="form-table-label">Active</td>
						<td class="form-table-field">
							<label class="label cursor-pointer justify-start gap-3">
								<input type="checkbox" class="checkbox" bind:checked={active} />
								<span class="label-text">Active</span>
							</label>
						</td>
					</tr>
				</tbody>
			</table>

			{#if error}
				<div class="alert alert-error mt-4">
					<span>{error}</span>
				</div>
			{/if}

			<div class="modal-action">
				<button type="button" class="btn btn-ghost" onclick={close} disabled={submitting}
					>Cancel</button
				>
				<button type="submit" class="btn btn-primary" disabled={submitting}>
					{#if submitting}
						<LoadingSpinner size="sm" />
					{:else}
						{isEdit ? 'Save item' : 'Create item'}
					{/if}
				</button>
			</div>
		</form>
	</div>
	<form method="dialog" class="modal-backdrop">
		<button aria-label="Close dialog">close</button>
	</form>
</dialog>
