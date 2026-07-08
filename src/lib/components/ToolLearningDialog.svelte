<script lang="ts">
	import type { ToolLearning } from '$lib/server/db/schema/tool-learning';
	import {
		createToolLearning,
		updateToolLearning,
		getToolLearnings
	} from '$lib/remotes/tool-learning.remote';
	import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
	import DriveMediaUrlField from '$lib/components/drive/DriveMediaUrlField.svelte';

	let dialog = $state<HTMLDialogElement | null>(null);
	let editingItem = $state<ToolLearning | null>(null);
	let title = $state('');
	let description = $state('');
	let videoUrl = $state('');
	let duration = $state('');
	let sortOrder = $state(0);
	let submitting = $state(false);
	let error = $state<string | null>(null);

	const isEdit = $derived(Boolean(editingItem?.id));

	export function open(existing?: ToolLearning | null) {
		editingItem = existing ?? null;
		error = null;
		title = existing?.title ?? '';
		description = existing?.description ?? '';
		videoUrl = existing?.videoUrl ?? '';
		duration = existing?.duration ?? '';
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
		title = '';
		description = '';
		videoUrl = '';
		duration = '';
		sortOrder = 0;
	}

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		submitting = true;
		error = null;

		try {
			const trimmedTitle = title.trim();
			const trimmedVideoUrl = videoUrl.trim();
			const trimmedDescription = description.trim();
			const trimmedDuration = duration.trim();

			if (!trimmedTitle) {
				error = 'Title is required';
				return;
			}
			if (!trimmedVideoUrl) {
				error = 'Video link is required';
				return;
			}

			const payload = {
				title: trimmedTitle,
				videoUrl: trimmedVideoUrl,
				description: trimmedDescription || undefined,
				duration: trimmedDuration || undefined,
				sortOrder
			};

			if (editingItem?.id) {
				await updateToolLearning({ id: editingItem.id, ...payload });
			} else {
				await createToolLearning(payload);
			}

			void getToolLearnings().refresh();
			close();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to save learning item';
		} finally {
			submitting = false;
		}
	}
</script>

<dialog bind:this={dialog} class="modal" onclose={resetForm}>
	<div class="modal-box modal-box-fit">
		<h3 class="text-lg font-bold">{isEdit ? 'Edit learning' : 'Add learning'}</h3>

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
								placeholder="Portal walkthrough"
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
						<td class="form-table-label">Video link</td>
						<td class="form-table-field">
							<DriveMediaUrlField
								bind:value={videoUrl}
								category="tool-learnings"
								accept="video/*"
								required
								placeholder="https://example.com/tutorial.mp4"
								disabled={submitting}
							/>
							<p class="mt-1 text-xs text-base-content/60">
								Upload to PHH-DRIVE or paste a direct video URL.
							</p>
						</td>
					</tr>
					<tr>
						<td class="form-table-label">Duration</td>
						<td class="form-table-field">
							<input
								type="text"
								bind:value={duration}
								class="input input-bordered w-full max-w-xs"
								maxlength="40"
								placeholder="12 min"
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
						{isEdit ? 'Save learning' : 'Add learning'}
					{/if}
				</button>
			</div>
		</form>
	</div>
	<form method="dialog" class="modal-backdrop">
		<button aria-label="Close dialog">close</button>
	</form>
</dialog>
