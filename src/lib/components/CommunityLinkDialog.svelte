<script lang="ts">
	import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
	import {
		COMMUNITY_PLATFORM_OPTIONS,
		DEFAULT_COMMUNITY_PLATFORM,
		type CommunityPlatform
	} from '$lib/constants/community';
	import type { CommunityCategory } from '$lib/server/db/schema/community-category';
	import type { CommunityLink } from '$lib/server/db/schema/community-link';
	import {
		createCommunityLink,
		updateCommunityLink
	} from '$lib/remotes/community-link.remote';
	import { getCommunityCategories } from '$lib/remotes/community-category.remote';
	import {
		getCommunityPlatformColorClass,
		getCommunityPlatformIcon
	} from '$lib/utils/community-platform';

	let {
		categories = []
	}: {
		categories?: CommunityCategory[];
	} = $props();

	let dialog = $state<HTMLDialogElement | null>(null);
	let editingItem = $state<CommunityLink | null>(null);
	let defaultCategoryId = $state<string | null>(null);
	let categoryId = $state('');
	let title = $state('');
	let description = $state('');
	let url = $state('');
	let platform = $state<CommunityPlatform>(DEFAULT_COMMUNITY_PLATFORM);
	let sortOrder = $state(0);
	let showQr = $state(true);
	let isPublic = $state(true);
	let submitting = $state(false);
	let error = $state<string | null>(null);

	const isEdit = $derived(Boolean(editingItem?.id));
	const PlatformIcon = $derived(getCommunityPlatformIcon(platform));
	const platformPreviewClass = $derived(getCommunityPlatformColorClass(platform));

	export function open(existing?: CommunityLink | null, categoryIdOverride?: string | null) {
		editingItem = existing ?? null;
		defaultCategoryId = categoryIdOverride ?? existing?.categoryId ?? categories[0]?.id ?? null;
		error = null;
		categoryId = defaultCategoryId ?? '';
		title = existing?.title ?? '';
		description = existing?.description ?? '';
		url = existing?.url ?? '';
		platform = existing?.platform ?? DEFAULT_COMMUNITY_PLATFORM;
		sortOrder = existing?.sortOrder ?? 0;
		showQr = existing?.showQr ?? true;
		isPublic = existing?.isPublic ?? true;
		dialog?.showModal();
	}

	function close() {
		dialog?.close();
		editingItem = null;
		error = null;
		submitting = false;
	}

	function resetForm() {
		editingItem = null;
		defaultCategoryId = null;
		error = null;
		submitting = false;
		categoryId = '';
		title = '';
		description = '';
		url = '';
		platform = DEFAULT_COMMUNITY_PLATFORM;
		sortOrder = 0;
		showQr = true;
		isPublic = true;
	}

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		submitting = true;
		error = null;

		try {
			const trimmedTitle = title.trim();
			const trimmedUrl = url.trim();
			const trimmedDescription = description.trim();

			if (!categoryId) {
				error = 'Category is required';
				return;
			}
			if (!trimmedTitle) {
				error = 'Title is required';
				return;
			}
			if (!trimmedUrl) {
				error = 'URL is required';
				return;
			}

			const payload = {
				categoryId,
				title: trimmedTitle,
				url: trimmedUrl,
				description: trimmedDescription || undefined,
				platform,
				sortOrder,
				showQr,
				isPublic
			};

			if (editingItem?.id) {
				await updateCommunityLink({ id: editingItem.id, ...payload });
			} else {
				await createCommunityLink(payload);
			}

			void getCommunityCategories().refresh();
			close();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to save link';
		} finally {
			submitting = false;
		}
	}
</script>

<dialog bind:this={dialog} class="modal" onclose={resetForm}>
	<div class="modal-box modal-box-fit">
		<h3 class="text-lg font-bold">{isEdit ? 'Edit link' : 'Add link'}</h3>

		<form class="mt-6" onsubmit={handleSubmit}>
			<table class="form-table">
				<tbody>
					<tr>
						<td class="form-table-label">Category</td>
						<td class="form-table-field">
							<select
								bind:value={categoryId}
								class="select select-bordered w-full max-w-md"
								required
							>
								<option value="" disabled>Select a category</option>
								{#each categories as category (category.id)}
									<option value={category.id}>{category.name}</option>
								{/each}
							</select>
						</td>
					</tr>
					<tr>
						<td class="form-table-label">Title</td>
						<td class="form-table-field">
							<input
								type="text"
								bind:value={title}
								class="input input-bordered w-full max-w-md"
								required
								maxlength="200"
								placeholder="Company Facebook page"
							/>
						</td>
					</tr>
					<tr>
						<td class="form-table-label">Description</td>
						<td class="form-table-field">
							<textarea
								bind:value={description}
								class="textarea textarea-bordered w-full max-w-md"
								rows="2"
								maxlength="1000"
								placeholder="Optional short description"
							></textarea>
						</td>
					</tr>
					<tr>
						<td class="form-table-label">URL</td>
						<td class="form-table-field">
							<input
								type="url"
								bind:value={url}
								class="input input-bordered w-full max-w-md"
								required
								placeholder="https://…"
							/>
						</td>
					</tr>
					<tr>
						<td class="form-table-label">Platform</td>
						<td class="form-table-field">
							<div class="flex items-center gap-3">
								<select
									bind:value={platform}
									class="select select-bordered w-full max-w-md"
								>
									{#each COMMUNITY_PLATFORM_OPTIONS as option (option.value)}
										<option value={option.value}>{option.label}</option>
									{/each}
								</select>
								<div
									class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white {platformPreviewClass}"
								>
									<PlatformIcon class="h-5 w-5" />
								</div>
							</div>
						</td>
					</tr>
					<tr>
						<td class="form-table-label">Sort order</td>
						<td class="form-table-field">
							<input
								type="number"
								bind:value={sortOrder}
								class="input input-bordered w-full max-w-xs"
								min="0"
								max="9999"
							/>
						</td>
					</tr>
					<tr>
						<td class="form-table-label">Visibility</td>
						<td class="form-table-field">
							<label class="label cursor-pointer justify-start gap-3">
								<input type="checkbox" class="checkbox checkbox-primary" bind:checked={isPublic} />
								<span class="label-text">Show on the community page (no sign-in required)</span>
							</label>
							{#if !isPublic}
								<p class="mt-1 text-xs text-base-content/60">
									Assign this link to roles on the Roles page for signed-in members.
								</p>
							{/if}
						</td>
					</tr>
					<tr>
						<td class="form-table-label">QR code</td>
						<td class="form-table-field">
							<label class="label cursor-pointer justify-start gap-3">
								<input type="checkbox" class="checkbox checkbox-sm" bind:checked={showQr} />
								<span class="label-text">Show QR code on the public card</span>
							</label>
						</td>
					</tr>
				</tbody>
			</table>

			{#if error}
				<div class="alert alert-error mt-4">
					<span>{error}</span>
				</div>
			{/if}

			<div class="modal-action">
				<button type="button" class="btn btn-ghost" onclick={close} disabled={submitting}>
					Cancel
				</button>
				<button type="submit" class="btn btn-primary" disabled={submitting}>
					{#if submitting}
						<LoadingSpinner size="sm" />
					{:else}
						{isEdit ? 'Save link' : 'Add link'}
					{/if}
				</button>
			</div>
		</form>
	</div>
	<form method="dialog" class="modal-backdrop">
		<button aria-label="Close dialog">close</button>
	</form>
</dialog>
