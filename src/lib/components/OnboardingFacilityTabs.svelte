<script lang="ts">
	import DataTable from '$lib/components/DataTable.svelte';
	import DataTableColumn from '$lib/components/DataTableColumn.svelte';
	import { ONBOARDING_FACILITY_TABS } from '$lib/constants/onboarding';
	import type { PharmacyMaster } from '$lib/server/db/schema/pharmacy-master';

	let { items = [] }: { items?: PharmacyMaster[] } = $props();

	let selectedId = $state<(typeof ONBOARDING_FACILITY_TABS)[number]['id']>(
		ONBOARDING_FACILITY_TABS[0].id
	);

	function itemsForFacility(facilityId: string) {
		return items.filter((item) => item.facilityId === facilityId && item.active !== false);
	}

	function display(value: string | null | undefined): string {
		return value?.trim() ? value : '—';
	}
</script>

<div class="tabs tabs-lift">
	{#each ONBOARDING_FACILITY_TABS as facility (facility.id)}
		{@const facilityItems = itemsForFacility(facility.id)}
		{@const active = selectedId === facility.id}
		<button
			type="button"
			role="tab"
			class="tab"
			class:tab-active={active}
			aria-selected={active}
			onclick={() => (selectedId = facility.id)}
		>
			{facility.name}
		</button>
		<div class="tab-content border-base-300 bg-base-100 p-6">
			{#if facilityItems.length === 0}
				<p class="text-sm text-base-content/70">No pharmacy items for {facility.name} yet.</p>
			{:else}
				<div class="max-h-[50rem] overflow-auto">
					<DataTable
						rows={facilityItems}
						rowKey={(item) => item.id}
						emptyMessage="No pharmacy items match your filters."
						showSerial={false}
					>
						<DataTableColumn label="Class" firstData filterText={(item) => item.itemClass ?? ''}>
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

						<DataTableColumn
							label="Strength"
							filterText={(item) => item.strengthValue ?? ''}
						>
							{#snippet children({ row: item })}
								{display(item.strengthValue)}
							{/snippet}
						</DataTableColumn>

						<DataTableColumn label="Issue unit" filterText={(item) => item.issueUnit ?? ''}>
							{#snippet children({ row: item })}
								{display(item.issueUnit)}
							{/snippet}
						</DataTableColumn>
					</DataTable>
				</div>
			{/if}
		</div>
	{/each}
</div>
