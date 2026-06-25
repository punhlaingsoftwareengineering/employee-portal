<script lang="ts">
	import { page } from '$app/state';
	import { getDepartments } from '$lib/remotes/department.remote';
	import { getFacilities } from '$lib/remotes/facility.remote';
	import { getAssignmentRoles } from '$lib/remotes/access-role.remote';
	import { getEmployee, updateEmployee } from '$lib/remotes/employee.remote';
	import { EMPLOYEE_STATUSES } from '$lib/constants/employee-status';
	import LoadingCenter from '$lib/components/LoadingCenter.svelte';
	import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
	import PrivatePageHeader from '$lib/components/PrivatePageHeader.svelte';

	const id = $derived(page.params.id!);
</script>

<svelte:boundary>
	{@const [employee, departments, roles, facilities] = await Promise.all([
		getEmployee(id),
		getDepartments(),
		getAssignmentRoles(),
		getFacilities()
	])}

	<PrivatePageHeader title="Edit employee" />

	<div class="card bg-base-100 shadow-sm max-w-2xl">
		<div class="card-body">
			<form {...updateEmployee}>
				<input {...updateEmployee.fields.id.as('hidden', employee.id)} />

				<table class="form-table">
					<tbody>
						<tr>
							<td class="form-table-label">First name</td>
							<td class="form-table-field">
								<input
									{...updateEmployee.fields.firstName.as('text', employee.firstName)}
									class="input input-bordered w-full max-w-md"
								/>
							</td>
						</tr>
						<tr>
							<td class="form-table-label">Last name</td>
							<td class="form-table-field">
								<input
									{...updateEmployee.fields.lastName.as('text', employee.lastName)}
									class="input input-bordered w-full max-w-md"
								/>
							</td>
						</tr>
						<tr>
							<td class="form-table-label">Email</td>
							<td class="form-table-field">
								<input
									{...updateEmployee.fields.email.as('email', employee.email)}
									class="input input-bordered w-full max-w-md"
								/>
							</td>
						</tr>
						<tr>
							<td class="form-table-label">Role</td>
							<td class="form-table-field">
								<select
									{...updateEmployee.fields.roleId.as('text', employee.roleId)}
									class="select select-bordered w-full max-w-md"
								>
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
									{...updateEmployee.fields.departmentId.as('text', employee.departmentId)}
									class="select select-bordered w-full max-w-md"
								>
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
									{...updateEmployee.fields.facilityId.as('text', employee.facilityId)}
									class="select select-bordered w-full max-w-md"
								>
									{#each facilities as item (item.id)}
										<option value={item.id}>{item.name}</option>
									{/each}
								</select>
							</td>
						</tr>
						<tr>
							<td class="form-table-label">Status</td>
							<td class="form-table-field">
								<select
									{...updateEmployee.fields.status.as('text', employee.status)}
									class="select select-bordered w-full max-w-md"
								>
									{#each EMPLOYEE_STATUSES as status (status)}
										<option value={status}>{status.replace('_', ' ')}</option>
									{/each}
								</select>
							</td>
						</tr>
					</tbody>
				</table>
				<div class="form-actions">
					<a href="/employees/{employee.id}" class="btn btn-ghost">Cancel</a>
					<button type="submit" class="btn btn-primary gap-2" disabled={updateEmployee.pending > 0}>
						{#if updateEmployee.pending > 0}
							<LoadingSpinner size="sm" />
						{/if}
						Save
					</button>
				</div>
			</form>
		</div>
	</div>

	{#snippet pending()}
		<LoadingCenter />
	{/snippet}

	{#snippet failed(error)}
		<div class="alert alert-error">
			<span>{error instanceof Error ? error.message : 'Failed to load employee'}</span>
		</div>
	{/snippet}
</svelte:boundary>
