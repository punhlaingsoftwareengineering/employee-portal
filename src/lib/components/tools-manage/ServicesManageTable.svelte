<script lang="ts">
	import { Plus, ExternalLink, Pencil, Trash2 } from '@lucide/svelte';
	import ServiceDialog from '$lib/components/ServiceDialog.svelte';
	import DataTable from '$lib/components/DataTable.svelte';
	import DataTableColumn from '$lib/components/DataTableColumn.svelte';
	import IconActionButton from '$lib/components/IconActionButton.svelte';
	import ServiceIcon from '$lib/components/ServiceIcon.svelte';
	import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
	import { createKeyedLoading } from '$lib/keyed-loading.svelte';
	import { deleteService } from '$lib/remotes/service.remote';
	import { isBuiltinServiceId } from '$lib/constants/builtin-services';
	import { accentGradientBackground } from '$lib/utils/accent-gradient';
	import type { getServices } from '$lib/remotes/service.remote';

	let {
		services
	}: {
		services: Awaited<ReturnType<typeof getServices>>;
	} = $props();

	let serviceDialog = $state<ServiceDialog | null>(null);
	const deleteLoading = createKeyedLoading();
</script>

<ServiceDialog bind:this={serviceDialog} />

<div class="mb-4 flex items-center justify-end">
	<button type="button" class="btn btn-primary gap-2" onclick={() => serviceDialog?.open()}>
		<Plus class="h-4 w-4" />
		New service
	</button>
</div>

<DataTable rows={services} rowKey={(item) => item.id} emptyMessage="No services yet.">
	{#snippet actions({ row: item })}
		<IconActionButton label="Open" href={item.link} external>
			<ExternalLink class="h-4 w-4" />
		</IconActionButton>
		<IconActionButton
			label="Edit"
			variant="secondary"
			onclick={() => serviceDialog?.open(item)}
		>
			<Pencil class="h-4 w-4" />
		</IconActionButton>
		{#if !isBuiltinServiceId(item.id)}
			<IconActionButton
				label="Delete"
				variant="error"
				disabled={deleteLoading.isPending(item.id)}
				onclick={async () => {
					if (!confirm(`Delete service "${item.name}"?`)) return;
					await deleteLoading.run(item.id, async () => {
						await deleteService(item.id);
					});
				}}
			>
				{#if deleteLoading.isPending(item.id)}
					<LoadingSpinner size="sm" />
				{:else}
					<Trash2 class="h-4 w-4" />
				{/if}
			</IconActionButton>
		{/if}
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

	<DataTableColumn label="Category" filterText={(item) => item.category ?? ''}>
		{#snippet children({ row: item })}
			{item.category ?? '—'}
		{/snippet}
	</DataTableColumn>

	<DataTableColumn label="Accent" filterText={(item) => item.accentColor ?? ''}>
		{#snippet children({ row: item })}
			{#if item.accentColor}
				<span
					class="inline-block size-5 rounded-full border border-base-300"
					style:background={accentGradientBackground(item.accentColor)}
					title={item.accentColor}
				></span>
			{:else}
				<span class="text-base-content/50">—</span>
			{/if}
		{/snippet}
	</DataTableColumn>

	<DataTableColumn
		label="Description"
		class="max-w-xs"
		filterText={(item) => item.description ?? ''}
	>
		{#snippet children({ row: item })}
			<span class="block truncate text-sm text-base-content/70">
				{item.description ?? '—'}
			</span>
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

	<DataTableColumn label="Link" filterText={(item) => item.link}>
		{#snippet children({ row: item })}
			<a
				href={item.link}
				target="_blank"
				rel="noopener noreferrer"
				class="link link-primary text-sm"
			>
				{item.link}
			</a>
		{/snippet}
	</DataTableColumn>
</DataTable>
