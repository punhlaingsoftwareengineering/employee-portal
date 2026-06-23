<script lang="ts">
	import { page } from '$app/state';
	import { Plus, Pencil, Mail, RefreshCw, Ban } from 'lucide-svelte';
	import InviteUserDialog from '$lib/components/InviteUserDialog.svelte';
	import DataTable from '$lib/components/DataTable.svelte';
	import DataTableColumn from '$lib/components/DataTableColumn.svelte';
	import LoadingCenter from '$lib/components/LoadingCenter.svelte';
	import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
	import EditUserAccessDialog from '$lib/components/EditUserAccessDialog.svelte';
	import IconActionButton from '$lib/components/IconActionButton.svelte';
	import { createKeyedLoading } from '$lib/keyed-loading.svelte';
	import {
		getPortalUsers,
		getInvites,
		getAllDepartments,
		getAllFacilities,
		resendInvite,
		revokeInvite
	} from '$lib/remotes/portal-user.remote';
	import { getAccessRoles } from '$lib/remotes/access-role.remote';

	let inviteDialog = $state<InviteUserDialog | null>(null);
	let editUserDialog = $state<EditUserAccessDialog | null>(null);
	const actionLoading = createKeyedLoading();

	function lookupName<T extends { id: string; name: string }>(
		items: T[],
		id: string | undefined
	): string {
		if (!id) return '—';
		return items.find((item) => item.id === id)?.name ?? '—';
	}

	function portalUserRoleText(
		portalUser: Awaited<ReturnType<typeof getPortalUsers>>[number]
	): string {
		if (portalUser.profile?.portalRole === 'member' && portalUser.departmentRoles?.length) {
			return portalUser.departmentRoles.map((a) => a.role?.name ?? '—').join(' ');
		}
		return portalUser.profile?.portalRole ?? 'guest';
	}

	function portalUserDepartmentText(
		portalUser: Awaited<ReturnType<typeof getPortalUsers>>[number]
	): string {
		if (portalUser.profile?.portalRole === 'member' && portalUser.departmentRoles?.length) {
			return portalUser.departmentRoles.map((a) => a.department.name).join(' ');
		}
		return '';
	}

	function portalUserFacilityText(
		portalUser: Awaited<ReturnType<typeof getPortalUsers>>[number]
	): string {
		if (portalUser.profile?.portalRole === 'member' && portalUser.departmentRoles?.length) {
			return portalUser.departmentRoles.map((a) => a.facility?.name ?? '—').join(' ');
		}
		return '';
	}

	function inviteRoleText(
		invite: Awaited<ReturnType<typeof getInvites>>[number],
		roles: Awaited<ReturnType<typeof getAccessRoles>>
	): string {
		if (invite.portalRole === 'admin') return 'admin';
		if (invite.assignments?.length) {
			return invite.assignments.map((a) => lookupName(roles, a.roleId)).join(' ');
		}
		return '';
	}

	function inviteDepartmentText(
		invite: Awaited<ReturnType<typeof getInvites>>[number],
		departments: Awaited<ReturnType<typeof getAllDepartments>>
	): string {
		if (!invite.assignments?.length) return '';
		return invite.assignments.map((a) => lookupName(departments, a.departmentId)).join(' ');
	}

	function inviteFacilityText(
		invite: Awaited<ReturnType<typeof getInvites>>[number],
		facilities: Awaited<ReturnType<typeof getAllFacilities>>
	): string {
		if (!invite.assignments?.length) return '';
		return invite.assignments.map((a) => lookupName(facilities, a.facilityId)).join(' ');
	}
</script>

