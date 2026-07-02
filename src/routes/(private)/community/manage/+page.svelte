<script lang="ts">
	import { ExternalLink, Pencil, Plus, Share2, Trash2 } from '@lucide/svelte';
	import CommunityCategoryDialog from '$lib/components/CommunityCategoryDialog.svelte';
	import CommunityLinkDialog from '$lib/components/CommunityLinkDialog.svelte';
	import IconActionButton from '$lib/components/IconActionButton.svelte';
	import LoadingCenter from '$lib/components/LoadingCenter.svelte';
	import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
	import PrivatePageHeader from '$lib/components/PrivatePageHeader.svelte';
	import { COMMUNITY_PLATFORM_LABELS } from '$lib/constants/community';
	import { createKeyedLoading } from '$lib/keyed-loading.svelte';
	import { deleteCommunityCategory, getCommunityCategories } from '$lib/remotes/community-category.remote';
	import { deleteCommunityLink } from '$lib/remotes/community-link.remote';
	import {
		getCommunityPlatformColorClass,
		getCommunityPlatformIcon
	} from '$lib/utils/community-platform';

	let categoryDialog = $state<CommunityCategoryDialog | null>(null);
	let linkDialog = $state<CommunityLinkDialog | null>(null);
	const deleteCategoryLoading = createKeyedLoading();
	const deleteLinkLoading = createKeyedLoading();
</script>

<svelte:boundary>
	{@const categories = await getCommunityCategories()}

	<CommunityCategoryDialog bind:this={categoryDialog} />
	<CommunityLinkDialog bind:this={linkDialog} {categories} />

	<PrivatePageHeader title="Manage community" icon={Share2} />

	<p class="text-base-content/70">
		Organize community links by category for the public community page.
	</p>

	<div class="mb-6 flex justify-end">
		<button
			type="button"
			class="btn btn-primary btn-sm gap-2"
			onclick={() => categoryDialog?.open()}
		>
			<Plus class="h-4 w-4" />
			Add category
		</button>
	</div>

	{#if categories.length === 0}
		<div class="card bg-base-100 shadow-sm">
			<div class="card-body items-center text-center">
				<Share2 class="h-10 w-10 text-base-content/30" />
				<p class="text-base-content/70">No community categories yet.</p>
				<p class="text-sm text-base-content/50">Add a category, then add links with URLs and icons.</p>
			</div>
		</div>
	{:else}
		<div class="flex flex-col gap-6">
			{#each categories as category (category.id)}
				<section class="card bg-base-100 shadow-sm">
					<div class="card-body gap-4">
						<div class="flex flex-wrap items-start justify-between gap-3">
							<div class="min-w-0">
								<div class="flex flex-wrap items-center gap-2">
									<h2 class="text-xl font-bold">{category.name}</h2>
									<span class="badge badge-ghost badge-sm">Order {category.sortOrder}</span>
								</div>
								{#if category.description}
									<p class="mt-1 text-sm text-base-content/70">{category.description}</p>
								{/if}
							</div>
							<div class="flex flex-wrap gap-2">
								<button
									type="button"
									class="btn btn-outline btn-sm gap-2"
									onclick={() => linkDialog?.open(null, category.id)}
								>
									<Plus class="h-4 w-4" />
									Add link
								</button>
								<IconActionButton
									label="Edit category"
									variant="secondary"
									onclick={() => categoryDialog?.open(category)}
								>
									<Pencil class="h-4 w-4" />
								</IconActionButton>
								<IconActionButton
									label="Delete category"
									variant="error"
									disabled={deleteCategoryLoading.isPending(category.id)}
									onclick={async () => {
										if (
											!confirm(
												`Delete category "${category.name}" and all of its links?`
											)
										) {
											return;
										}
										await deleteCategoryLoading.run(category.id, async () => {
											await deleteCommunityCategory(category.id);
										});
									}}
								>
									{#if deleteCategoryLoading.isPending(category.id)}
										<LoadingSpinner size="sm" />
									{:else}
										<Trash2 class="h-4 w-4" />
									{/if}
								</IconActionButton>
							</div>
						</div>

						{#if category.links.length === 0}
							<p class="text-sm text-base-content/60">No links in this category yet.</p>
						{:else}
							<ul class="grid gap-3">
								{#each category.links as link (link.id)}
									{@const PlatformIcon = getCommunityPlatformIcon(link.platform)}
									<li
										class="flex flex-wrap items-center justify-between gap-3 rounded-box border border-base-300 p-4"
									>
										<div class="flex min-w-0 items-start gap-3">
											<div
												class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white {getCommunityPlatformColorClass(link.platform)}"
											>
												<PlatformIcon class="h-5 w-5" />
											</div>
											<div class="min-w-0">
												<div class="flex flex-wrap items-center gap-2">
													<h3 class="font-semibold">{link.title}</h3>
													<span class="badge badge-outline badge-sm">
														{COMMUNITY_PLATFORM_LABELS[link.platform]}
													</span>
													<span class="badge badge-ghost badge-sm">Order {link.sortOrder}</span>
													{#if link.isPublic}
														<span class="badge badge-success badge-sm">Public</span>
													{:else}
														<span class="badge badge-warning badge-sm">Role only</span>
													{/if}
													{#if link.showQr}
														<span class="badge badge-accent badge-sm">QR</span>
													{/if}
												</div>
												{#if link.description}
													<p class="mt-1 text-sm text-base-content/70">{link.description}</p>
												{/if}
												<a
													href={link.url}
													target="_blank"
													rel="noopener noreferrer"
													class="mt-2 inline-flex items-center gap-1 text-sm link link-primary"
												>
													{link.url}
													<ExternalLink class="h-3.5 w-3.5" />
												</a>
											</div>
										</div>
										<div class="flex shrink-0 gap-1">
											<IconActionButton
												label="Edit link"
												variant="secondary"
												onclick={() => linkDialog?.open(link)}
											>
												<Pencil class="h-4 w-4" />
											</IconActionButton>
											<IconActionButton
												label="Delete link"
												variant="error"
												disabled={deleteLinkLoading.isPending(link.id)}
												onclick={async () => {
													if (!confirm(`Delete link "${link.title}"?`)) return;
													await deleteLinkLoading.run(link.id, async () => {
														await deleteCommunityLink(link.id);
													});
												}}
											>
												{#if deleteLinkLoading.isPending(link.id)}
													<LoadingSpinner size="sm" />
												{:else}
													<Trash2 class="h-4 w-4" />
												{/if}
											</IconActionButton>
										</div>
									</li>
								{/each}
							</ul>
						{/if}
					</div>
				</section>
			{/each}
		</div>
	{/if}

	{#snippet pending()}
		<PrivatePageHeader title="Manage community" icon={Share2} />
		<p class="text-base-content/70">Organize community links by category.</p>
		<LoadingCenter />
	{/snippet}

	{#snippet failed(error)}
		<div class="alert alert-error">
			<span>{error instanceof Error ? error.message : 'Failed to load community content'}</span>
		</div>
	{/snippet}
</svelte:boundary>
