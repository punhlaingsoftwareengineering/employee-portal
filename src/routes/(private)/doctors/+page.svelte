<script lang="ts">
	import { page } from '$app/state';
	import { Plus, Pencil, Trash2, Stethoscope } from '@lucide/svelte';
	import DoctorDialog from '$lib/components/DoctorDialog.svelte';
	import ExcelOverrideButton from '$lib/components/ExcelOverrideButton.svelte';
	import DataTable from '$lib/components/DataTable.svelte';
	import DataTableColumn from '$lib/components/DataTableColumn.svelte';
	import IconActionButton from '$lib/components/IconActionButton.svelte';
	import LoadingCenter from '$lib/components/LoadingCenter.svelte';
	import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
	import PrivatePageHeader from '$lib/components/PrivatePageHeader.svelte';
	import { createKeyedLoading } from '$lib/keyed-loading.svelte';
	import { withFormFeedback } from '$lib/form-feedback.svelte';
	import {
		getDoctors,
		deleteDoctor,
		overrideDoctorsFromExcel
	} from '$lib/remotes/doctor.remote';
	import { permissionFlag } from '$lib/constants/permissions';

	const permissions = $derived(page.data.permissions);
	const canCreate = $derived(permissionFlag(permissions, 'doctorCreate'));
	const canUpdate = $derived(permissionFlag(permissions, 'doctorUpdate'));
	const canDelete = $derived(permissionFlag(permissions, 'doctorDelete'));
	const canExcel = $derived(permissionFlag(permissions, 'doctorExcelOverride'));

	let doctorDialog = $state<DoctorDialog | null>(null);
	const deleteLoading = createKeyedLoading();

	function display(value: string | number | null | undefined): string {
		if (value == null) return '—';
		const text = String(value).trim();
		return text ? text : '—';
	}
</script>

<svelte:boundary>
	{@const doctors = await getDoctors()}

	<DoctorDialog bind:this={doctorDialog} />

	<PrivatePageHeader title="Doctor Master" icon={Stethoscope} />

	{#if canExcel || canCreate}
		<div class="mb-4 flex flex-wrap justify-end gap-2">
			{#if canExcel}
				<ExcelOverrideButton
					confirmMessage="Override all doctor master rows with this Excel file? Existing records will be replaced."
					onImport={async (payload) => {
						await overrideDoctorsFromExcel(payload);
					}}
				/>
			{/if}
			{#if canCreate}
				<button
					type="button"
					class="btn btn-primary cursor-pointer gap-2"
					onclick={() => doctorDialog?.open()}
				>
					<Plus class="h-4 w-4" />
					Add doctor
				</button>
			{/if}
		</div>
	{/if}

	<DataTable
		rows={doctors}
		rowKey={(doctor) => String(doctor.id)}
		emptyMessage="No doctors yet."
	>
		{#snippet actions({ row: doctor })}
			{#if canUpdate}
				<IconActionButton
					label="Edit"
					variant="secondary"
					onclick={() => doctorDialog?.open(doctor)}
				>
					<Pencil class="h-4 w-4" />
				</IconActionButton>
			{/if}
			{#if canDelete}
				<IconActionButton
					label="Delete"
					variant="error"
					disabled={deleteLoading.isPending(String(doctor.id))}
					onclick={async () => {
						if (!confirm('Delete this doctor?')) return;
						await deleteLoading.run(String(doctor.id), async () => {
							await withFormFeedback({
								successMessage: 'Doctor deleted',
								action: async () => {
									await deleteDoctor(doctor.id);
								}
							});
						});
					}}
				>
					{#if deleteLoading.isPending(String(doctor.id))}
						<LoadingSpinner size="sm" />
					{:else}
						<Trash2 class="h-4 w-4" />
					{/if}
				</IconActionButton>
			{/if}
		{/snippet}

		<DataTableColumn label="ID" firstData filterText={(doctor) => String(doctor.id)}>
			{#snippet children({ row: doctor })}
				<code class="text-xs">{doctor.id}</code>
			{/snippet}
		</DataTableColumn>

		<DataTableColumn label="Facility" filterText={(doctor) => doctor.facilityName ?? ''}>
			{#snippet children({ row: doctor })}
				{display(doctor.facilityName)}
			{/snippet}
		</DataTableColumn>

		<DataTableColumn label="DRN no" filterText={(doctor) => doctor.drnno ?? ''}>
			{#snippet children({ row: doctor })}
				{display(doctor.drnno)}
			{/snippet}
		</DataTableColumn>

		<DataTableColumn label="Name" filterText={(doctor) => doctor.doctorName ?? ''}>
			{#snippet children({ row: doctor })}
				{display(doctor.doctorName)}
			{/snippet}
		</DataTableColumn>

		<DataTableColumn label="Specialization" filterText={(doctor) => doctor.specialization ?? ''}>
			{#snippet children({ row: doctor })}
				{display(doctor.specialization)}
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

		<DataTableColumn label="HIS ID" filterText={(doctor) => String(doctor.hisid ?? '')}>
			{#snippet children({ row: doctor })}
				{display(doctor.hisid)}
			{/snippet}
		</DataTableColumn>
	</DataTable>

	{#snippet pending()}
		<LoadingCenter />
	{/snippet}

	{#snippet failed(error)}
		<div class="alert alert-error">
			<span>{error instanceof Error ? error.message : 'Failed to load doctors'}</span>
		</div>
	{/snippet}
</svelte:boundary>
