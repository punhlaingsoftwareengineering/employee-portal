<script lang="ts">
	import { page } from '$app/state';
	import { Plus, Eye } from 'lucide-svelte';
	import EmployeeDialog from '$lib/components/EmployeeDialog.svelte';
	import DataTable from '$lib/components/DataTable.svelte';
	import DataTableColumn from '$lib/components/DataTableColumn.svelte';
	import { getEmployees } from '$lib/remotes/employee.remote';
	import IconActionButton from '$lib/components/IconActionButton.svelte';
	import LoadingCenter from '$lib/components/LoadingCenter.svelte';
	import PrivatePageHeader from '$lib/components/PrivatePageHeader.svelte';

	const permissions = $derived(page.data.permissions);
	const canCreate = $derived(
		permissions?.isAdmin ||
			permissions?.departmentRoles?.some((assignment) => assignment.permissions.employeeWrite)
	);

	let employeeDialog = $state<EmployeeDialog | null>(null);
</script>

<svelte:boundary>
	{@const employees = await getEmployees()}

	<EmployeeDialog bind:this={employeeDialog} />

	<PrivatePageHeader title="Employees" />

	{#if canCreate}
		<div class="flex justify-end">
			<button
				type="button"
				class="btn btn-primary gap-2"
				onclick={() => employeeDialog?.open()}
			>
				<Plus class="h-4 w-4" />
				Add employee
			</button>
		</div>
	{/if}

	<DataTable rows={employees} rowKey={(employee) => employee.id} emptyMessage="No employees yet.">
		{#snippet actions({ row: employee })}
			<IconActionButton label="View" href="/employees/{employee.id}">
				<Eye class="h-4 w-4" />
			</IconActionButton>
		{/snippet}

		<DataTableColumn
			label="Name"
			firstData
			filterText={(employee) => `${employee.firstName} ${employee.lastName}`}
		>
			{#snippet children({ row: employee })}
				{employee.firstName} {employee.lastName}
			{/snippet}
		</DataTableColumn>

		<DataTableColumn label="Email" filterText={(employee) => employee.email}>
			{#snippet children({ row: employee })}
				{employee.email}
			{/snippet}
		</DataTableColumn>

		<DataTableColumn label="Role" filterText={(employee) => employee.role.name}>
			{#snippet children({ row: employee })}
				{employee.role.name}
			{/snippet}
		</DataTableColumn>

		<DataTableColumn label="Department" filterText={(employee) => employee.department.name}>
			{#snippet children({ row: employee })}
				{employee.department.name}
			{/snippet}
		</DataTableColumn>

		<DataTableColumn label="Facility" filterText={(employee) => employee.facility.name}>
			{#snippet children({ row: employee })}
				{employee.facility.name}
			{/snippet}
		</DataTableColumn>

		<DataTableColumn label="Status" filterText={(employee) => employee.status}>
			{#snippet children({ row: employee })}
				<span class="badge badge-outline">{employee.status}</span>
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
