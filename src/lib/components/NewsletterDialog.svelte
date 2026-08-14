<script lang="ts">
	import type { Newsletter } from '$lib/server/db/schema/newsletter';
	import {
		createNewsletter,
		updateNewsletter,
		getNewsletters
	} from '$lib/remotes/newsletter.remote';
	import { withFormFeedback } from '$lib/form-feedback.svelte';
	import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
	import DriveMediaUrlField from '$lib/components/drive/DriveMediaUrlField.svelte';
	import { IMAGE_ASPECT } from '$lib/constants/image-aspect';
	import { NEWSLETTER_MEDIA_ACCEPT, newsletterMediaKind } from '$lib/utils/newsletter-media';

	let dialog = $state<HTMLDialogElement | null>(null);
	let editingNewsletter = $state<Newsletter | null>(null);
	let title = $state('');
	let pdfUrl = $state('');
	let sortOrder = $state(0);
	let submitting = $state(false);
	let error = $state<string | null>(null);

	const isEdit = $derived(Boolean(editingNewsletter?.id));
	const mediaKind = $derived(newsletterMediaKind(pdfUrl));

	export function open(existing?: Newsletter | null) {
		editingNewsletter = existing ?? null;
		error = null;
		title = existing?.title ?? '';
		pdfUrl = existing?.pdfUrl ?? '';
		sortOrder = existing?.sortOrder ?? 0;
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
				error = 'File link is required';
				return;
			}

			await withFormFeedback({
				successMessage: isEdit ? 'Newsletter updated' : 'Newsletter created',
				action: async () => {
					if (editingNewsletter?.id) {
						await updateNewsletter({
							id: editingNewsletter.id,
							title: trimmedTitle,
							pdfUrl: trimmedPdfUrl,
							sortOrder: Number(sortOrder) || 0
						});
					} else {
						await createNewsletter({
							title: trimmedTitle,
							pdfUrl: trimmedPdfUrl,
							...(sortOrder > 0 ? { sortOrder: Number(sortOrder) } : {})
						});
					}

					void getNewsletters().refresh();
				}
			});
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
		<p class="mt-1 text-sm text-base-content/70">Upload a PDF or an image (JPEG, PNG, WebP, GIF).</p>

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
						<td class="form-table-label">File link</td>
						<td class="form-table-field">
							<DriveMediaUrlField
								bind:value={pdfUrl}
								category="newsletters"
								accept={NEWSLETTER_MEDIA_ACCEPT}
								aspectRatio={IMAGE_ASPECT.newsletter}
								required
								placeholder="https://example.com/newsletter.pdf or .jpg"
								disabled={submitting}
							/>
							{#if pdfUrl.trim() && mediaKind === 'pdf'}
								<p class="mt-1 text-xs text-base-content/60">Detected as PDF (no aspect ratio check).</p>
							{:else if pdfUrl.trim() && mediaKind === 'image'}
								<p class="mt-1 text-xs text-base-content/60">Detected as image — must be 4:5.</p>
							{/if}
						</td>
					</tr>
					<tr>
						<td class="form-table-label">Serial order</td>
						<td class="form-table-field">
							<input
								type="number"
								bind:value={sortOrder}
								class="input input-bordered w-full max-w-md"
								min="0"
								step="1"
								disabled={submitting}
							/>
							<p class="mt-1 text-xs text-base-content/60">
								{#if isEdit}
									Higher numbers show first (latest). Onboarding shows the top 8.
								{:else}
									Leave 0 to auto-assign the next latest serial. Higher = newer.
								{/if}
							</p>
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
