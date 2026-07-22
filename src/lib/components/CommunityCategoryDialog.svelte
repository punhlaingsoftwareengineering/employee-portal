<script lang="ts">
	import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
	import type { CommunityCategory } from '$lib/server/db/schema/community-category';
	import {
		createCommunityCategory,
		getCommunityCategories,
		updateCommunityCategory
	} from '$lib/remotes/community-category.remote';
	import { withFormFeedback } from '$lib/form-feedback.svelte';

	let dialog = $state<HTMLDialogElement | null>(null);
	let editingItem = $state<CommunityCategory | null>(null);
	let name = $state('');
	let description = $state('');
	let sortOrder = $state(0);
	let submitting = $state(false);
	let error = $state<string | null>(null);

	const isEdit = $derived(Boolean(editingItem?.id));

	export function open(existing?: CommunityCategory | null) {
		editingItem = existing ?? null;
		error = null;
		name = existing?.name ?? '';
		description = existing?.description ?? '';
		sortOrder = existing?.sortOrder ?? 0;
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
		error = null;
		submitting = false;
		name = '';
		description = '';
		sortOrder = 0;
	}

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		submitting = true;
		error = null;

		try {
			const trimmedName = name.trim();
			const trimmedDescription = description.trim();

			if (!trimmedName) {
				error = 'Name is required';
				return;
			}

			await withFormFeedback({
				successMessage: isEdit ? 'Category updated' : 'Category created',
				action: async () => {
					const payload = {
						name: trimmedName,
						description: trimmedDescription || undefined,
						sortOrder
					};

					if (editingItem?.id) {
						await updateCommunityCategory({ id: editingItem.id, ...payload });
					} else {
						await createCommunityCategory(payload);
					}

					void getCommunityCategories().refresh();
				}
			});
			close();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to save category';
		} finally {
			submitting = false;
		}
	}
</script>

<dialog bind:this={dialog} class="modal" onclose={resetForm}>
	<div class="modal-box modal-box-fit">
		<h3 class="text-lg font-bold">{isEdit ? 'Edit category' : 'Add category'}</h3>

		<form class="mt-6" onsubmit={handleSubmit}>
			<table class="form-table">
				<tbody>
					<tr>
						<td class="form-table-label">Name</td>
						<td class="form-table-field">
							<input
								type="text"
								bind:value={name}
								class="input input-bordered w-full max-w-md"
								required
								maxlength="120"
								placeholder="Social channels"
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
								placeholder="Optional section intro shown on the public page"
							></textarea>
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
							<p class="mt-1 text-xs text-base-content/60">Lower numbers appear first.</p>
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
						{isEdit ? 'Save category' : 'Add category'}
					{/if}
				</button>
			</div>
		</form>
	</div>
	<form method="dialog" class="modal-backdrop">
		<button aria-label="Close dialog">close</button>
	</form>
</dialog>
