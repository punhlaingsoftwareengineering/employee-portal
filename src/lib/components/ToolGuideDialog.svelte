<script lang="ts">
	import type { ToolGuide } from '$lib/server/db/schema/tool-guide';
	import {
		createToolGuide,
		updateToolGuide,
		getToolGuides
	} from '$lib/remotes/tool-guide.remote';
	import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';

	let dialog = $state<HTMLDialogElement | null>(null);
	let editingGuide = $state<ToolGuide | null>(null);
	let title = $state('');
	let description = $state('');
	let pdfUrl = $state('');
	let sortOrder = $state(0);
	let submitting = $state(false);
	let error = $state<string | null>(null);

	const isEdit = $derived(Boolean(editingGuide?.id));

	export function open(existing?: ToolGuide | null) {
		editingGuide = existing ?? null;
		error = null;
		title = existing?.title ?? '';
		description = existing?.description ?? '';
		pdfUrl = existing?.pdfUrl ?? '';
		sortOrder = existing?.sortOrder ?? 0;
		dialog?.showModal();
	}

	function close() {
		dialog?.close();
		editingGuide = null;
		error = null;
		submitting = false;
	}

	function resetForm() {
		editingGuide = null;
		error = null;
		submitting = false;
		title = '';
		description = '';
		pdfUrl = '';
		sortOrder = 0;
	}

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		submitting = true;
		error = null;

		try {
			const trimmedTitle = title.trim();
			const trimmedPdfUrl = pdfUrl.trim();
			const trimmedDescription = description.trim();

			if (!trimmedTitle) {
				error = 'Title is required';
				return;
			}
			if (!trimmedPdfUrl) {
				error = 'PDF link is required';
				return;
			}

			const payload = {
				title: trimmedTitle,
				pdfUrl: trimmedPdfUrl,
				description: trimmedDescription || undefined,
				sortOrder
			};

			if (editingGuide?.id) {
				await updateToolGuide({ id: editingGuide.id, ...payload });
			} else {
				await createToolGuide(payload);
			}

			void getToolGuides().refresh();
			close();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to save guide';
		} finally {
			submitting = false;
		}
	}
</script>

<dialog bind:this={dialog} class="modal" onclose={resetForm}>
	<div class="modal-box modal-box-fit">
		<h3 class="text-lg font-bold">{isEdit ? 'Edit guide' : 'Add guide'}</h3>

		<form class="mt-6" onsubmit={handleSubmit}>
			<table class="form-table">
				<tbody>
					<tr>
						<td class="form-table-label">Title</td>
						<td class="form-table-field">
							<input
								type="text"
								bind:value={title}
								class="input input-bordered w-full max-w-md"
								required
								maxlength="200"
								placeholder="Employee handbook"
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
								placeholder="Optional summary shown on the card"
							></textarea>
						</td>
					</tr>
					<tr>
						<td class="form-table-label">PDF link</td>
						<td class="form-table-field">
							<input
								type="url"
								bind:value={pdfUrl}
								class="input input-bordered w-full max-w-md"
								required
								placeholder="https://example.com/guide.pdf"
							/>
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
						{isEdit ? 'Save guide' : 'Add guide'}
					{/if}
				</button>
			</div>
		</form>
	</div>
	<form method="dialog" class="modal-backdrop">
		<button aria-label="Close dialog">close</button>
	</form>
</dialog>
