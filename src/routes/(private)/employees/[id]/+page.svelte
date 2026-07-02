<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { Pencil, Trash2 } from '@lucide/svelte';
	import { getEmployee, deleteEmployee } from '$lib/remotes/employee.remote';
	import IconActionButton from '$lib/components/IconActionButton.svelte';
	import LoadingCenter from '$lib/components/LoadingCenter.svelte';
	import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
	import PrivatePageHeader from '$lib/components/PrivatePageHeader.svelte';

	const id = $derived(page.params.id!);
	let deleting = $state(false);

	async function handleDelete() {
		if (!confirm('Delete this employee?')) return;
		deleting = true;
		try {
			await deleteEmployee(id);
			goto('/employees');
		} finally {
			deleting = false;
		}
	}
</script>

<svelte:boundary>
	{@const employee = await getEmployee(id)}

	<PrivatePageHeader title={`${employee.firstName} ${employee.lastName}`} />

	<div class="flex items-center justify-between">
		<p class="text-base-content/70">{employee.email}</p>
		<div class="flex gap-2">
			<IconActionButton label="Edit" variant="secondary" href="/employees/{employee.id}/edit">
				<Pencil class="h-4 w-4" />
			</IconActionButton>
			<IconActionButton label="Delete" variant="error" disabled={deleting} onclick={handleDelete}>
				{#if deleting}
					<LoadingSpinner size="sm" />
				{:else}
					<Trash2 class="h-4 w-4" />
				{/if}
			</IconActionButton>
		</div>
	</div>

	<div class="card-grid md:grid-cols-2 lg:grid-cols-4">
		<div class="stat rounded-box border border-base-300 bg-base-100">
			<div class="stat-title">Role</div>
			<div class="stat-value text-lg">{employee.role.name}</div>
		</div>
		<div class="stat rounded-box border border-base-300 bg-base-100">
			<div class="stat-title">Department</div>
			<div class="stat-value text-lg">{employee.department.name}</div>
		</div>
		<div class="stat rounded-box border border-base-300 bg-base-100">
			<div class="stat-title">Facility</div>
			<div class="stat-value text-lg">{employee.facility.name}</div>
		</div>
		<div class="stat rounded-box border border-base-300 bg-base-100">
			<div class="stat-title">Status</div>
			<div class="stat-value text-lg capitalize">{employee.status.replace('_', ' ')}</div>
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
