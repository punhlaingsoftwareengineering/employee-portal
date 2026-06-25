<script lang="ts">
	import type { OnboardingSlide } from '$lib/server/db/schema/onboarding-slide';
	import {
		createOnboardingSlide,
		updateOnboardingSlide,
		getOnboardingSlides
	} from '$lib/remotes/onboarding-slide.remote';
	import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';

	let dialog = $state<HTMLDialogElement | null>(null);
	let editingSlide = $state<OnboardingSlide | null>(null);
	let title = $state('');
	let description = $state('');
	let imageUrl = $state('');
	let sortOrder = $state(0);
	let submitting = $state(false);
	let error = $state<string | null>(null);

	const isEdit = $derived(Boolean(editingSlide?.id));

	export function open(existing?: OnboardingSlide | null) {
		editingSlide = existing ?? null;
		error = null;
		title = existing?.title ?? '';
		description = existing?.description ?? '';
		imageUrl = existing?.imageUrl ?? '';
		sortOrder = existing?.sortOrder ?? 0;
		dialog?.showModal();
	}

	function close() {
		dialog?.close();
		editingSlide = null;
		error = null;
		submitting = false;
	}

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		submitting = true;
		error = null;

		try {
			const trimmedTitle = title.trim();
			const trimmedImageUrl = imageUrl.trim();
			const trimmedDescription = description.trim();

			if (!trimmedTitle) {
				error = 'Title is required';
				return;
			}
			if (!trimmedImageUrl) {
				error = 'Image URL is required';
				return;
			}

			const payload = {
				title: trimmedTitle,
				imageUrl: trimmedImageUrl,
				description: trimmedDescription || undefined,
				sortOrder
			};

			if (editingSlide?.id) {
				await updateOnboardingSlide({
					id: editingSlide.id,
					...payload
				});
			} else {
				await createOnboardingSlide(payload);
			}

			void getOnboardingSlides().refresh();
			close();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to save slide';
		} finally {
			submitting = false;
		}
	}
</script>

<dialog bind:this={dialog} class="modal">
	<div class="modal-box modal-box-fit">
		<h3 class="text-lg font-bold">{isEdit ? 'Edit carousel slide' : 'Add carousel slide'}</h3>

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
								maxlength="120"
								placeholder="Welcome to the portal"
							/>
						</td>
					</tr>
					<tr>
						<td class="form-table-label">Description</td>
						<td class="form-table-field">
							<textarea
								bind:value={description}
								class="textarea textarea-bordered w-full max-w-md"
								maxlength="500"
								rows="3"
								placeholder="Short caption shown on the slide"
							></textarea>
						</td>
					</tr>
					<tr>
						<td class="form-table-label">Image URL</td>
						<td class="form-table-field">
							<input
								type="url"
								bind:value={imageUrl}
								class="input input-bordered w-full max-w-md"
								required
								placeholder="https://example.com/slide.png"
							/>
						</td>
					</tr>
					<tr>
						<td class="form-table-label">Sort order</td>
						<td class="form-table-field">
							<input
								type="number"
								bind:value={sortOrder}
								class="input input-bordered w-full max-w-md"
								min="0"
								step="1"
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
				<button type="button" class="btn btn-ghost" onclick={close} disabled={submitting}
					>Cancel</button
				>
				<button type="submit" class="btn btn-primary" disabled={submitting}>
					{#if submitting}
						<LoadingSpinner size="sm" />
					{:else}
						{isEdit ? 'Save slide' : 'Add slide'}
					{/if}
				</button>
			</div>
		</form>
	</div>
	<form method="dialog" class="modal-backdrop">
		<button aria-label="Close dialog">close</button>
	</form>
</dialog>
