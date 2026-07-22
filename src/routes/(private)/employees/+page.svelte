<script lang="ts">
	import { Plus, Pencil, Trash2, Users } from '@lucide/svelte';
	import EmployeeDialog from '$lib/components/EmployeeDialog.svelte';
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
		getEmployees,
		deleteEmployee,
		overrideEmployeesFromExcel
	} from '$lib/remotes/employee.remote';

	let employeeDialog = $state<EmployeeDialog | null>(null);
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
	{@const employees = await getEmployees()}

	<EmployeeDialog bind:this={employeeDialog} />

	<PrivatePageHeader title="Employee Master" icon={Users} />

	<div class="mb-4 flex flex-wrap justify-end gap-2">
		<ExcelOverrideButton
			confirmMessage="Override all employee master rows with this Excel file? Existing records will be replaced."
			onImport={async (payload) => {
				await overrideEmployeesFromExcel(payload);
			}}
		/>
		<button type="button" class="btn btn-primary gap-2" onclick={() => employeeDialog?.open()}>
			<Plus class="h-4 w-4" />
			Add employee
		</button>
	</div>

	<DataTable rows={employees} rowKey={(employee) => employee.id} emptyMessage="No employees yet.">
		{#snippet actions({ row: employee })}
			<IconActionButton
				label="Edit"
				variant="secondary"
				onclick={() => employeeDialog?.open(employee)}
			>
				<Pencil class="h-4 w-4" />
			</IconActionButton>
			<IconActionButton
				label="Delete"
				variant="error"
				disabled={deleteLoading.isPending(employee.id)}
				onclick={async () => {
					if (!confirm('Delete this employee?')) return;
					await deleteLoading.run(employee.id, async () => {
						await withFormFeedback({
							successMessage: 'Employee deleted',
							action: async () => {
								await deleteEmployee(employee.id);
							}
						});
					});
				}}
			>
				{#if deleteLoading.isPending(employee.id)}
					<LoadingSpinner size="sm" />
				{:else}
					<Trash2 class="h-4 w-4" />
				{/if}
			</IconActionButton>
		{/snippet}

		<DataTableColumn label="ID" firstData filterText={(employee) => employee.id}>
			{#snippet children({ row: employee })}
				<code class="text-xs">{employee.id}</code>
			{/snippet}
		</DataTableColumn>

		<DataTableColumn label="Employee no" filterText={(employee) => employee.employeeNo ?? ''}>
			{#snippet children({ row: employee })}
				{display(employee.employeeNo)}
			{/snippet}
		</DataTableColumn>

		<DataTableColumn label="Name" filterText={(employee) => employee.employeeName ?? ''}>
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

		<DataTableColumn label="Join date" filterText={(employee) => employee.joinDate ?? ''}>
			{#snippet children({ row: employee })}
				{display(employee.joinDate)}
			{/snippet}
		</DataTableColumn>

		<DataTableColumn label="Facility" filterText={(employee) => facilityLabel(employee.facility)}>
			{#snippet children({ row: employee })}
				{facilityLabel(employee.facility)}
			{/snippet}
		</DataTableColumn>

		<DataTableColumn label="Entry date" filterText={(employee) => displayDate(employee.entryDate)}>
			{#snippet children({ row: employee })}
				{displayDate(employee.entryDate)}
			{/snippet}
		</DataTableColumn>

		<DataTableColumn label="User ID" filterText={(employee) => employee.userId ?? ''}>
			{#snippet children({ row: employee })}
				{display(employee.userId)}
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

	{#snippet pending()}
		<LoadingCenter />
	{/snippet}

	{#snippet failed(error)}
		<div class="alert alert-error">
			<span>{error instanceof Error ? error.message : 'Failed to load employees'}</span>
		</div>
	{/snippet}
</svelte:boundary>
