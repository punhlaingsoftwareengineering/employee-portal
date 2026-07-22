<script lang="ts">
	import type { Employee } from '$lib/server/db/schema/employee';
	import { ONBOARDING_FACILITY_TABS } from '$lib/constants/onboarding';
	import {
		createEmployee,
		updateEmployee,
		getEmployees
	} from '$lib/remotes/employee.remote';
	import { withFormFeedback } from '$lib/form-feedback.svelte';
	import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';

	let dialog = $state<HTMLDialogElement | null>(null);
	let editing = $state<Employee | null>(null);
	let id = $state('');
	let employeeNo = $state('');
	let employeeName = $state('');
	let position = $state('');
	let department = $state('');
	let joinDate = $state('');
	let facility = $state('');
	let userId = $state('');
	let active = $state(true);
	let submitting = $state(false);
	let error = $state<string | null>(null);

	const isEdit = $derived(Boolean(editing?.id));

	export function open(existing?: Employee | null) {
		editing = existing ?? null;
		error = null;
		id = existing?.id ?? '';
		employeeNo = existing?.employeeNo ?? '';
		employeeName = existing?.employeeName ?? '';
		position = existing?.position ?? '';
		department = existing?.department ?? '';
		joinDate = existing?.joinDate ?? '';
		facility = existing?.facility ?? '';
		userId = existing?.userId ?? '';
		active = existing?.active ?? true;
		dialog?.showModal();
	}

	function close() {
		dialog?.close();
	}

	function resetForm() {
		editing = null;
		id = '';
		employeeNo = '';
		employeeName = '';
		position = '';
		department = '';
		joinDate = '';
		facility = '';
		userId = '';
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
				successMessage: isEdit ? 'Employee updated' : 'Employee created',
				action: async () => {
					const payload = {
						employeeNo: employeeNo.trim() || null,
						employeeName: employeeName.trim() || null,
						position: position.trim() || null,
						department: department.trim() || null,
						joinDate: joinDate || null,
						facility: facility || null,
						userId: userId.trim() || null,
						active
					};

					if (editing?.id) {
						await updateEmployee({ id: editing.id, ...payload });
					} else {
						await createEmployee({ id: id.trim(), ...payload });
					}

					void getEmployees().refresh();
				}
			});
			close();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to save employee';
		} finally {
			submitting = false;
		}
	}
</script>

<dialog bind:this={dialog} class="modal" onclose={resetForm}>
	<div class="modal-box modal-box-fit max-w-2xl">
		<h3 class="text-lg font-bold">{isEdit ? 'Edit employee' : 'New employee'}</h3>

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
								placeholder="Employee id"
							/>
						</td>
					</tr>
					<tr>
						<td class="form-table-label">Employee no</td>
						<td class="form-table-field">
							<input
								type="text"
								bind:value={employeeNo}
								class="input input-bordered w-full max-w-md"
								maxlength="50"
							/>
						</td>
					</tr>
					<tr>
						<td class="form-table-label">Name</td>
						<td class="form-table-field">
							<input
								type="text"
								bind:value={employeeName}
								class="input input-bordered w-full max-w-md"
								maxlength="200"
							/>
						</td>
					</tr>
					<tr>
						<td class="form-table-label">Position</td>
						<td class="form-table-field">
							<input
								type="text"
								bind:value={position}
								class="input input-bordered w-full max-w-md"
								maxlength="200"
							/>
						</td>
					</tr>
					<tr>
						<td class="form-table-label">Department</td>
						<td class="form-table-field">
							<input
								type="text"
								bind:value={department}
								class="input input-bordered w-full max-w-md"
								maxlength="200"
							/>
						</td>
					</tr>
					<tr>
						<td class="form-table-label">Join date</td>
						<td class="form-table-field">
							<input
								type="date"
								bind:value={joinDate}
								class="input input-bordered w-full max-w-md"
							/>
						</td>
					</tr>
					<tr>
						<td class="form-table-label">Facility</td>
						<td class="form-table-field">
							<select class="select select-bordered w-full max-w-md" bind:value={facility}>
								<option value="">—</option>
								{#each ONBOARDING_FACILITY_TABS as item (item.id)}
									<option value={item.id}>{item.name} ({item.id})</option>
								{/each}
							</select>
						</td>
					</tr>
					<tr>
						<td class="form-table-label">User ID</td>
						<td class="form-table-field">
							<input
								type="text"
								bind:value={userId}
								class="input input-bordered w-full max-w-md"
								maxlength="100"
								placeholder="Optional"
							/>
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
						{isEdit ? 'Save employee' : 'Create employee'}
					{/if}
				</button>
			</div>
		</form>
	</div>
	<form method="dialog" class="modal-backdrop">
		<button aria-label="Close dialog">close</button>
	</form>
</dialog>
