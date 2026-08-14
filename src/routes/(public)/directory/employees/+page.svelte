<script lang="ts">
	import { Users } from '@lucide/svelte';
	import DataTable from '$lib/components/DataTable.svelte';
	import DataTableColumn from '$lib/components/DataTableColumn.svelte';
	import PageTitle from '$lib/components/PageTitle.svelte';
	import SectionHead from '$lib/components/SectionHead.svelte';
	import { ONBOARDING_FACILITY_TABS } from '$lib/constants/onboarding';
	import { formatLoyaltyTenure } from '$lib/utils/loyalty-tenure';

	let { data } = $props();

	function facilityLabel(facilityId: string | null): string {
		if (!facilityId) return '—';
		return ONBOARDING_FACILITY_TABS.find((item) => item.id === facilityId)?.name ?? facilityId;
	}

	function display(value: string | null | undefined): string {
		return value?.trim() ? value : '—';
	}
</script>

<PageTitle title="Employee Directory" />

<div class="container mx-auto max-w-6xl px-4 py-4">
	<SectionHead icon={Users} title="Employee Directory" />
	<p class="mb-4 text-sm text-base-content/70">
		Public list of active employees. Loyalty shows how long each person has been with the
		organization since their join date.
	</p>

	<DataTable
		rows={data.employees}
		rowKey={(employee) => employee.id}
		emptyMessage="No active employees yet."
	>
		<DataTableColumn label="Name" firstData filterText={(employee) => employee.employeeName ?? ''}>
			{#snippet children({ row: employee })}
				{display(employee.employeeName)}
			{/snippet}
		</DataTableColumn>

		<DataTableColumn label="Position" filterText={(employee) => employee.position ?? ''}>
			{#snippet children({ row: employee })}
				{display(employee.position)}
			{/snippet}
		</DataTableColumn>

		<DataTableColumn label="Department" filterText={(employee) => employee.department ?? ''}>
			{#snippet children({ row: employee })}
				{display(employee.department)}
			{/snippet}
		</DataTableColumn>

		<DataTableColumn label="Facility" filterText={(employee) => facilityLabel(employee.facility)}>
			{#snippet children({ row: employee })}
				{facilityLabel(employee.facility)}
			{/snippet}
		</DataTableColumn>

		<DataTableColumn
			label="Loyalty"
			filterText={(employee) => formatLoyaltyTenure(employee.joinDate)}
		>
			{#snippet children({ row: employee })}
				{formatLoyaltyTenure(employee.joinDate)}
			{/snippet}
		</DataTableColumn>

		<DataTableColumn label="Active" filterText={(employee) => String(employee.active ?? '')}>
			{#snippet children({ row: employee })}
				{#if employee.active == null}
					<span class="text-base-content/50">—</span>
				{:else}
					<span class="badge badge-outline">{employee.active ? 'active' : 'inactive'}</span>
				{/if}
			{/snippet}
		</DataTableColumn>
	</DataTable>
</div>
