<script lang="ts">
	import { page } from '$app/state';
	import { Plus, Pencil, Trash2 } from '@lucide/svelte';
	import DepartmentDialog from '$lib/components/DepartmentDialog.svelte';
	import DataTable from '$lib/components/DataTable.svelte';
	import DataTableColumn from '$lib/components/DataTableColumn.svelte';
	import IconActionButton from '$lib/components/IconActionButton.svelte';
	import LoadingCenter from '$lib/components/LoadingCenter.svelte';
	import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
	import PrivatePageHeader from '$lib/components/PrivatePageHeader.svelte';
	import { createKeyedLoading } from '$lib/keyed-loading.svelte';
	import { getDepartments, deleteDepartment } from '$lib/remotes/department.remote';

	const isAdmin = $derived(page.data.permissions?.isAdmin ?? false);
	let departmentDialog = $state<DepartmentDialog | null>(null);
	const deleteLoading = createKeyedLoading();
</script>

<svelte:boundary>
	{@const departments = await getDepartments()}

	<DepartmentDialog bind:this={departmentDialog} />

	<PrivatePageHeader title="Departments" />

	{#if isAdmin}
		<div class="flex justify-end">
			<button type="button" class="btn btn-primary gap-2" onclick={() => departmentDialog?.open()}>
				<Plus class="h-4 w-4" />
				Add department
			</button>
		</div>
	{/if}

	<DataTable rows={departments} rowKey={(department) => department.id} emptyMessage="No departments yet.">
		{#snippet actions({ row: department })}
			{#if isAdmin}
				<IconActionButton
					label="Edit"
					variant="secondary"
					onclick={() => departmentDialog?.open(department)}
				>
					<Pencil class="h-4 w-4" />
				</IconActionButton>
				<IconActionButton
					label="Delete"
					variant="error"
					disabled={deleteLoading.isPending(department.id)}
					onclick={async () => {
						if (!confirm('Delete this department?')) return;
						await deleteLoading.run(department.id, async () => {
							await deleteDepartment(department.id);
						});
					}}
				>
					{#if deleteLoading.isPending(department.id)}
						<LoadingSpinner size="sm" />
					{:else}
						<Trash2 class="h-4 w-4" />
					{/if}
				</IconActionButton>
			{/if}
		{/snippet}

		<DataTableColumn label="Name" firstData filterText={(department) => department.name}>
			{#snippet children({ row: department })}
				{department.name}
			{/snippet}
		</DataTableColumn>
	</DataTable>

	{#snippet pending()}
		<LoadingCenter />
	{/snippet}

	{#snippet failed(error)}
		<div class="alert alert-error">
			<span>{error instanceof Error ? error.message : 'Failed to load departments'}</span>
		</div>
	{/snippet}
</svelte:boundary>
