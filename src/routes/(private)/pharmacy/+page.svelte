<script lang="ts">
	import { page } from '$app/state';
	import { Plus, Pencil, Trash2, Pill } from '@lucide/svelte';
	import PharmacyMasterDialog from '$lib/components/PharmacyMasterDialog.svelte';
	import ExcelOverrideButton from '$lib/components/ExcelOverrideButton.svelte';
	import DataTable from '$lib/components/DataTable.svelte';
	import DataTableColumn from '$lib/components/DataTableColumn.svelte';
	import IconActionButton from '$lib/components/IconActionButton.svelte';
	import LoadingCenter from '$lib/components/LoadingCenter.svelte';
	import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
	import PrivatePageHeader from '$lib/components/PrivatePageHeader.svelte';
	import { createKeyedLoading } from '$lib/keyed-loading.svelte';
	import { withFormFeedback } from '$lib/form-feedback.svelte';
	import { ONBOARDING_FACILITY_TABS } from '$lib/constants/onboarding';
	import {
		getPharmacyMasters,
		deletePharmacyMaster,
		overridePharmacyMastersFromExcel
	} from '$lib/remotes/pharmacy-master.remote';

	const permissions = $derived(page.data.permissions);
	const canManage = $derived(
		permissions?.isAdmin ||
			(permissions?.departmentRoles?.some((assignment) => assignment.permissions.pharmacyWrite) ??
				false)
	);

	let pharmacyDialog = $state<PharmacyMasterDialog | null>(null);
	const deleteLoading = createKeyedLoading();

	function facilityLabel(facilityId: string | null): string {
		if (!facilityId) return '—';
		return ONBOARDING_FACILITY_TABS.find((item) => item.id === facilityId)?.name ?? facilityId;
	}

	function display(value: string | null | undefined): string {
		return value?.trim() ? value : '—';
	}

	function displayDate(value: Date | string | null | undefined): string {
		if (!value) return '—';
		return value instanceof Date ? value.toLocaleString() : String(value);
	}
</script>

<svelte:boundary>
	{@const items = await getPharmacyMasters()}

	<PharmacyMasterDialog bind:this={pharmacyDialog} />

	<PrivatePageHeader title="Pharmacy Master" icon={Pill} />

	{#if canManage}
		<div class="mb-4 flex flex-wrap justify-end gap-2">
			<ExcelOverrideButton
				confirmMessage="Override all pharmacy master rows with this Excel file? Existing records will be replaced."
				onImport={async (payload) => {
					await overridePharmacyMastersFromExcel(payload);
				}}
			/>
			<button type="button" class="btn btn-primary gap-2" onclick={() => pharmacyDialog?.open()}>
				<Plus class="h-4 w-4" />
				Add item
			</button>
		</div>
	{/if}

	<DataTable rows={items} rowKey={(item) => item.id} emptyMessage="No pharmacy items yet.">
		{#snippet actions({ row: item })}
			{#if canManage}
				<IconActionButton
					label="Edit"
					variant="secondary"
					onclick={() => pharmacyDialog?.open(item)}
				>
					<Pencil class="h-4 w-4" />
				</IconActionButton>
				<IconActionButton
					label="Delete"
					variant="error"
					disabled={deleteLoading.isPending(item.id)}
					onclick={async () => {
						if (!confirm('Delete this pharmacy item?')) return;
						await deleteLoading.run(item.id, async () => {
							await withFormFeedback({
								successMessage: 'Pharmacy item deleted',
								action: async () => {
									await deletePharmacyMaster(item.id);
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

		<DataTableColumn label="ID" firstData filterText={(item) => item.id}>
			{#snippet children({ row: item })}
				<code class="text-xs">{item.id}</code>
			{/snippet}
		</DataTableColumn>

		<DataTableColumn label="Class" filterText={(item) => item.itemClass ?? ''}>
			{#snippet children({ row: item })}
				{display(item.itemClass)}
			{/snippet}
		</DataTableColumn>

		<DataTableColumn label="Sub class" filterText={(item) => item.subClass ?? ''}>
			{#snippet children({ row: item })}
				{display(item.subClass)}
			{/snippet}
		</DataTableColumn>

		<DataTableColumn label="Item name" filterText={(item) => item.itemName ?? ''}>
			{#snippet children({ row: item })}
				{display(item.itemName)}
			{/snippet}
		</DataTableColumn>

		<DataTableColumn label="Generic name" filterText={(item) => item.genericName ?? ''}>
			{#snippet children({ row: item })}
				{display(item.genericName)}
			{/snippet}
		</DataTableColumn>

		<DataTableColumn label="Strength" filterText={(item) => item.strengthValue ?? ''}>
			{#snippet children({ row: item })}
				{display(item.strengthValue)}
			{/snippet}
		</DataTableColumn>

		<DataTableColumn label="Issue unit" filterText={(item) => item.issueUnit ?? ''}>
			{#snippet children({ row: item })}
				{display(item.issueUnit)}
			{/snippet}
		</DataTableColumn>

		<DataTableColumn label="Entry date" filterText={(item) => displayDate(item.entryDate)}>
			{#snippet children({ row: item })}
				{displayDate(item.entryDate)}
			{/snippet}
		</DataTableColumn>

		<DataTableColumn label="Active" filterText={(item) => String(item.active ?? '')}>
			{#snippet children({ row: item })}
				{#if item.active == null}
					<span class="text-base-content/50">—</span>
				{:else}
					<span class="badge badge-outline">{item.active ? 'active' : 'inactive'}</span>
				{/if}
			{/snippet}
		</DataTableColumn>

		<DataTableColumn label="Facility" filterText={(item) => facilityLabel(item.facilityId)}>
			{#snippet children({ row: item })}
				{facilityLabel(item.facilityId)}
			{/snippet}
		</DataTableColumn>
	</DataTable>

	{#snippet pending()}
		<LoadingCenter />
	{/snippet}

	{#snippet failed(error)}
		<div class="alert alert-error">
			<span>{error instanceof Error ? error.message : 'Failed to load pharmacy items'}</span>
		</div>
	{/snippet}
</svelte:boundary>
