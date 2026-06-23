<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import type { App } from '$lib/server/db/schema/app';
	import {
		APP_DOWNLOAD_PLATFORM_LABELS
	} from '$lib/constants/app-download';
	import { createApp, updateApp, getApps } from '$lib/remotes/app.remote';
	import { normalizeDownloadUrls } from '$lib/utils/app-download';
	import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';

	let dialog = $state<HTMLDialogElement | null>(null);
	let editingApp = $state<App | null>(null);
	let name = $state('');
	let tagline = $state('');
	let description = $state('');
	let iconUrl = $state('');
	let bannerUrl = $state('');
	let downloadWindows = $state('');
	let downloadMacos = $state('');
	let downloadAndroid = $state('');
	let downloadLinux = $state('');
	let downloadZip = $state('');
	let version = $state('');
	let developer = $state('');
	let category = $state('');
	let screenshotUrlsText = $state('');
	let isPublic = $state(false);
	let submitting = $state(false);
	let error = $state<string | null>(null);

	const isEdit = $derived(Boolean(editingApp?.id));

	function parseScreenshotUrls(text: string): string[] {
		return text
			.split('\n')
			.map((line) => line.trim())
			.filter(Boolean);
	}

	function formatScreenshotUrls(urls: string[] | null | undefined): string {
		return (urls ?? []).join('\n');
	}

	function loadDownloadFields(existing?: App | null) {
		const urls = normalizeDownloadUrls(existing?.downloadUrls);
		if (Object.keys(urls).length === 0 && existing?.downloadUrl) {
			downloadLinux = existing.downloadUrl;
			downloadWindows = '';
			downloadMacos = '';
			downloadAndroid = '';
			downloadZip = '';
			return;
		}

		downloadWindows = urls.windows ?? '';
		downloadMacos = urls.macos ?? '';
		downloadAndroid = urls.android ?? '';
		downloadLinux = urls.linux ?? '';
		downloadZip = urls.zip ?? '';
	}

	function buildDownloadUrls() {
		return normalizeDownloadUrls({
			windows: downloadWindows.trim() || undefined,
			macos: downloadMacos.trim() || undefined,
			android: downloadAndroid.trim() || undefined,
			linux: downloadLinux.trim() || undefined,
			zip: downloadZip.trim() || undefined
		});
	}

	export function open(existing?: App | null) {
		editingApp = existing ?? null;
		error = null;
		name = existing?.name ?? '';
		tagline = existing?.tagline ?? '';
		description = existing?.description ?? '';
		iconUrl = existing?.iconUrl ?? '';
		bannerUrl = existing?.bannerUrl ?? '';
		loadDownloadFields(existing);
		version = existing?.version ?? '';
		developer = existing?.developer ?? '';
		category = existing?.category ?? '';
		screenshotUrlsText = formatScreenshotUrls(existing?.screenshotUrls);
		isPublic = existing?.isPublic ?? false;
		dialog?.showModal();
	}

	function close() {
		dialog?.close();
		editingApp = null;
		error = null;
		submitting = false;
	}

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		submitting = true;
		error = null;

		try {
			const downloadUrls = buildDownloadUrls();
			if (Object.keys(downloadUrls).length === 0) {
				error = 'Add at least one download URL (OS installer or ZIP archive)';
				return;
			}

			const payload = {
				name: name.trim(),
				tagline: tagline.trim() || undefined,
				description: description.trim() || undefined,
				iconUrl: iconUrl.trim() || null,
				bannerUrl: bannerUrl.trim() || null,
				downloadUrls,
				version: version.trim() || undefined,
				developer: developer.trim() || undefined,
				category: category.trim() || undefined,
				screenshotUrls: parseScreenshotUrls(screenshotUrlsText),
				isPublic
			};

			if (editingApp?.id) {
				await updateApp({ id: editingApp.id, ...payload });
			} else {
				await createApp(payload);
			}

			void getApps().refresh();
			await invalidateAll();
			close();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to save app';
		} finally {
			submitting = false;
		}
	}
</script>

