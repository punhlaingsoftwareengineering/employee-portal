<script lang="ts">
	import type { Facility } from '$lib/server/db/schema/facility';
	import {
		createFacility,
		updateFacility,
		getFacilities
	} from '$lib/remotes/facility.remote';
	import { withFormFeedback } from '$lib/form-feedback.svelte';
	import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
	import DriveMediaUrlField from '$lib/components/drive/DriveMediaUrlField.svelte';

	let dialog = $state<HTMLDialogElement | null>(null);
	let editingFacility = $state<Facility | null>(null);
	let name = $state('');
	let description = $state('');
	let address = $state('');
	let imageUrl = $state('');
	let phone = $state('');
	let submitting = $state(false);
	let error = $state<string | null>(null);

	const isEdit = $derived(Boolean(editingFacility?.id));

	export function open(existing?: Facility | null) {
		editingFacility = existing ?? null;
		error = null;
		name = existing?.name ?? '';
		description = existing?.description ?? '';
		address = existing?.address ?? '';
		imageUrl = existing?.imageUrl ?? '';
		phone = existing?.phone ?? '';
		dialog?.showModal();
	}

	function close() {
		dialog?.close();
		editingFacility = null;
		error = null;
		submitting = false;
	}

	function resetForm() {
		editingFacility = null;
		name = '';
		description = '';
		address = '';
		imageUrl = '';
		phone = '';
		error = null;
		submitting = false;
	}

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		submitting = true;
		error = null;

		try {
			const trimmedName = name.trim();
			if (!trimmedName) {
				error = 'Name is required';
				return;
			}

			await withFormFeedback({
				successMessage: isEdit ? 'Facility updated' : 'Facility created',
				action: async () => {
					const payload = {
						name: trimmedName,
						description: description.trim() || undefined,
						address: address.trim() || undefined,
						imageUrl: imageUrl.trim() || null,
						phone: phone.trim() || undefined
					};

					if (editingFacility?.id) {
						await updateFacility({ id: editingFacility.id, ...payload });
					} else {
						await createFacility(payload);
					}

					void getFacilities().refresh();
				}
			});
			close();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to save facility';
		} finally {
			submitting = false;
		}
	}
</script>

<dialog bind:this={dialog} class="modal" onclose={resetForm}>
	<div class="modal-box modal-box-fit">
		<h3 class="text-lg font-bold">{isEdit ? 'Edit facility' : 'New facility'}</h3>

		<form class="mt-6" onsubmit={handleSubmit}>
			<table class="form-table">
				<tbody>
					<tr>
						<td class="form-table-label">Name</td>
						<td class="form-table-field">
							<input
								type="text"
								bind:value={name}
								class="input input-bordered w-full max-w-md"
								required
								maxlength="100"
							/>
						</td>
					</tr>
					<tr>
						<td class="form-table-label">Description</td>
						<td class="form-table-field">
							<textarea
								bind:value={description}
								class="textarea textarea-bordered w-full max-w-md"
								rows="2"
								maxlength="500"
							></textarea>
						</td>
					</tr>
					<tr>
						<td class="form-table-label">Address</td>
						<td class="form-table-field">
							<input
								type="text"
								bind:value={address}
								class="input input-bordered w-full max-w-md"
								maxlength="300"
							/>
						</td>
					</tr>
					<tr>
						<td class="form-table-label">Image URL</td>
						<td class="form-table-field">
							<DriveMediaUrlField
								bind:value={imageUrl}
								category="facilities"
								accept="image/*"
								placeholder="https://example.com/facility.jpg"
								disabled={submitting}
							/>
						</td>
					</tr>
					<tr>
						<td class="form-table-label">Phone</td>
						<td class="form-table-field">
							<input
								type="tel"
								bind:value={phone}
								class="input input-bordered w-full max-w-md"
								placeholder="+1 555 0100"
								maxlength="30"
							/>
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
				<button type="button" class="btn btn-ghost" onclick={close} disabled={submitting}>
					Cancel
				</button>
				<button type="submit" class="btn btn-primary gap-2" disabled={submitting}>
					{#if submitting}
						<LoadingSpinner size="sm" />
					{:else}
						{isEdit ? 'Save facility' : 'Create facility'}
					{/if}
				</button>
			</div>
		</form>
	</div>
	<form method="dialog" class="modal-backdrop">
		<button aria-label="Close dialog">close</button>
	</form>
</dialog>
