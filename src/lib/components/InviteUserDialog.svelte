<script lang="ts">
	import { Plus, Trash2 } from 'lucide-svelte';
	import { createInvite, getAllDepartments, getAllFacilities, getInvites } from '$lib/remotes/portal-user.remote';
	import { getAccessRoles } from '$lib/remotes/access-role.remote';
	import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
	import IconActionButton from '$lib/components/IconActionButton.svelte';

	let dialog = $state<HTMLDialogElement | null>(null);
	let inviteAsAdmin = $state(false);
	let name = $state('');
	let email = $state('');
	let assignments = $state<Array<{ departmentId: string; roleId: string; facilityId: string }>>([
		{ departmentId: '', roleId: '', facilityId: '' }
	]);
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
		name = '';
		email = '';
		inviteAsAdmin = false;
		assignments = [{ departmentId: '', roleId: '', facilityId: '' }];
		error = null;
		submitting = false;
	}

	function addAssignment() {
		assignments = [...assignments, { departmentId: '', roleId: '', facilityId: '' }];
	}

	function removeAssignment(index: number) {
		assignments = assignments.filter((_, i) => i !== index);
	}

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		error = null;
		submitting = true;

		try {
			await createInvite({
				name: name.trim(),
				email: email.trim(),
				inviteAsAdmin,
				assignments: inviteAsAdmin
					? []
					: assignments.filter(
							(assignment) =>
								assignment.departmentId && assignment.roleId && assignment.facilityId
						)
			});
			void getInvites().refresh();
			close();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to send invite';
		} finally {
			submitting = false;
		}
	}
</script>

<svelte:boundary>
	{@const [departments, roles, facilities] = await Promise.all([
		getAllDepartments(),
		getAccessRoles(),
		getAllFacilities()
	])}

	<dialog bind:this={dialog} class="modal" onclose={resetForm}>
		<div class="modal-box modal-box-fit">
			<h3 class="text-lg font-bold">Invite user</h3>
			<p class="mt-1 text-sm opacity-70">
				They will receive an email link to set their password. Link expires in 24 hours.
			</p>

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
							<td class="form-table-label">Invite as admin</td>
							<td class="form-table-field">
								<label class="label cursor-pointer justify-start gap-3">
									<input type="checkbox" class="checkbox" bind:checked={inviteAsAdmin} />
									<span class="label-text">Grant full admin access</span>
								</label>
							</td>
						</tr>
					</tbody>
				</table>

				{#if !inviteAsAdmin}
					<div class="mt-6 space-y-4">
						<h4 class="font-semibold">Assignments</h4>
						{#each assignments as assignment, index (index)}
							<div class="flex flex-wrap items-end gap-3">
								<label class="form-control">
									<span class="label-text mb-1">Role</span>
									<select
										class="select select-bordered"
										bind:value={assignment.roleId}
										required={!inviteAsAdmin}
									>
										<option value="">Select role</option>
										{#each roles as role (role.id)}
											<option value={role.id}>{role.name}</option>
										{/each}
									</select>
								</label>
								<label class="form-control">
									<span class="label-text mb-1">Department</span>
									<select
										class="select select-bordered"
										bind:value={assignment.departmentId}
										required={!inviteAsAdmin}
									>
										<option value="">Select department</option>
										{#each departments as department (department.id)}
											<option value={department.id}>{department.name}</option>
										{/each}
									</select>
								</label>
								<label class="form-control">
									<span class="label-text mb-1">Facility</span>
									<select
										class="select select-bordered"
										bind:value={assignment.facilityId}
										required={!inviteAsAdmin}
									>
										<option value="">Select facility</option>
										{#each facilities as facility (facility.id)}
											<option value={facility.id}>{facility.name}</option>
										{/each}
									</select>
								</label>
								{#if assignments.length > 1}
									<IconActionButton
										label="Remove"
										variant="error"
										onclick={() => removeAssignment(index)}
									>
										<Trash2 class="h-4 w-4" />
									</IconActionButton>
								{/if}
							</div>
						{/each}
						<button type="button" class="btn btn-ghost btn-sm gap-1" onclick={addAssignment}>
							<Plus class="h-4 w-4" />
							Add assignment
						</button>
					</div>
				{/if}

				{#if error}
					<div class="alert alert-error mt-4">
						<span>{error}</span>
					</div>
				{/if}

				<div class="modal-action">
					<button type="button" class="btn btn-ghost" onclick={close} disabled={submitting}>
						Cancel
					</button>
					<button type="submit" class="btn btn-primary" disabled={submitting}>
						{#if submitting}
							<LoadingSpinner size="sm" />
						{:else}
							Send invite
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
			<div class="modal-box modal-box-fit flex justify-center py-12">
				<LoadingSpinner size="lg" />
			</div>
		</dialog>
	{/snippet}

	{#snippet failed(err)}
		<dialog class="modal modal-open">
			<div class="modal-box modal-box-fit">
				<div class="alert alert-error">
					<span>{err instanceof Error ? err.message : 'Failed to load departments'}</span>
				</div>
				<div class="modal-action">
					<button type="button" class="btn" onclick={close}>Close</button>
				</div>
			</div>
		</dialog>
	{/snippet}
</svelte:boundary>