<svelte:boundary>
	{@const [users, invites, departments, roles, facilities] = await Promise.all([
		getPortalUsers(),
		getInvites(),
		getAllDepartments(),
		getAccessRoles(),
		getAllFacilities()
	])}

	<InviteUserDialog bind:this={inviteDialog} />
	<EditUserAccessDialog bind:this={editUserDialog} />

	<div class="mb-6 flex items-center justify-between">
		<h1 class="text-2xl font-bold">Users</h1>
		<button type="button" class="btn btn-primary gap-2" onclick={() => inviteDialog?.open()}>
			<Plus class="h-4 w-4" />
			Invite user
		</button>
	</div>

	<div class="mb-10">
		<h2 class="mb-4 text-lg font-semibold">Users</h2>
		<DataTable rows={users} rowKey={(portalUser) => portalUser.id} emptyMessage="No users yet.">
			{#snippet actions({ row: portalUser })}
				{#if portalUser.id !== page.data.user?.id}
					<IconActionButton
						label="Edit"
						variant="secondary"
						onclick={() => editUserDialog?.open(portalUser)}
					>
						<Pencil class="h-4 w-4" />
					</IconActionButton>
				{/if}
			{/snippet}

			<DataTableColumn label="Name" firstData filterText={(portalUser) => portalUser.name}>
				{#snippet children({ row: portalUser })}
					{portalUser.name}
				{/snippet}
			</DataTableColumn>

			<DataTableColumn label="Email" filterText={(portalUser) => portalUser.email}>
				{#snippet children({ row: portalUser })}
					{portalUser.email}
				{/snippet}
			</DataTableColumn>

			<DataTableColumn label="Role" filterText={portalUserRoleText}>
				{#snippet children({ row: portalUser })}
					{#if portalUser.profile?.portalRole === 'member' && portalUser.departmentRoles?.length}
						<ul class="space-y-1 text-sm">
							{#each portalUser.departmentRoles as assignment (assignment.id)}
								<li>{assignment.role?.name ?? '—'}</li>
							{/each}
						</ul>
					{:else}
						<span class="badge badge-outline">{portalUser.profile?.portalRole ?? 'guest'}</span>
					{/if}
				{/snippet}
			</DataTableColumn>

			<DataTableColumn label="Department" filterText={portalUserDepartmentText}>
				{#snippet children({ row: portalUser })}
					{#if portalUser.profile?.portalRole === 'member' && portalUser.departmentRoles?.length}
						<ul class="space-y-1 text-sm">
							{#each portalUser.departmentRoles as assignment (assignment.id)}
								<li>{assignment.department.name}</li>
							{/each}
						</ul>
					{:else}
						<span class="text-base-content/50">—</span>
					{/if}
				{/snippet}
			</DataTableColumn>

			<DataTableColumn label="Facility" filterText={portalUserFacilityText}>
				{#snippet children({ row: portalUser })}
					{#if portalUser.profile?.portalRole === 'member' && portalUser.departmentRoles?.length}
						<ul class="space-y-1 text-sm">
							{#each portalUser.departmentRoles as assignment (assignment.id)}
								<li>{assignment.facility?.name ?? '—'}</li>
							{/each}
						</ul>
					{:else}
						<span class="text-base-content/50">—</span>
					{/if}
				{/snippet}
			</DataTableColumn>
		</DataTable>
	</div>

	<div>
		<h2 class="mb-4 text-lg font-semibold">Invites</h2>
		<DataTable
			rows={invites}
			rowKey={(invite) => invite.id}
			emptyMessage="No invites yet."
		>
			{#snippet actions({ row: invite })}
				{#if invite.status === 'pending' || invite.status === 'expired' || invite.status === 'revoked'}
					<IconActionButton
						label="Resend"
						variant="secondary"
						disabled={actionLoading.isPending(`resend:${invite.id}`)}
						onclick={async () => {
							await actionLoading.run(`resend:${invite.id}`, async () => {
								await resendInvite(invite.id);
							});
						}}
					>
						{#if actionLoading.isPending(`resend:${invite.id}`)}
							<LoadingSpinner size="sm" />
						{:else}
							<RefreshCw class="h-4 w-4" />
						{/if}
					</IconActionButton>
				{/if}
				{#if invite.status === 'pending'}
					<IconActionButton
						label="Revoke"
						variant="error"
						disabled={actionLoading.isPending(`revoke:${invite.id}`)}
						onclick={async () => {
							if (!confirm('Revoke this invite?')) return;
							await actionLoading.run(`revoke:${invite.id}`, async () => {
								await revokeInvite(invite.id);
							});
						}}
					>
						{#if actionLoading.isPending(`revoke:${invite.id}`)}
							<LoadingSpinner size="sm" />
						{:else}
							<Ban class="h-4 w-4" />
						{/if}
					</IconActionButton>
				{/if}
			{/snippet}

			<DataTableColumn label="Name" firstData filterText={(invite) => invite.name}>
				{#snippet children({ row: invite })}
					{invite.name}
				{/snippet}
			</DataTableColumn>

			<DataTableColumn label="Email" filterText={(invite) => invite.email}>
				{#snippet children({ row: invite })}
					{invite.email}
				{/snippet}
			</DataTableColumn>

			<DataTableColumn
				label="Role"
				filterText={(invite) => inviteRoleText(invite, roles)}
			>
				{#snippet children({ row: invite })}
					{#if invite.portalRole === 'admin'}
						<span class="badge badge-outline">admin</span>
					{:else if invite.assignments?.length}
						<ul class="space-y-1 text-sm">
							{#each invite.assignments as assignment, index (index)}
								<li>{lookupName(roles, assignment.roleId)}</li>
							{/each}
						</ul>
					{:else}
						<span class="text-base-content/50">—</span>
					{/if}
				{/snippet}
			</DataTableColumn>

			<DataTableColumn
				label="Department"
				filterText={(invite) => inviteDepartmentText(invite, departments)}
			>
				{#snippet children({ row: invite })}
					{#if invite.assignments?.length}
						<ul class="space-y-1 text-sm">
							{#each invite.assignments as assignment, index (index)}
								<li>{lookupName(departments, assignment.departmentId)}</li>
							{/each}
						</ul>
					{:else}
						<span class="text-base-content/50">—</span>
					{/if}
				{/snippet}
			</DataTableColumn>

			<DataTableColumn
				label="Facility"
				filterText={(invite) => inviteFacilityText(invite, facilities)}
			>
				{#snippet children({ row: invite })}
					{#if invite.assignments?.length}
						<ul class="space-y-1 text-sm">
							{#each invite.assignments as assignment, index (index)}
								<li>{lookupName(facilities, assignment.facilityId)}</li>
							{/each}
						</ul>
					{:else}
						<span class="text-base-content/50">—</span>
					{/if}
				{/snippet}
			</DataTableColumn>

			<DataTableColumn label="Status" filterText={(invite) => invite.status}>
				{#snippet children({ row: invite })}
					<span class="badge badge-outline">{invite.status}</span>
				{/snippet}
			</DataTableColumn>

			<DataTableColumn
				label="Expires"
				filterText={(invite) => new Date(invite.expiresAt).toLocaleString()}
			>
				{#snippet children({ row: invite })}
					{new Date(invite.expiresAt).toLocaleString()}
				{/snippet}
			</DataTableColumn>
		</DataTable>
	</div>

	{#snippet pending()}
		<LoadingCenter />
	{/snippet}

	{#snippet failed(error)}
		<div class="alert alert-error">
			<span>{error instanceof Error ? error.message : 'Failed to load users'}</span>
		</div>
	{/snippet}
</svelte:boundary>
