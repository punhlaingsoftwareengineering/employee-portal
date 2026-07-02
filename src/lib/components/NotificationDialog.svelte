<script lang="ts">
	import type { Notification } from '$lib/server/db/schema/notification';
	import type { NotificationPriority } from '$lib/constants/notification';
	import { NOTIFICATION_PRIORITY_OPTIONS } from '$lib/constants/notification';
	import {
		createNotification,
		updateNotification,
		getNotifications
	} from '$lib/remotes/notification.remote';
	import { getNotificationSounds } from '$lib/remotes/notification-sound.remote';
	import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';

	let dialog = $state<HTMLDialogElement | null>(null);
	let editingNotification = $state<Notification | null>(null);
	let title = $state('');
	let body = $state('');
	let linkUrl = $state('');
	let priority = $state<NotificationPriority>('info');
	let iconName = $state('');
	let imageUrl = $state('');
	let soundId = $state('');
	let submitting = $state(false);
	let error = $state<string | null>(null);

	const isEdit = $derived(Boolean(editingNotification?.id));

	export function open(existing?: Notification | null) {
		editingNotification = existing ?? null;
		error = null;
		title = existing?.title ?? '';
		body = existing?.body ?? '';
		linkUrl = existing?.linkUrl ?? '';
		priority = existing?.priority ?? 'info';
		iconName = existing?.iconName ?? '';
		imageUrl = existing?.imageUrl ?? '';
		soundId = existing?.soundId ?? '';
		dialog?.showModal();
	}

	function close() {
		dialog?.close();
		editingNotification = null;
		error = null;
		submitting = false;
	}

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		submitting = true;
		error = null;

		try {
			const trimmedTitle = title.trim();
			const trimmedBody = body.trim();
			const trimmedLinkUrl = linkUrl.trim();
			const trimmedIconName = iconName.trim();
			const trimmedImageUrl = imageUrl.trim();

			if (!trimmedTitle) {
				error = 'Title is required';
				return;
			}

			if (trimmedIconName && trimmedImageUrl) {
				error = 'Use either an icon name or an image URL, not both';
				return;
			}

			const payload = {
				title: trimmedTitle,
				body: trimmedBody || undefined,
				linkUrl: trimmedLinkUrl || undefined,
				priority,
				iconName: trimmedIconName || undefined,
				imageUrl: trimmedImageUrl || undefined,
				soundId: soundId || undefined
			};

			if (editingNotification?.id) {
				await updateNotification({ id: editingNotification.id, ...payload });
			} else {
				await createNotification(payload);
			}

			void getNotifications().refresh();
			close();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to save notification';
		} finally {
			submitting = false;
		}
	}
</script>

<dialog bind:this={dialog} class="modal">
	<div class="modal-box modal-box-fit">
		<h3 class="text-lg font-bold">{isEdit ? 'Edit notification' : 'Add notification'}</h3>

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
							/>
						</td>
					</tr>
					<tr>
						<td class="form-table-label">Body</td>
						<td class="form-table-field">
							<textarea
								bind:value={body}
								class="textarea textarea-bordered w-full max-w-md"
								maxlength="500"
								rows="3"
							></textarea>
						</td>
					</tr>
					<tr>
						<td class="form-table-label">Priority</td>
						<td class="form-table-field">
							<select bind:value={priority} class="select select-bordered w-full max-w-md">
								{#each NOTIFICATION_PRIORITY_OPTIONS as option (option.value)}
									<option value={option.value}>{option.label}</option>
								{/each}
							</select>
						</td>
					</tr>
					<tr>
						<td class="form-table-label">Icon name</td>
						<td class="form-table-field">
							<input
								type="text"
								bind:value={iconName}
								class="input input-bordered w-full max-w-md"
								placeholder="bell"
								maxlength="64"
							/>
							<p class="mt-1 text-xs text-base-content/60">Lucide icon slug, e.g. bell, info, megaphone</p>
						</td>
					</tr>
					<tr>
						<td class="form-table-label">Image URL</td>
						<td class="form-table-field">
							<input
								type="url"
								bind:value={imageUrl}
								class="input input-bordered w-full max-w-md"
								placeholder="https://example.com/icon.png"
							/>
						</td>
					</tr>
					<tr>
						<td class="form-table-label">Link URL</td>
						<td class="form-table-field">
							<input
								type="url"
								bind:value={linkUrl}
								class="input input-bordered w-full max-w-md"
								placeholder="https://example.com (optional)"
							/>
						</td>
					</tr>
					<tr>
						<td class="form-table-label">Sound</td>
						<td class="form-table-field">
							<svelte:boundary>
								{@const sounds = await getNotificationSounds()}
								<select bind:value={soundId} class="select select-bordered w-full max-w-md">
									<option value="">Portal default</option>
									{#each sounds as sound (sound.id)}
										<option value={sound.id}>{sound.name}</option>
									{/each}
								</select>
								{#snippet pending()}
									<span class="loading loading-spinner loading-sm"></span>
								{/snippet}
								{#snippet failed()}
									<select class="select select-bordered select-error w-full max-w-md" disabled>
										<option>Failed to load sounds</option>
									</select>
								{/snippet}
							</svelte:boundary>
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
						{isEdit ? 'Save notification' : 'Add notification'}
					{/if}
				</button>
			</div>
		</form>
	</div>
	<form method="dialog" class="modal-backdrop">
		<button aria-label="Close dialog">close</button>
	</form>
</dialog>
