<script lang="ts">
	import { Plus, Eye, Pencil, Trash2 } from 'lucide-svelte';
	import AppDialog from '$lib/components/AppDialog.svelte';
	import DataTable from '$lib/components/DataTable.svelte';
	import DataTableColumn from '$lib/components/DataTableColumn.svelte';
	import IconActionButton from '$lib/components/IconActionButton.svelte';
	import ServiceIcon from '$lib/components/ServiceIcon.svelte';
	import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
	import { createKeyedLoading } from '$lib/keyed-loading.svelte';
	import { deleteApp } from '$lib/remotes/app.remote';
	import type { getApps } from '$lib/remotes/app.remote';

	let {
		apps
	}: {
		apps: Awaited<ReturnType<typeof getApps>>;
	} = $props();

	let appDialog = $state<AppDialog | null>(null);
	const deleteLoading = createKeyedLoading();
</script>

<AppDialog bind:this={appDialog} />

<div class="mb-4 flex items-center justify-end">
	<button type="button" class="btn btn-primary gap-2" onclick={() => appDialog?.open()}>
		<Plus class="h-4 w-4" />
		New app
	</button>
</div>

<DataTable rows={apps} rowKey={(item) => item.id} emptyMessage="No apps yet.">
	{#snippet actions({ row: item })}
		<IconActionButton label="View" href="/apps/{item.id}">
			<Eye class="h-4 w-4" />
		</IconActionButton>
		<IconActionButton label="Edit" variant="secondary" onclick={() => appDialog?.open(item)}>
			<Pencil class="h-4 w-4" />
		</IconActionButton>
		<IconActionButton
			label="Delete"
			variant="error"
			disabled={deleteLoading.isPending(item.id)}
			onclick={async () => {
				if (!confirm(`Delete app "${item.name}"?`)) return;
				await deleteLoading.run(item.id, async () => {
					await deleteApp(item.id);
				});
			}}
		>
			{#if deleteLoading.isPending(item.id)}
				<LoadingSpinner size="sm" />
			{:else}
				<Trash2 class="h-4 w-4" />
			{/if}
		</IconActionButton>
	{/snippet}

	<DataTableColumn label="Icon" filterText={(item) => item.iconUrl ?? item.name} class="w-10">
		{#snippet children({ row: item })}
			<ServiceIcon iconUrl={item.iconUrl} name={item.name} class="h-5 w-5" />
		{/snippet}
	</DataTableColumn>

	<DataTableColumn label="Name" firstData filterText={(item) => item.name}>
		{#snippet children({ row: item })}
			{item.name}
		{/snippet}
	</DataTableColumn>

	<DataTableColumn label="Tagline" class="max-w-xs" filterText={(item) => item.tagline ?? ''}>
		{#snippet children({ row: item })}
			<span class="block truncate text-sm text-base-content/70">
				{item.tagline ?? '—'}
			</span>
		{/snippet}
	</DataTableColumn>

	<DataTableColumn label="Category" filterText={(item) => item.category ?? ''}>
		{#snippet children({ row: item })}
			{item.category ?? '—'}
		{/snippet}
	</DataTableColumn>

	<DataTableColumn label="Public" filterText={(item) => (item.isPublic ? 'public yes' : 'private no')}>
		{#snippet children({ row: item })}
			{#if item.isPublic}
				<span class="badge badge-success badge-sm">Public</span>
			{:else}
				<span class="text-base-content/50">—</span>
			{/if}
		{/snippet}
	</DataTableColumn>

	<DataTableColumn label="Version" filterText={(item) => item.version ?? ''}>
		{#snippet children({ row: item })}
			{item.version ?? '—'}
		{/snippet}
	</DataTableColumn>
</DataTable>
