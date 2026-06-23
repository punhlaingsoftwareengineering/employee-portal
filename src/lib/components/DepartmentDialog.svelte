<script lang="ts">
	import type { Department } from '$lib/server/db/schema/department';
	import {
		createDepartment,
		updateDepartment,
		getDepartments
	} from '$lib/remotes/department.remote';
	import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';

	let dialog = $state<HTMLDialogElement | null>(null);
	let editingDepartment = $state<Department | null>(null);
	let name = $state('');
	let submitting = $state(false);
	let error = $state<string | null>(null);

	const isEdit = $derived(Boolean(editingDepartment?.id));

	export function open(existing?: Department | null) {
		editingDepartment = existing ?? null;
		error = null;
		name = existing?.name ?? '';
		dialog?.showModal();
	}

	function close() {
		dialog?.close();
		editingDepartment = null;
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

			if (editingDepartment?.id) {
				await updateDepartment({ id: editingDepartment.id, name: trimmedName });
			} else {
				await createDepartment({ name: trimmedName });
			}

			void getDepartments().refresh();
			close();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to save department';
		} finally {
			submitting = false;
		}
	}
</script>

<dialog bind:this={dialog} class="modal">
	<div class="modal-box max-w-lg">
		<h3 class="text-lg font-bold">{isEdit ? 'Edit department' : 'New department'}</h3>

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
						{isEdit ? 'Save department' : 'Create department'}
					{/if}
				</button>
			</div>
		</form>
	</div>
	<form method="dialog" class="modal-backdrop">
		<button aria-label="Close dialog">close</button>
	</form>
</dialog>
