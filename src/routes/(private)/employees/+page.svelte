<script lang="ts">
	import { page } from '$app/state';
	import { Plus, Pencil, Trash2, Users } from '@lucide/svelte';
	import EmployeeDialog from '$lib/components/EmployeeDialog.svelte';
	import ExcelOverrideButton from '$lib/components/ExcelOverrideButton.svelte';
	import TableExportButton from '$lib/components/TableExportButton.svelte';
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
	import { permissionFlag } from '$lib/constants/permissions';
	import { displayEmployeeId } from '$lib/utils/employee-id';
	import { formatLoyaltyTenure } from '$lib/utils/loyalty-tenure';
	import type { ExportColumn } from '$lib/utils/table-export';
	import type { Employee } from '$lib/server/db/schema/employee';

	const permissions = $derived(page.data.permissions);
	const canCreate = $derived(permissionFlag(permissions, 'employeeCreate'));
	const canUpdate = $derived(permissionFlag(permissions, 'employeeUpdate'));
	const canDelete = $derived(permissionFlag(permissions, 'employeeDelete'));
	const canExcel = $derived(permissionFlag(permissions, 'employeeExcelOverride'));
	const canExport = $derived(permissionFlag(permissions, 'employeeExport'));

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

	const exportColumns: ExportColumn<Employee>[] = [
		{ header: 'ID', value: (employee) => displayEmployeeId(employee.id) },
		{ header: 'Employee no', value: (employee) => employee.employeeNo },
		{ header: 'Name', value: (employee) => employee.employeeName },
		{ header: 'Position', value: (employee) => employee.position },
		{ header: 'Department', value: (employee) => employee.department },
		{ header: 'Join date', value: (employee) => employee.joinDate },
		{ header: 'Loyalty', value: (employee) => formatLoyaltyTenure(employee.joinDate) },
		{ header: 'Facility', value: (employee) => facilityLabel(employee.facility) },
		{ header: 'Entry date', value: (employee) => displayDate(employee.entryDate) },
		{ header: 'User ID', value: (employee) => employee.userId },
		{
			header: 'Active',
			value: (employee) => (employee.active == null ? '' : employee.active ? 'active' : 'inactive')
		}
	];
</script>

<svelte:boundary>
	{@const employees = await getEmployees()}

	<EmployeeDialog bind:this={employeeDialog} />

	<PrivatePageHeader title="Employee Master" icon={Users} />

	{#if canExcel || canCreate || canExport}
		<div class="mb-4 flex flex-wrap justify-end gap-2">
			{#if canExport}
				<TableExportButton rows={employees} columns={exportColumns} fileBaseName="employees" />
			{/if}
			{#if canExcel}
				<ExcelOverrideButton
					confirmMessage="Override all employee master rows with this Excel file? Existing records will be replaced."
					onImport={async (payload) => {
						await overrideEmployeesFromExcel(payload);
					}}
				/>
			{/if}
			{#if canCreate}
				<button
					type="button"
					class="btn cursor-pointer gap-2 btn-primary"
					onclick={() => employeeDialog?.open()}
				>
					<Plus class="h-4 w-4" />
					Add employee
				</button>
			{/if}
		</div>
	{/if}

	<DataTable rows={employees} rowKey={(employee) => employee.id} emptyMessage="No employees yet.">
		{#snippet actions({ row: employee })}
			{#if canUpdate}
				<IconActionButton
					label="Edit"
					variant="secondary"
					onclick={() => employeeDialog?.open(employee)}
				>
					<Pencil class="h-4 w-4" />
				</IconActionButton>
			{/if}
			{#if canDelete}
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
			{/if}
		{/snippet}

		<DataTableColumn label="ID" firstData filterText={(employee) => displayEmployeeId(employee.id)}>
			{#snippet children({ row: employee })}
				{@const idLabel = displayEmployeeId(employee.id)}
				{#if idLabel === '—'}
					<span class="text-base-content/50">—</span>
				{:else}
					<code class="text-xs">{idLabel}</code>
				{/if}
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

		<DataTableColumn
			label="Loyalty"
			filterText={(employee) => formatLoyaltyTenure(employee.joinDate)}
		>
			{#snippet children({ row: employee })}
				{formatLoyaltyTenure(employee.joinDate)}
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