<dialog bind:this={dialog} class="modal">
	<div class="modal-box max-w-3xl">
		<h3 class="text-lg font-bold">{isEdit ? 'Edit app' : 'New app'}</h3>

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
						<td class="form-table-label">Tagline</td>
						<td class="form-table-field">
							<input
								type="text"
								bind:value={tagline}
								class="input input-bordered w-full max-w-md"
								placeholder="Short one-line summary"
							/>
						</td>
					</tr>
					<tr>
						<td class="form-table-label">Description</td>
						<td class="form-table-field">
							<textarea
								bind:value={description}
								class="textarea textarea-bordered w-full max-w-md"
								rows="4"
								placeholder="Full app store description"
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
						<td class="form-table-label">Banner URL</td>
						<td class="form-table-field">
							<input
								type="url"
								bind:value={bannerUrl}
								class="input input-bordered w-full max-w-md"
								placeholder="https://example.com/banner.png"
							/>
						</td>
					</tr>
					<tr>
						<td class="form-table-label align-top">Download URLs</td>
						<td class="form-table-field">
							<p class="mb-3 text-sm text-base-content/70">
								Add a link for each platform you support, or a ZIP archive (at least one required).
							</p>
							<div class="space-y-3">
								<label class="form-control w-full max-w-md">
									<span class="label py-0">
										<span class="label-text">{APP_DOWNLOAD_PLATFORM_LABELS.windows}</span>
									</span>
									<input
										type="url"
										bind:value={downloadWindows}
										class="input input-bordered w-full"
										placeholder="https://example.com/app-setup.exe"
									/>
								</label>
								<label class="form-control w-full max-w-md">
									<span class="label py-0">
										<span class="label-text">{APP_DOWNLOAD_PLATFORM_LABELS.macos}</span>
									</span>
									<input
										type="url"
										bind:value={downloadMacos}
										class="input input-bordered w-full"
										placeholder="https://example.com/app.dmg"
									/>
								</label>
								<label class="form-control w-full max-w-md">
									<span class="label py-0">
										<span class="label-text">{APP_DOWNLOAD_PLATFORM_LABELS.android}</span>
									</span>
									<input
										type="url"
										bind:value={downloadAndroid}
										class="input input-bordered w-full"
										placeholder="https://example.com/app.apk"
									/>
								</label>
								<label class="form-control w-full max-w-md">
									<span class="label py-0">
										<span class="label-text">{APP_DOWNLOAD_PLATFORM_LABELS.linux}</span>
									</span>
									<input
										type="url"
										bind:value={downloadLinux}
										class="input input-bordered w-full"
										placeholder="https://example.com/app.AppImage"
									/>
								</label>
								<label class="form-control w-full max-w-md">
									<span class="label py-0">
										<span class="label-text">{APP_DOWNLOAD_PLATFORM_LABELS.zip}</span>
									</span>
									<input
										type="url"
										bind:value={downloadZip}
										class="input input-bordered w-full"
										placeholder="https://example.com/app.zip"
									/>
								</label>
							</div>
						</td>
					</tr>
					<tr>
						<td class="form-table-label">Version</td>
						<td class="form-table-field">
							<input
								type="text"
								bind:value={version}
								class="input input-bordered w-full max-w-md"
								placeholder="1.0.0"
							/>
						</td>
					</tr>
					<tr>
						<td class="form-table-label">Developer</td>
						<td class="form-table-field">
							<input
								type="text"
								bind:value={developer}
								class="input input-bordered w-full max-w-md"
							/>
						</td>
					</tr>
					<tr>
						<td class="form-table-label">Category</td>
						<td class="form-table-field">
							<input
								type="text"
								bind:value={category}
								class="input input-bordered w-full max-w-md"
								placeholder="Productivity"
							/>
						</td>
					</tr>
					<tr>
						<td class="form-table-label">Screenshots</td>
						<td class="form-table-field">
							<textarea
								bind:value={screenshotUrlsText}
								class="textarea textarea-bordered w-full max-w-md"
								rows="3"
								placeholder="One image URL per line (max 8)"
							></textarea>
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
						{isEdit ? 'Save app' : 'Create app'}
					{/if}
				</button>
			</div>
		</form>
	</div>
	<form method="dialog" class="modal-backdrop">
		<button aria-label="Close dialog">close</button>
	</form>
</dialog>
