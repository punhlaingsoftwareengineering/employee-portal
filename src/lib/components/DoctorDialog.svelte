<script lang="ts">
	import type { Doctor } from '$lib/server/db/schema/doctor';
	import { createDoctor, updateDoctor, getDoctors } from '$lib/remotes/doctor.remote';
	import { withFormFeedback, getErrorMessage } from '$lib/form-feedback.svelte';
	import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';

	let dialog = $state<HTMLDialogElement | null>(null);
	let editing = $state<Doctor | null>(null);
	let hisid = $state('');
	let facilityName = $state('');
	let drnno = $state('');
	let doctorName = $state('');
	let specialization = $state('');
	let active = $state(true);
	let submitting = $state(false);
	let error = $state<string | null>(null);

	const isEdit = $derived(Boolean(editing?.id));

	export function open(existing?: Doctor | null) {
		editing = existing ?? null;
		error = null;
		hisid = existing?.hisid != null ? String(existing.hisid) : '';
		facilityName = existing?.facilityName ?? '';
		drnno = existing?.drnno ?? '';
		doctorName = existing?.doctorName ?? '';
		specialization = existing?.specialization ?? '';
		active = existing?.active ?? true;
		dialog?.showModal();
	}

	function close() {
		dialog?.close();
	}

	function resetForm() {
		editing = null;
		hisid = '';
		facilityName = '';
		drnno = '';
		doctorName = '';
		specialization = '';
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
				successMessage: isEdit ? 'Doctor updated' : 'Doctor created',
				action: async () => {
					const payload = {
						hisid: hisid === '' ? null : Number(hisid),
						facilityName: facilityName.trim() || null,
						drnno: drnno.trim() || null,
						doctorName: doctorName.trim() || null,
						specialization: specialization.trim() || null,
						active
					};

					if (editing?.id) {
						await updateDoctor({ id: editing.id, ...payload });
					} else {
						await createDoctor(payload);
					}

					void getDoctors().refresh();
				}
			});
			close();
		} catch (err) {
			error = getErrorMessage(err, 'Failed to save doctor');
		} finally {
			submitting = false;
		}
	}
</script>

<dialog bind:this={dialog} class="modal" onclose={resetForm}>
	<div class="modal-box modal-box-fit">
		<h3 class="card-title {isEdit ? 'text-secondary' : 'text-primary'} font-bold">
			{isEdit ? 'Edit doctor' : 'Add doctor'}
		</h3>

		<form class="mt-6" onsubmit={handleSubmit}>
			<table class="form-table">
				<tbody>
					{#if isEdit}
						<tr>
							<td class="form-table-label">ID</td>
							<td class="form-table-field">
								<input
									type="text"
									value={editing?.id ?? ''}
									class="input input-bordered w-full max-w-md cursor-not-allowed"
									readonly
								/>
							</td>
						</tr>
					{/if}
					<tr>
						<td class="form-table-label">HIS ID</td>
						<td class="form-table-field">
							<input
								type="number"
								bind:value={hisid}
								class="input input-bordered w-full max-w-md cursor-text"
								placeholder="Optional"
							/>
						</td>
					</tr>
					<tr>
						<td class="form-table-label">Facility name</td>
						<td class="form-table-field">
							<input
								type="text"
								bind:value={facilityName}
								class="input input-bordered w-full max-w-md cursor-text"
								maxlength="255"
								placeholder="Optional"
							/>
						</td>
					</tr>
					<tr>
						<td class="form-table-label">DRN no</td>
						<td class="form-table-field">
							<input
								type="text"
								bind:value={drnno}
								class="input input-bordered w-full max-w-md cursor-text"
								maxlength="255"
								placeholder="Optional"
							/>
						</td>
					</tr>
					<tr>
						<td class="form-table-label">Name</td>
						<td class="form-table-field">
							<input
								type="text"
								bind:value={doctorName}
								class="input input-bordered w-full max-w-md cursor-text"
								maxlength="255"
								placeholder="Optional"
							/>
						</td>
					</tr>
					<tr>
						<td class="form-table-label">Specialization</td>
						<td class="form-table-field">
							<input
								type="text"
								bind:value={specialization}
								class="input input-bordered w-full max-w-md cursor-text"
								maxlength="255"
								placeholder="Optional"
							/>
						</td>
					</tr>
					<tr>
						<td class="form-table-label">Active</td>
						<td class="form-table-field">
							<label class="label cursor-pointer justify-start gap-3">
								<input type="checkbox" class="checkbox cursor-pointer" bind:checked={active} />
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
				<button type="button" class="btn btn-ghost cursor-pointer" onclick={close} disabled={submitting}
					>Cancel</button
				>
				<button type="submit" class="btn btn-primary cursor-pointer" disabled={submitting}>
					{#if submitting}
						<LoadingSpinner size="sm" />
					{:else}
						{isEdit ? 'Save doctor' : 'Create doctor'}
					{/if}
				</button>
			</div>
		</form>
	</div>
	<form method="dialog" class="modal-backdrop">
		<button aria-label="Close dialog" class="cursor-pointer">close</button>
	</form>
</dialog>
