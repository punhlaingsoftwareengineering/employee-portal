<script lang="ts">
	import type { NotificationSound } from '$lib/server/db/schema/notification-sound';
	import {
		createNotificationSound,
		updateNotificationSound,
		getNotificationSounds
	} from '$lib/remotes/notification-sound.remote';
	import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
	import { isNotificationSoundUrl, normalizeNotificationSoundUrl } from '$lib/constants/notification';

	let dialog = $state<HTMLDialogElement | null>(null);
	let editingSound = $state<NotificationSound | null>(null);
	let name = $state('');
	let mp3Url = $state('');
	let isDefault = $state(false);
	let submitting = $state(false);
	let error = $state<string | null>(null);

	const isEdit = $derived(Boolean(editingSound?.id));

	export function open(existing?: NotificationSound | null) {
		editingSound = existing ?? null;
		error = null;
		name = existing?.name ?? '';
		mp3Url = existing?.mp3Url ?? '';
		isDefault = existing?.isDefault ?? false;
		dialog?.showModal();
	}

	function close() {
		dialog?.close();
		editingSound = null;
		error = null;
		submitting = false;
	}

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		submitting = true;
		error = null;

		try {
			const trimmedName = name.trim();
			const trimmedAudioUrl = normalizeNotificationSoundUrl(mp3Url);

			if (!trimmedName) {
				error = 'Name is required';
				return;
			}
			if (!trimmedAudioUrl) {
				error = 'Audio URL is required';
				return;
			}
			if (!isNotificationSoundUrl(trimmedAudioUrl)) {
				error = 'Must be a valid http or https URL';
				return;
			}

			const payload = {
				name: trimmedName,
				mp3Url: trimmedAudioUrl,
				isDefault
			};

			if (editingSound?.id) {
				await updateNotificationSound({ id: editingSound.id, ...payload });
			} else {
				await createNotificationSound(payload);
			}

			void getNotificationSounds().refresh();
			close();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to save sound';
		} finally {
			submitting = false;
		}
	}
</script>

<dialog bind:this={dialog} class="modal">
	<div class="modal-box modal-box-fit">
		<h3 class="text-lg font-bold">{isEdit ? 'Edit sound' : 'Add sound'}</h3>

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
								placeholder="Default chime"
							/>
						</td>
					</tr>
					<tr>
						<td class="form-table-label">Audio URL</td>
						<td class="form-table-field">
							<input
								type="url"
								bind:value={mp3Url}
								class="input input-bordered w-full max-w-md"
								required
								placeholder="http://10.100.100.67:1025/BselWBq_7FNV"
							/>
							<p class="mt-1 text-xs text-base-content/60">
								Direct http(s) link to audio (MP3, WAV, or extensionless if the server returns audio).
							</p>
						</td>
					</tr>
					<tr>
						<td class="form-table-label">Default</td>
						<td class="form-table-field">
							<label class="label cursor-pointer justify-start gap-3">
								<input type="checkbox" bind:checked={isDefault} class="checkbox checkbox-primary" />
								<span class="label-text">Use as portal default when a notification has no sound</span>
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
						{isEdit ? 'Save sound' : 'Add sound'}
					{/if}
				</button>
			</div>
		</form>
	</div>
	<form method="dialog" class="modal-backdrop">
		<button aria-label="Close dialog">close</button>
	</form>
</dialog>
