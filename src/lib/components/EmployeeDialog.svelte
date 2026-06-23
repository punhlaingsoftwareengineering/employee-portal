<script lang="ts">
	import { createEmployee, getEmployees } from '$lib/remotes/employee.remote';
	import { getDepartments } from '$lib/remotes/department.remote';
	import { getFacilities } from '$lib/remotes/facility.remote';
	import { getAssignmentRoles } from '$lib/remotes/access-role.remote';
	import { EMPLOYEE_STATUSES } from '$lib/constants/employee-status';
	import type { EmployeeStatus } from '$lib/constants/employee-status';
	import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';

	let dialog = $state<HTMLDialogElement | null>(null);
	let firstName = $state('');
	let lastName = $state('');
	let email = $state('');
	let departmentId = $state('');
	let roleId = $state('');
	let facilityId = $state('');
	let status = $state<EmployeeStatus>('active');
	let submitting = $state(false);
	let error = $state<string | null>(null);

	export function open() {
		error = null;
		dialog?.showModal();
	}

	function close() {
		dialog?.close();
		resetForm();
	}

	function resetForm() {
		firstName = '';
		lastName = '';
		email = '';
		departmentId = '';
		roleId = '';
		facilityId = '';
		status = 'active';
		error = null;
		submitting = false;
	}

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		submitting = true;
		error = null;

		try {
			await createEmployee({
				firstName: firstName.trim(),
				lastName: lastName.trim(),
				email: email.trim(),
				departmentId,
				roleId,
				facilityId,
				status
			});
			void getEmployees().refresh();
			close();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to create employee';
		} finally {
			submitting = false;
		}
	}
</script>

<svelte:boundary>
	{@const [departments, roles, facilities] = await Promise.all([
		getDepartments(),
		getAssignmentRoles(),
		getFacilities()
	])}

	<dialog bind:this={dialog} class="modal" onclose={resetForm}>
		<div class="modal-box max-w-2xl">
			<h3 class="text-lg font-bold">New employee</h3>

			<form class="mt-6" onsubmit={handleSubmit}>
				<table class="form-table">
					<tbody>
						<tr>
							<td class="form-table-label">First name</td>
							<td class="form-table-field">
								<input
									type="text"
									bind:value={firstName}
									class="input input-bordered w-full max-w-md"
									required
									maxlength="100"
								/>
							</td>
						</tr>
						<tr>
							<td class="form-table-label">Last name</td>
							<td class="form-table-field">
								<input
									type="text"
									bind:value={lastName}
									class="input input-bordered w-full max-w-md"
									required
									maxlength="100"
								/>
							</td>
						</tr>
						<tr>
							<td class="form-table-label">Email</td>
							<td class="form-table-field">
								<input
									type="email"
									bind:value={email}
									class="input input-bordered w-full max-w-md"
									required
								/>
							</td>
						</tr>
						<tr>
							<td class="form-table-label">Role</td>
							<td class="form-table-field">
								<select
									bind:value={roleId}
									class="select select-bordered w-full max-w-md"
									required
								>
									<option value="">Select role</option>
									{#each roles as role (role.id)}
										<option value={role.id}>{role.name}</option>
									{/each}
								</select>
							</td>
						</tr>
						<tr>
							<td class="form-table-label">Department</td>
							<td class="form-table-field">
								<select
									bind:value={departmentId}
									class="select select-bordered w-full max-w-md"
									required
								>
									<option value="">Select department</option>
									{#each departments as dept (dept.id)}
										<option value={dept.id}>{dept.name}</option>
									{/each}
								</select>
							</td>
						</tr>
						<tr>
							<td class="form-table-label">Facility</td>
							<td class="form-table-field">
								<select
									bind:value={facilityId}
									class="select select-bordered w-full max-w-md"
									required
								>
									<option value="">Select facility</option>
									{#each facilities as item (item.id)}
										<option value={item.id}>{item.name}</option>
									{/each}
								</select>
							</td>
						</tr>
						<tr>
							<td class="form-table-label">Status</td>
							<td class="form-table-field">
								<select bind:value={status} class="select select-bordered w-full max-w-md">
									{#each EMPLOYEE_STATUSES as employeeStatus (employeeStatus)}
										<option value={employeeStatus}
											>{employeeStatus.replace('_', ' ')}</option
										>
									{/each}
								</select>
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
							Create employee
						{/if}
					</button>
				</div>
			</form>
		</div>
		<form method="dialog" class="modal-backdrop">
			<button aria-label="Close dialog">close</button>
		</form>
	</dialog>

	{#snippet pending()}
		<dialog class="modal modal-open">
			<div class="modal-box flex justify-center py-12">
				<LoadingSpinner size="lg" />
			</div>
		</dialog>
	{/snippet}

	{#snippet failed(loadError)}
		<dialog class="modal modal-open">
			<div class="modal-box">
				<div class="alert alert-error">
					<span>{loadError instanceof Error ? loadError.message : 'Failed to load form'}</span>
				</div>
				<div class="modal-action">
					<button type="button" class="btn" onclick={close}>Close</button>
				</div>
			</div>
		</dialog>
	{/snippet}
</svelte:boundary>
