<script lang="ts">
	import { Plus, Pencil, Trash2 } from 'lucide-svelte';
	import RoleDialog from '$lib/components/RoleDialog.svelte';
	import DataTable from '$lib/components/DataTable.svelte';
	import DataTableColumn from '$lib/components/DataTableColumn.svelte';
	import IconActionButton from '$lib/components/IconActionButton.svelte';
	import LoadingCenter from '$lib/components/LoadingCenter.svelte';
	import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
	import PrivatePageHeader from '$lib/components/PrivatePageHeader.svelte';
	import { createKeyedLoading } from '$lib/keyed-loading.svelte';
	import { getAccessRoles, deleteAccessRole } from '$lib/remotes/access-role.remote';
	import { getServices } from '$lib/remotes/service.remote';
	import { getApps } from '$lib/remotes/app.remote';
	import type { AccessRole } from '$lib/server/db/schema/access-role';

	let roleDialog = $state<RoleDialog | null>(null);
	const deleteLoading = createKeyedLoading();

	function permissionFilterText(role: AccessRole & { toolCount?: number }): string {
		const parts: string[] = [];
		if (role.employeeReadAll) parts.push('read all employees');
		if (role.employeeWrite) parts.push('write employees');
		if (role.departmentReadAll) parts.push('read all depts');
		if (role.departmentWrite) parts.push('manage depts');
		if (role.facilityReadAll) parts.push('read facilities');
		if (role.facilityWrite) parts.push('manage facilities');
		return parts.join(' ');
	}
</script>

<svelte:boundary>
	{@const roles = await getAccessRoles()}
	{@const allServices = await getServices()}
	{@const allApps = await getApps()}

	<RoleDialog bind:this={roleDialog} {allServices} {allApps} />

	<PrivatePageHeader title="Roles" />

	<div class="flex justify-end">
		<button type="button" class="btn btn-primary gap-2" onclick={() => roleDialog?.open()}>
			<Plus class="h-4 w-4" />
			New role
		</button>
	</div>

	<DataTable rows={roles} rowKey={(role) => role.id} emptyMessage="No roles yet.">
		{#snippet actions({ row: role })}
			<IconActionButton label="Edit" variant="secondary" onclick={() => roleDialog?.open(role)}>
				<Pencil class="h-4 w-4" />
			</IconActionButton>
			{#if !role.isSystem}
				<IconActionButton
					label="Delete"
					variant="error"
					disabled={deleteLoading.isPending(role.id)}
					onclick={async () => {
						if (!confirm(`Delete role "${role.name}"?`)) return;
						await deleteLoading.run(role.id, async () => {
							await deleteAccessRole(role.id);
						});
					}}
				>
					{#if deleteLoading.isPending(role.id)}
						<LoadingSpinner size="sm" />
					{:else}
						<Trash2 class="h-4 w-4" />
					{/if}
				</IconActionButton>
			{/if}
		{/snippet}

		<DataTableColumn label="Name" firstData filterText={(role) => role.name}>
			{#snippet children({ row: role })}
				{role.name}
				{#if role.isSystem}
					<span class="badge badge-ghost badge-sm ml-2">system</span>
				{/if}
			{/snippet}
		</DataTableColumn>

		<DataTableColumn label="Slug" filterText={(role) => role.slug}>
			{#snippet children({ row: role })}
				<code class="text-sm">{role.slug}</code>
			{/snippet}
		</DataTableColumn>

		<DataTableColumn label="Permissions" filterText={permissionFilterText}>
			{#snippet children({ row: role })}
				<div class="text-sm">
					{#if role.employeeReadAll}<span class="badge badge-outline badge-sm"
							>read all employees</span
						>{/if}
					{#if role.employeeWrite}<span class="badge badge-outline badge-sm"
							>write employees</span
						>{/if}
					{#if role.departmentReadAll}<span class="badge badge-outline badge-sm"
							>read all depts</span
						>{/if}
					{#if role.departmentWrite}<span class="badge badge-outline badge-sm"
							>manage depts</span
						>{/if}
					{#if role.facilityReadAll}<span class="badge badge-outline badge-sm"
							>read facilities</span
						>{/if}
					{#if role.facilityWrite}<span class="badge badge-outline badge-sm"
							>manage facilities</span
						>{/if}
				</div>
			{/snippet}
		</DataTableColumn>

		<DataTableColumn
			label="Tools"
			filterText={(role) => String(role.toolCount ?? 0)}
		>
			{#snippet children({ row: role })}
				<span class="badge badge-outline badge-sm">{role.toolCount ?? 0}</span>
			{/snippet}
		</DataTableColumn>
	</DataTable>

	{#snippet pending()}
		<LoadingCenter />
	{/snippet}

	{#snippet failed(error)}
		<div class="alert alert-error">
			<span>{error instanceof Error ? error.message : 'Failed to load roles'}</span>
		</div>
	{/snippet}
</svelte:boundary>
