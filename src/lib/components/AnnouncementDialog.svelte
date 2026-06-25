<script lang="ts">
	import type { Announcement } from '$lib/server/db/schema/announcement';
	import type { AnnouncementAccentPreset, AnnouncementType } from '$lib/constants/announcement';
	import { ANNOUNCEMENT_ACCENT_OPTIONS, ANNOUNCEMENT_TYPES } from '$lib/constants/announcement';
	import {
		createAnnouncement,
		updateAnnouncement,
		getAnnouncements
	} from '$lib/remotes/announcement.remote';
	import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';

	let dialog = $state<HTMLDialogElement | null>(null);
	let editingAnnouncement = $state<Announcement | null>(null);
	let type = $state<AnnouncementType>('text');
	let title = $state('');
	let body = $state('');
	let linkUrl = $state('');
	let imageUrl = $state('');
	let accentPreset = $state<AnnouncementAccentPreset>('primary');
	let accentColor = $state('');
	let isActive = $state(false);
	let submitting = $state(false);
	let error = $state<string | null>(null);

	const isEdit = $derived(Boolean(editingAnnouncement?.id));
	const isText = $derived(type === 'text');
	const isImage = $derived(type === 'image');

	export function open(existing?: Announcement | null) {
		editingAnnouncement = existing ?? null;
		error = null;
		type = existing?.type ?? 'text';
		title = existing?.title ?? '';
		body = existing?.body ?? '';
		linkUrl = existing?.linkUrl ?? '';
		imageUrl = existing?.imageUrl ?? '';
		accentPreset = existing?.accentPreset ?? 'primary';
		accentColor = existing?.accentColor ?? '';
		isActive = existing?.isActive ?? false;
		dialog?.showModal();
	}

	function close() {
		dialog?.close();
		editingAnnouncement = null;
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
			const trimmedImageUrl = imageUrl.trim();
			const trimmedAccentColor = accentColor.trim();

			if (!trimmedTitle) {
				error = 'Title is required';
				return;
			}

			if (isImage && !trimmedImageUrl) {
				error = 'Image URL is required';
				return;
			}

			if (trimmedAccentColor && !/^#[0-9A-Fa-f]{6}$/.test(trimmedAccentColor)) {
				error = 'Accent color must be a hex value like #3b82f6';
				return;
			}

			const payload = {
				type,
				title: trimmedTitle,
				body: isText && trimmedBody ? trimmedBody : undefined,
				linkUrl: trimmedLinkUrl || undefined,
				imageUrl: isImage ? trimmedImageUrl : undefined,
				accentPreset: isText ? accentPreset : undefined,
				accentColor: isText && trimmedAccentColor ? trimmedAccentColor : undefined,
				isActive
			};

			if (editingAnnouncement?.id) {
				await updateAnnouncement({
					id: editingAnnouncement.id,
					...payload
				});
			} else {
				await createAnnouncement(payload);
			}

			void getAnnouncements().refresh();
			close();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to save announcement';
		} finally {
			submitting = false;
		}
	}
</script>

<dialog bind:this={dialog} class="modal">
	<div class="modal-box modal-box-fit">
		<h3 class="text-lg font-bold">{isEdit ? 'Edit announcement' : 'Add announcement'}</h3>

		<form class="mt-6" onsubmit={handleSubmit}>
			<table class="form-table">
				<tbody>
					<tr>
						<td class="form-table-label">Type</td>
						<td class="form-table-field">
							<select bind:value={type} class="select select-bordered w-full max-w-md">
								{#each ANNOUNCEMENT_TYPES as option (option)}
									<option value={option}>{option === 'image' ? 'Image' : 'Text'}</option>
								{/each}
							</select>
						</td>
					</tr>
					<tr>
						<td class="form-table-label">Title</td>
						<td class="form-table-field">
							<input
								type="text"
								bind:value={title}
								class="input input-bordered w-full max-w-md"
								required
								maxlength="200"
								placeholder={isImage ? 'Alt text for the banner image' : 'Announcement headline'}
							/>
						</td>
					</tr>
					{#if isText}
						<tr>
							<td class="form-table-label">Body</td>
							<td class="form-table-field">
								<textarea
									bind:value={body}
									class="textarea textarea-bordered w-full max-w-md"
									maxlength="500"
									rows="3"
									placeholder="Optional supporting text"
								></textarea>
							</td>
						</tr>
						<tr>
							<td class="form-table-label">Accent preset</td>
							<td class="form-table-field">
								<select bind:value={accentPreset} class="select select-bordered w-full max-w-md">
									{#each ANNOUNCEMENT_ACCENT_OPTIONS as option (option.value)}
										<option value={option.value}>{option.label}</option>
									{/each}
								</select>
							</td>
						</tr>
						<tr>
							<td class="form-table-label">Custom color</td>
							<td class="form-table-field">
								<input
									type="text"
									bind:value={accentColor}
									class="input input-bordered w-full max-w-md"
									placeholder="#3b82f6"
									maxlength="7"
								/>
								<p class="mt-1 text-xs text-base-content/60">
									Optional hex override for the banner background.
								</p>
							</td>
						</tr>
					{/if}
					{#if isImage}
						<tr>
							<td class="form-table-label">Image URL</td>
							<td class="form-table-field">
								<input
									type="url"
									bind:value={imageUrl}
									class="input input-bordered w-full max-w-md"
									required
									placeholder="https://example.com/banner.png"
								/>
							</td>
						</tr>
					{/if}
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
						<td class="form-table-label">Active</td>
						<td class="form-table-field">
							<label class="label cursor-pointer justify-start gap-3">
								<input type="checkbox" bind:checked={isActive} class="checkbox checkbox-primary" />
								<span class="label-text">Show this announcement on the onboarding pages</span>
							</label>
							<p class="mt-1 text-xs text-base-content/60">
								Only one announcement can be active at a time.
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
						{isEdit ? 'Save announcement' : 'Add announcement'}
					{/if}
				</button>
			</div>
		</form>
	</div>
	<form method="dialog" class="modal-backdrop">
		<button aria-label="Close dialog">close</button>
	</form>
</dialog>
