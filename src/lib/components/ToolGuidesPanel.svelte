<script lang="ts">
	import { page } from '$app/state';
	import { BookOpen, ExternalLink, FileText, Pencil, Plus, Trash2 } from '@lucide/svelte';
	import ToolGuideDialog from '$lib/components/ToolGuideDialog.svelte';
	import IconActionButton from '$lib/components/IconActionButton.svelte';
	import LoadingCenter from '$lib/components/LoadingCenter.svelte';
	import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
	import { createKeyedLoading } from '$lib/keyed-loading.svelte';
	import { deleteToolGuide, getToolGuides } from '$lib/remotes/tool-guide.remote';

	const isAdmin = $derived(page.data.permissions?.isAdmin ?? false);
	let guideDialog = $state<ToolGuideDialog | null>(null);
	const deleteLoading = createKeyedLoading();
</script>

<svelte:boundary>
	{@const guides = await getToolGuides()}

	<ToolGuideDialog bind:this={guideDialog} />

	{#if isAdmin}
		<div class="mb-4 flex justify-end">
			<button type="button" class="btn btn-primary btn-sm gap-2" onclick={() => guideDialog?.open()}>
				<Plus class="h-4 w-4" />
				Add guide
			</button>
		</div>
	{/if}

	{#if guides.length === 0}
		<div class="card bg-base-100 shadow-sm">
			<div class="card-body items-center text-center">
				<BookOpen class="h-10 w-10 text-base-content/30" />
				<p class="text-base-content/70">No guides yet.</p>
				{#if isAdmin}
					<p class="text-sm text-base-content/50">Add a PDF link to get started.</p>
				{/if}
			</div>
		</div>
	{:else}
		<ul class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{#each guides as item (item.id)}
				<li class="card bg-base-100 shadow-sm">
					<div class="card-body gap-3">
						<div class="flex items-start justify-between gap-2">
							<div class="flex min-w-0 items-start gap-3">
								<div
									class="flex h-10 w-10 shrink-0 items-center justify-center rounded-box bg-primary/10 text-primary"
								>
									<FileText class="h-5 w-5" />
								</div>
								<div class="min-w-0">
									<h3 class="font-semibold leading-tight">{item.title}</h3>
									{#if item.description}
										<p class="mt-1 line-clamp-2 text-sm text-base-content/70">
											{item.description}
										</p>
									{/if}
								</div>
							</div>
							{#if isAdmin}
								<div class="flex shrink-0 gap-1">
									<IconActionButton
										label="Edit"
										variant="secondary"
										onclick={() => guideDialog?.open(item)}
									>
										<Pencil class="h-4 w-4" />
									</IconActionButton>
									<IconActionButton
										label="Delete"
										variant="error"
										disabled={deleteLoading.isPending(item.id)}
										onclick={async () => {
											if (!confirm(`Delete guide "${item.title}"?`)) return;
											await deleteLoading.run(item.id, async () => {
												await deleteToolGuide(item.id);
											});
										}}
									>
										{#if deleteLoading.isPending(item.id)}
											<LoadingSpinner size="sm" />
										{:else}
											<Trash2 class="h-4 w-4" />
										{/if}
									</IconActionButton>
								</div>
							{/if}
						</div>
						<a
							href={item.pdfUrl}
							class="btn btn-outline btn-sm gap-2 self-start"
							target="_blank"
							rel="noopener noreferrer"
						>
							Open PDF
							<ExternalLink class="h-4 w-4" />
						</a>
					</div>
				</li>
			{/each}
		</ul>
	{/if}

	{#snippet pending()}
		<LoadingCenter />
	{/snippet}

	{#snippet failed(error)}
		<div class="alert alert-error">
			<span>{error instanceof Error ? error.message : 'Failed to load guides'}</span>
		</div>
	{/snippet}
</svelte:boundary>
