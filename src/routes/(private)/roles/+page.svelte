<script lang="ts">
	import { page } from '$app/state';
	import { Plus, Pencil, Trash2 } from '@lucide/svelte';
	import RoleDialog from '$lib/components/RoleDialog.svelte';
	import DataTable from '$lib/components/DataTable.svelte';
	import DataTableColumn from '$lib/components/DataTableColumn.svelte';
	import IconActionButton from '$lib/components/IconActionButton.svelte';
	import LoadingCenter from '$lib/components/LoadingCenter.svelte';
	import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
	import PrivatePageHeader from '$lib/components/PrivatePageHeader.svelte';
	import { createKeyedLoading } from '$lib/keyed-loading.svelte';
	import { withFormFeedback } from '$lib/form-feedback.svelte';
	import { getAccessRoles, deleteAccessRole } from '$lib/remotes/access-role.remote';
	import { getServices } from '$lib/remotes/service.remote';
	import { getApps } from '$lib/remotes/app.remote';
	import { getCommunityLinks } from '$lib/remotes/community-link.remote';
	import type { AccessRole } from '$lib/server/db/schema/access-role';
	import { permissionFlag } from '$lib/constants/permissions';

	const permissions = $derived(page.data.permissions);
	const canCreate = $derived(permissionFlag(permissions, 'rolesCreate'));
	const canUpdate = $derived(permissionFlag(permissions, 'rolesUpdate'));
	const canDelete = $derived(permissionFlag(permissions, 'rolesDelete'));

	let roleDialog = $state<RoleDialog | null>(null);
	const deleteLoading = createKeyedLoading();

	function permissionFilterText(role: AccessRole & { toolCount?: number }): string {
		const parts: string[] = [];
		if (role.employeeReadAll) parts.push('view employees');
		if (role.employeeCreate) parts.push('add employees');
		if (role.employeeUpdate) parts.push('edit employees');
		if (role.employeeDelete) parts.push('delete employees');
		if (role.employeeExcelOverride) parts.push('excel employees');
		if (role.employeeExport) parts.push('export employees');
		if (role.departmentReadAll) parts.push('view depts');
		if (role.departmentCreate) parts.push('add depts');
		if (role.departmentUpdate) parts.push('edit depts');
		if (role.departmentDelete) parts.push('delete depts');
		if (role.facilityReadAll) parts.push('view facilities');
		if (role.facilityCreate) parts.push('add facilities');
		if (role.facilityUpdate) parts.push('edit facilities');
		if (role.facilityDelete) parts.push('delete facilities');
		if (role.pharmacyReadAll) parts.push('view pharmacy');
		if (role.pharmacyCreate) parts.push('add pharmacy');
		if (role.pharmacyUpdate) parts.push('edit pharmacy');
		if (role.pharmacyDelete) parts.push('delete pharmacy');
		if (role.pharmacyExcelOverride) parts.push('excel pharmacy');
		if (role.pharmacyExport) parts.push('export pharmacy');
		if (role.doctorReadAll) parts.push('view doctors');
		if (role.doctorCreate) parts.push('add doctors');
		if (role.doctorUpdate) parts.push('edit doctors');
		if (role.doctorDelete) parts.push('delete doctors');
		if (role.doctorExcelOverride) parts.push('excel doctors');
		if (role.doctorExport) parts.push('export doctors');
		if (role.usersRead) parts.push('view users');
		if (role.rolesRead) parts.push('view roles');
		return parts.join(' ');
	}
</script>

<svelte:boundary>
	{@const roles = await getAccessRoles()}
	{@const allServices = await getServices()}
	{@const allApps = await getApps()}
	{@const allCommunityLinks = await getCommunityLinks()}

	<RoleDialog bind:this={roleDialog} {allServices} {allApps} {allCommunityLinks} />

	<PrivatePageHeader title="Roles" />

	{#if canCreate}
		<div class="flex justify-end">
			<button
				type="button"
				class="btn cursor-pointer gap-2 btn-primary"
				onclick={() => roleDialog?.open()}
			>
				<Plus class="h-4 w-4" />
				New role
			</button>
		</div>
	{/if}

	<DataTable rows={roles} rowKey={(role) => role.id} emptyMessage="No roles yet.">
		{#snippet actions({ row: role })}
			{#if canUpdate}
				<IconActionButton label="Edit" variant="secondary" onclick={() => roleDialog?.open(role)}>
					<Pencil class="h-4 w-4" />
				</IconActionButton>
			{/if}
			{#if canDelete && !role.isSystem}
				<IconActionButton
					label="Delete"
					variant="error"
					disabled={deleteLoading.isPending(role.id)}
					onclick={async () => {
						if (!confirm(`Delete role "${role.name}"?`)) return;
						await deleteLoading.run(role.id, async () => {
							await withFormFeedback({
								successMessage: 'Role deleted',
								action: async () => {
									await deleteAccessRole(role.id);
								}
							});
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
					<span class="ml-2 badge badge-ghost badge-sm">system</span>
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
				<div class="flex flex-wrap gap-1 text-sm">
					{#if role.employeeCreate || role.employeeUpdate || role.employeeExcelOverride || role.employeeExport}
						<span class="badge badge-outline badge-sm">employees</span>
					{/if}
					{#if role.doctorCreate || role.doctorUpdate || role.doctorExcelOverride || role.doctorExport}
						<span class="badge badge-outline badge-sm">doctors</span>
					{/if}
					{#if role.pharmacyCreate || role.pharmacyUpdate || role.pharmacyExcelOverride || role.pharmacyExport}
						<span class="badge badge-outline badge-sm">pharmacy</span>
					{/if}
					{#if role.departmentCreate || role.departmentUpdate}
						<span class="badge badge-outline badge-sm">departments</span>
					{/if}
					{#if role.facilityCreate || role.facilityUpdate}
						<span class="badge badge-outline badge-sm">facilities</span>
					{/if}
					{#if role.usersInvite || role.usersUpdate}
						<span class="badge badge-outline badge-sm">users</span>
					{/if}
					{#if role.rolesCreate || role.rolesUpdate}
						<span class="badge badge-outline badge-sm">roles</span>
					{/if}
				</div>
			{/snippet}
		</DataTableColumn>

		<DataTableColumn label="Tools" filterText={(role) => String(role.toolCount ?? 0)}>
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
