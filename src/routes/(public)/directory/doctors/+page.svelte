<script lang="ts">
	import { Stethoscope } from '@lucide/svelte';
	import DataTable from '$lib/components/DataTable.svelte';
	import DataTableColumn from '$lib/components/DataTableColumn.svelte';
	import PageTitle from '$lib/components/PageTitle.svelte';
	import SectionHead from '$lib/components/SectionHead.svelte';

	let { data } = $props();

	function display(value: string | number | null | undefined): string {
		if (value == null) return '—';
		const text = String(value).trim();
		return text ? text : '—';
	}
</script>

<PageTitle title="Doctor Directory" />

<div class="container mx-auto max-w-6xl px-4 py-4">
	<SectionHead icon={Stethoscope} title="Doctor Directory" />
	<p class="mb-4 text-sm text-base-content/70">Public list of active doctors.</p>

	<DataTable
		rows={data.doctors}
		rowKey={(doctor) => String(doctor.id)}
		emptyMessage="No active doctors yet."
	>
		<DataTableColumn label="Name" firstData filterText={(doctor) => doctor.doctorName ?? ''}>
			{#snippet children({ row: doctor })}
				{display(doctor.doctorName)}
			{/snippet}
		</DataTableColumn>

		<DataTableColumn label="DRN no" filterText={(doctor) => doctor.drnno ?? ''}>
			{#snippet children({ row: doctor })}
				{display(doctor.drnno)}
			{/snippet}
		</DataTableColumn>

		<DataTableColumn label="Specialization" filterText={(doctor) => doctor.specialization ?? ''}>
			{#snippet children({ row: doctor })}
				{display(doctor.specialization)}
			{/snippet}
		</DataTableColumn>

		<DataTableColumn label="Facility" filterText={(doctor) => doctor.facilityName ?? ''}>
			{#snippet children({ row: doctor })}
				{display(doctor.facilityName)}
			{/snippet}
		</DataTableColumn>

		<DataTableColumn label="Active" filterText={(doctor) => String(doctor.active ?? '')}>
			{#snippet children({ row: doctor })}
				{#if doctor.active == null}
					<span class="text-base-content/50">—</span>
				{:else}
					<span class="badge badge-outline">{doctor.active ? 'active' : 'inactive'}</span>
				{/if}
			{/snippet}
		</DataTableColumn>
	</DataTable>
</div>
