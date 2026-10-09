<script lang="ts">
	import type { DailyPopupImage } from '$lib/server/db/schema/daily-popup-image';
	import {
		createDailyPopupImage,
		updateDailyPopupImage,
		getDailyPopupSchedules
	} from '$lib/remotes/daily-popup.remote';
	import { withFormFeedback } from '$lib/form-feedback.svelte';
	import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
	import DriveMediaUrlField from '$lib/components/drive/DriveMediaUrlField.svelte';
	import { IMAGE_ASPECT } from '$lib/constants/image-aspect';

	let dialog = $state<HTMLDialogElement | null>(null);
	let scheduleId = $state('');
	let editingImage = $state<DailyPopupImage | null>(null);
	let imageUrl = $state('');
	let linkUrl = $state('');
	let submitting = $state(false);
	let error = $state<string | null>(null);

	const isEdit = $derived(Boolean(editingImage?.id));

	export function open(targetScheduleId: string, existing?: DailyPopupImage | null) {
		scheduleId = targetScheduleId;
		editingImage = existing ?? null;
		error = null;
		imageUrl = existing?.imageUrl ?? '';
		linkUrl = existing?.linkUrl ?? '';
		dialog?.showModal();
	}

	function close() {
		dialog?.close();
		editingImage = null;
		error = null;
		submitting = false;
	}

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		submitting = true;
		error = null;

		try {
			const trimmedImageUrl = imageUrl.trim();
			const trimmedLink = linkUrl.trim();

			if (!trimmedImageUrl) {
				error = 'Image URL is required';
				return;
			}

			await withFormFeedback({
				successMessage: isEdit ? 'Popup image updated' : 'Popup image added',
				action: async () => {
					if (editingImage?.id) {
						await updateDailyPopupImage({
							id: editingImage.id,
							imageUrl: trimmedImageUrl,
							linkUrl: trimmedLink || null
						});
					} else {
						await createDailyPopupImage({
							scheduleId,
							imageUrl: trimmedImageUrl,
							linkUrl: trimmedLink || null
						});
					}
					void getDailyPopupSchedules().refresh();
				}
			});
			close();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to save image';
		} finally {
			submitting = false;
		}
	}
</script>

<dialog bind:this={dialog} class="modal">
	<div class="modal-box modal-box-fit">
		<h3 class="text-lg font-bold">{isEdit ? 'Edit popup image' : 'Add popup image'}</h3>

		<form class="mt-6" onsubmit={handleSubmit}>
			<table class="form-table">
				<tbody>
					<tr>
						<td class="form-table-label">Image</td>
						<td class="form-table-field">
							<DriveMediaUrlField
								category="daily-popups"
								bind:value={imageUrl}
								aspectRatio={IMAGE_ASPECT.dailyPopup}
								required
								placeholder="1920×1080 (16:9) image URL"
							/>
							<p class="mt-1 text-xs text-base-content/60">
								Required aspect 16:9 (design size 1920×1080).
							</p>
						</td>
					</tr>
					<tr>
						<td class="form-table-label">Link (optional)</td>
						<td class="form-table-field">
							<input
								type="url"
								bind:value={linkUrl}
								class="input input-bordered w-full max-w-md"
								maxlength="2048"
								placeholder="https://…"
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
				<button type="button" class="btn" onclick={close} disabled={submitting}>Cancel</button>
				<button type="submit" class="btn btn-primary" disabled={submitting}>
					{#if submitting}
						<LoadingSpinner size="sm" />
					{/if}
					{isEdit ? 'Save' : 'Add'}
				</button>
			</div>
		</form>
	</div>
	<form method="dialog" class="modal-backdrop">
		<button>close</button>
	</form>
</dialog>
