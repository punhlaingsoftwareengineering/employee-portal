<script lang="ts">
	import type { Newsletter } from '$lib/server/db/schema/newsletter';
	import {
		createNewsletter,
		updateNewsletter,
		getNewsletters
	} from '$lib/remotes/newsletter.remote';
	import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';

	let dialog = $state<HTMLDialogElement | null>(null);
	let editingNewsletter = $state<Newsletter | null>(null);
	let title = $state('');
	let pdfUrl = $state('');
	let submitting = $state(false);
	let error = $state<string | null>(null);

	const isEdit = $derived(Boolean(editingNewsletter?.id));

	export function open(existing?: Newsletter | null) {
		editingNewsletter = existing ?? null;
		error = null;
		title = existing?.title ?? '';
		pdfUrl = existing?.pdfUrl ?? '';
		dialog?.showModal();
	}

	function close() {
		dialog?.close();
		editingNewsletter = null;
		error = null;
		submitting = false;
	}

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		submitting = true;
		error = null;

		try {
			const trimmedTitle = title.trim();
			const trimmedPdfUrl = pdfUrl.trim();
			if (!trimmedTitle) {
				error = 'Title is required';
				return;
			}
			if (!trimmedPdfUrl) {
				error = 'PDF link is required';
				return;
			}

			if (editingNewsletter?.id) {
				await updateNewsletter({
					id: editingNewsletter.id,
					title: trimmedTitle,
					pdfUrl: trimmedPdfUrl
				});
			} else {
				await createNewsletter({ title: trimmedTitle, pdfUrl: trimmedPdfUrl });
			}

			void getNewsletters().refresh();
			close();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to save newsletter';
		} finally {
			submitting = false;
		}
	}
</script>

<dialog bind:this={dialog} class="modal">
	<div class="modal-box modal-box-fit">
		<h3 class="text-lg font-bold">{isEdit ? 'Edit newsletter' : 'Add newsletter'}</h3>

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
								placeholder="March 2026 update"
							/>
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
								placeholder="https://example.com/newsletter.pdf"
							/>
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
				<button type="button" class="btn btn-ghost" onclick={close} disabled={submitting}
					>Cancel</button
				>
				<button type="submit" class="btn btn-primary" disabled={submitting}>
					{#if submitting}
						<LoadingSpinner size="sm" />
					{:else}
						{isEdit ? 'Save newsletter' : 'Add newsletter'}
					{/if}
				</button>
			</div>
		</form>
	</div>
	<form method="dialog" class="modal-backdrop">
		<button aria-label="Close dialog">close</button>
	</form>
</dialog>
