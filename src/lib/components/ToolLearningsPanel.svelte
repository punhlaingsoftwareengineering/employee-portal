<script lang="ts">
	import { page } from '$app/state';
	import { ExternalLink, GraduationCap, Pencil, Play, Plus, Trash2 } from '@lucide/svelte';
	import ToolLearningDialog from '$lib/components/ToolLearningDialog.svelte';
	import IconActionButton from '$lib/components/IconActionButton.svelte';
	import LoadingCenter from '$lib/components/LoadingCenter.svelte';
	import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
	import { createKeyedLoading } from '$lib/keyed-loading.svelte';
	import { deleteToolLearning, getToolLearnings } from '$lib/remotes/tool-learning.remote';

	const isAdmin = $derived(page.data.permissions?.isAdmin ?? false);
	let learningDialog = $state<ToolLearningDialog | null>(null);
	const deleteLoading = createKeyedLoading();
</script>

<svelte:boundary>
	{@const learnings = await getToolLearnings()}

	<ToolLearningDialog bind:this={learningDialog} />

	{#if isAdmin}
		<div class="mb-4 flex justify-end">
			<button
				type="button"
				class="btn btn-primary btn-sm gap-2"
				onclick={() => learningDialog?.open()}
			>
				<Plus class="h-4 w-4" />
				Add learning
			</button>
		</div>
	{/if}

	{#if learnings.length === 0}
		<div class="card bg-base-100 shadow-sm">
			<div class="card-body items-center text-center">
				<GraduationCap class="h-10 w-10 text-base-content/30" />
				<p class="text-base-content/70">No learning videos yet.</p>
				{#if isAdmin}
					<p class="text-sm text-base-content/50">Add a video link to get started.</p>
				{/if}
			</div>
		</div>
	{:else}
		<ul class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{#each learnings as item (item.id)}
				<li class="card bg-base-100 shadow-sm">
					<div class="card-body gap-3">
						<div class="flex items-start justify-between gap-2">
							<div class="flex min-w-0 items-start gap-3">
								<div
									class="flex h-10 w-10 shrink-0 items-center justify-center rounded-box bg-secondary/10 text-secondary"
								>
									<Play class="h-5 w-5" />
								</div>
								<div class="min-w-0">
									<div class="flex flex-wrap items-center gap-2">
										<h3 class="font-semibold leading-tight">{item.title}</h3>
										{#if item.duration}
											<span class="badge badge-ghost badge-sm">{item.duration}</span>
										{/if}
									</div>
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
										onclick={() => learningDialog?.open(item)}
									>
										<Pencil class="h-4 w-4" />
									</IconActionButton>
									<IconActionButton
										label="Delete"
										variant="error"
										disabled={deleteLoading.isPending(item.id)}
										onclick={async () => {
											if (!confirm(`Delete learning "${item.title}"?`)) return;
											await deleteLoading.run(item.id, async () => {
												await deleteToolLearning(item.id);
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
							href={item.videoUrl}
							class="btn btn-outline btn-sm gap-2 self-start"
							target="_blank"
							rel="noopener noreferrer"
						>
							Watch video
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
			<span>{error instanceof Error ? error.message : 'Failed to load learning items'}</span>
		</div>
	{/snippet}
</svelte:boundary>
