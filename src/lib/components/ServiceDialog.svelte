<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import type { Service } from '$lib/server/db/schema/service';
	import { createService, updateService, getServices } from '$lib/remotes/service.remote';
	import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';

	let dialog = $state<HTMLDialogElement | null>(null);
	let editingService = $state<Service | null>(null);
	let name = $state('');
	let description = $state('');
	let link = $state('');
	let iconUrl = $state('');
	let isPublic = $state(false);
	let submitting = $state(false);
	let error = $state<string | null>(null);

	const isEdit = $derived(Boolean(editingService?.id));

	export function open(existing?: Service | null) {
		editingService = existing ?? null;
		error = null;
		name = existing?.name ?? '';
		description = existing?.description ?? '';
		link = existing?.link ?? '';
		iconUrl = existing?.iconUrl ?? '';
		isPublic = existing?.isPublic ?? false;
		dialog?.showModal();
	}

	function close() {
		dialog?.close();
		editingService = null;
		error = null;
		submitting = false;
	}

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		submitting = true;
		error = null;

		try {
			const payload = {
				name: name.trim(),
				description: description.trim() || undefined,
				link: link.trim(),
				iconUrl: iconUrl.trim() || null,
				isPublic
			};

			if (editingService?.id) {
				await updateService({ id: editingService.id, ...payload });
			} else {
				await createService(payload);
			}

			void getServices().refresh();
			await invalidateAll();
			close();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to save service';
		} finally {
			submitting = false;
		}
	}
</script>

<dialog bind:this={dialog} class="modal">
	<div class="modal-box max-w-2xl">
		<h3 class="text-lg font-bold">{isEdit ? 'Edit service' : 'New service'}</h3>

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
							></textarea>
						</td>
					</tr>
					<tr>
						<td class="form-table-label">Icon URL</td>
						<td class="form-table-field">
							<input
								type="url"
								bind:value={iconUrl}
								class="input input-bordered w-full max-w-md"
								placeholder="https://example.com/icon.png"
							/>
						</td>
					</tr>
					<tr>
						<td class="form-table-label">Link</td>
						<td class="form-table-field">
							<input
								type="url"
								bind:value={link}
								class="input input-bordered w-full max-w-md"
								placeholder="http://10.100.100.67:5678/signin"
								required
							/>
							<p class="mt-1 text-xs text-base-content/60">
								Opens in a new browser tab when selected from the dashboard or sidebar.
							</p>
						</td>
					</tr>
					<tr>
						<td class="form-table-label">Public</td>
						<td class="form-table-field">
							<label class="label cursor-pointer justify-start gap-3">
								<input type="checkbox" bind:checked={isPublic} class="checkbox checkbox-primary" />
								<span class="label-text">Show on the onboarding page (no sign-in required)</span>
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
				<button type="button" class="btn btn-ghost" onclick={close} disabled={submitting}
					>Cancel</button
				>
				<button type="submit" class="btn btn-primary" disabled={submitting}>
					{#if submitting}
						<LoadingSpinner size="sm" />
					{:else}
						{isEdit ? 'Save service' : 'Create service'}
					{/if}
				</button>
			</div>
		</form>
	</div>
	<form method="dialog" class="modal-backdrop">
		<button aria-label="Close dialog">close</button>
	</form>
</dialog>
