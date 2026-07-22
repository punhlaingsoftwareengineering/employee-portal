<script lang="ts">
	import { Plus, Trash2 } from '@lucide/svelte';
	import { getAccessRoles } from '$lib/remotes/access-role.remote';
	import {
		getAllDepartments,
		getAllFacilities,
		updateUserAccess,
		getPortalUsers
	} from '$lib/remotes/portal-user.remote';
	import type { PortalRole } from '$lib/constants/user-roles';
	import { withFormFeedback } from '$lib/form-feedback.svelte';
	import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
	import IconActionButton from '$lib/components/IconActionButton.svelte';

	type PortalUser = Awaited<ReturnType<typeof getPortalUsers>>[number];

	let dialog = $state<HTMLDialogElement | null>(null);
	let portalUser = $state<PortalUser | null>(null);
	let portalRole = $state<PortalRole>('guest');
	let assignments = $state<Array<{ departmentId: string; roleId: string; facilityId: string }>>([]);
	let submitting = $state(false);
	let error = $state<string | null>(null);

	export function open(user: PortalUser) {
		portalUser = user;
		portalRole = user.profile?.portalRole ?? 'guest';
		assignments =
			user.departmentRoles?.map((assignment) => ({
				departmentId: assignment.departmentId,
				roleId: assignment.roleId,
				facilityId: assignment.facilityId
			})) ?? [];
		error = null;
		dialog?.showModal();
	}

	function close() {
		dialog?.close();
		portalUser = null;
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
		if (!portalUser) return;

		submitting = true;
		error = null;

		try {
			await withFormFeedback({
				successMessage: 'User access updated',
				action: async () => {
					await updateUserAccess({
						userId: portalUser!.id,
						portalRole,
						assignments:
							portalRole === 'member'
								? assignments.filter(
										(assignment) =>
											assignment.departmentId && assignment.roleId && assignment.facilityId
									)
								: []
					});
					void getPortalUsers().refresh();
				}
			});
			close();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to update user';
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

	<dialog bind:this={dialog} class="modal">
		<div class="modal-box modal-box-fit">
			{#if portalUser}
				<h3 class="text-lg font-bold">Edit access — {portalUser.name}</h3>
				<p class="text-sm opacity-70">{portalUser.email}</p>

				<form class="mt-6" onsubmit={handleSubmit}>
					<table class="form-table">
						<tbody>
							<tr>
								<td class="form-table-label">Portal role</td>
								<td class="form-table-field">
									<select class="select select-bordered w-full max-w-md" bind:value={portalRole}>
										<option value="admin">admin</option>
										<option value="guest">guest</option>
										<option value="member">member (department roles)</option>
									</select>
								</td>
							</tr>
						</tbody>
					</table>

					{#if portalRole === 'member'}
						<div class="mt-6 space-y-4">
							<h4 class="font-semibold">Assignments</h4>
							{#each assignments as assignment, index (index)}
								<div class="flex flex-wrap items-end gap-3">
									<label class="form-control">
										<span class="label-text mb-1">Role</span>
										<select class="select select-bordered" bind:value={assignment.roleId} required>
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
											required
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
											required
										>
											<option value="">Select facility</option>
											{#each facilities as facility (facility.id)}
												<option value={facility.id}>{facility.name}</option>
											{/each}
										</select>
									</label>
									<IconActionButton
										label="Remove"
										variant="error"
										onclick={() => removeAssignment(index)}
									>
										<Trash2 class="h-4 w-4" />
									</IconActionButton>
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
								Save
							{/if}
						</button>
					</div>
				</form>
			{/if}
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

	{#snippet failed(error)}
		<dialog class="modal modal-open">
			<div class="modal-box modal-box-fit">
				<div class="alert alert-error">
					<span>{error instanceof Error ? error.message : 'Failed to load access data'}</span>
				</div>
			</div>
		</dialog>
	{/snippet}
</svelte:boundary>
