<script lang="ts">
	import { page } from '$app/state';
	import { Plus, Pencil, Trash2 } from '@lucide/svelte';
	import FacilityDialog from '$lib/components/FacilityDialog.svelte';
	import DataTable from '$lib/components/DataTable.svelte';
	import DataTableColumn from '$lib/components/DataTableColumn.svelte';
	import IconActionButton from '$lib/components/IconActionButton.svelte';
	import LoadingCenter from '$lib/components/LoadingCenter.svelte';
	import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
	import PrivatePageHeader from '$lib/components/PrivatePageHeader.svelte';
	import { createKeyedLoading } from '$lib/keyed-loading.svelte';
	import { withFormFeedback } from '$lib/form-feedback.svelte';
	import { getFacilities, deleteFacility } from '$lib/remotes/facility.remote';

	const permissions = $derived(page.data.permissions);
	const isAdmin = $derived(permissions?.isAdmin ?? false);

	function canWriteFacilityRow(facilityId: string): boolean {
		if (isAdmin) return true;
		return (
			permissions?.departmentRoles?.some(
				(assignment) =>
					assignment.facilityId === facilityId && assignment.permissions.facilityWrite
			) ?? false
		);
	}

	let facilityDialog = $state<FacilityDialog | null>(null);
	const deleteLoading = createKeyedLoading();
</script>

<svelte:boundary>
	{@const facilities = await getFacilities()}

	<FacilityDialog bind:this={facilityDialog} />

	<PrivatePageHeader title="Facilities" />

	{#if isAdmin}
		<div class="flex justify-end">
			<button type="button" class="btn btn-primary gap-2" onclick={() => facilityDialog?.open()}>
				<Plus class="h-4 w-4" />
				Add facility
			</button>
		</div>
	{/if}

	<DataTable rows={facilities} rowKey={(item) => item.id} emptyMessage="No facilities yet.">
		{#snippet actions({ row: item })}
			{#if canWriteFacilityRow(item.id)}
				<IconActionButton
					label="Edit"
					variant="secondary"
					onclick={() => facilityDialog?.open(item)}
				>
					<Pencil class="h-4 w-4" />
				</IconActionButton>
				<IconActionButton
					label="Delete"
					variant="error"
					disabled={deleteLoading.isPending(item.id)}
					onclick={async () => {
						if (!confirm(`Delete facility "${item.name}"?`)) return;
						await deleteLoading.run(item.id, async () => {
							await withFormFeedback({
								successMessage: 'Facility deleted',
								action: async () => {
									await deleteFacility(item.id);
								}
							});
						});
					}}
				>
					{#if deleteLoading.isPending(item.id)}
						<LoadingSpinner size="sm" />
					{:else}
						<Trash2 class="h-4 w-4" />
					{/if}
				</IconActionButton>
			{/if}
		{/snippet}

		<DataTableColumn label="Image" filterText={(item) => item.imageUrl ?? ''} class="w-14">
			{#snippet children({ row: item })}
				{#if item.imageUrl}
					<img src={item.imageUrl} alt="" class="h-10 w-10 rounded-box object-cover" />
				{:else}
					<span class="text-base-content/40">—</span>
				{/if}
			{/snippet}
		</DataTableColumn>

		<DataTableColumn label="Name" firstData filterText={(item) => item.name}>
			{#snippet children({ row: item })}
				{item.name}
			{/snippet}
		</DataTableColumn>

		<DataTableColumn
			label="Description"
			class="max-w-xs"
			filterText={(item) => item.description ?? ''}
		>
			{#snippet children({ row: item })}
				<span class="block truncate text-sm text-base-content/70">
					{item.description ?? '—'}
				</span>
			{/snippet}
		</DataTableColumn>

		<DataTableColumn label="Address" class="max-w-xs" filterText={(item) => item.address ?? ''}>
			{#snippet children({ row: item })}
				<span class="block truncate text-sm text-base-content/70">
					{item.address ?? '—'}
				</span>
			{/snippet}
		</DataTableColumn>

		<DataTableColumn label="Phone" filterText={(item) => item.phone ?? ''}>
			{#snippet children({ row: item })}
				{#if item.phone}
					<a href="tel:{item.phone.replace(/\s/g, '')}" class="link link-primary whitespace-nowrap text-sm">
						{item.phone}
					</a>
				{:else}
					<span class="text-base-content/60">—</span>
				{/if}
			{/snippet}
		</DataTableColumn>
	</DataTable>

	{#snippet pending()}
		<LoadingCenter />
	{/snippet}

	{#snippet failed(error)}
		<div class="alert alert-error">
			<span>{error instanceof Error ? error.message : 'Failed to load facilities'}</span>
		</div>
	{/snippet}
</svelte:boundary>
