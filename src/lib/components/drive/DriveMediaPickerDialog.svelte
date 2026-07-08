<script lang="ts">
	import type { PortalDriveCategory } from '$lib/constants/drive-media-categories';
	import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
	import { LucideFolderOpen, LucideTrash2, LucideUpload } from '@lucide/svelte';

	type MediaFile = { id: string; name: string; updatedAt: string | null };

	let {
		category,
		accept = '*/*',
		onSelect
	}: {
		category: PortalDriveCategory;
		accept?: string;
		onSelect: (url: string) => void;
	} = $props();

	let dialog = $state<HTMLDialogElement | null>(null);
	let files = $state<MediaFile[]>([]);
	let loading = $state(false);
	let uploading = $state(false);
	let pickingId = $state<string | null>(null);
	let error = $state<string | null>(null);
	let dragDepth = $state(0);

	export function open() {
		error = null;
		dialog?.showModal();
		void loadFiles();
	}

	function close() {
		dialog?.close();
		error = null;
		uploading = false;
		pickingId = null;
	}

	async function loadFiles() {
		loading = true;
		error = null;
		try {
			const r = await fetch(`/api/drive-media/${category}`);
			if (!r.ok) throw new Error(await r.text());
			const j = (await r.json()) as { files?: MediaFile[] };
			files = j.files ?? [];
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to load files';
			files = [];
		} finally {
			loading = false;
		}
	}

	async function uploadFile(file: File) {
		uploading = true;
		error = null;
		try {
			const fd = new FormData();
			fd.set('file', file);
			const r = await fetch(`/api/drive-media/${category}/upload`, {
				method: 'POST',
				body: fd
			});
			if (!r.ok) throw new Error(await r.text());
			const j = (await r.json()) as { url?: string };
			if (!j.url) throw new Error('Upload did not return a URL');
			onSelect(j.url);
			close();
		} catch (e) {
			error = e instanceof Error ? e.message : 'Upload failed';
		} finally {
			uploading = false;
		}
	}

	async function pickFile(fileId: string) {
		pickingId = fileId;
		error = null;
		try {
			const r = await fetch(`/api/drive-media/${category}/pick`, {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ fileId })
			});
			if (!r.ok) throw new Error(await r.text());
			const j = (await r.json()) as { url?: string };
			if (!j.url) throw new Error('Pick did not return a URL');
			onSelect(j.url);
			close();
		} catch (e) {
			error = e instanceof Error ? e.message : 'Could not use file';
		} finally {
			pickingId = null;
		}
	}

	async function trashFile(fileId: string, name: string) {
		if (!confirm(`Move "${name}" to drive trash?`)) return;
		error = null;
		try {
			const r = await fetch(`/api/drive-media/${category}/${fileId}`, { method: 'DELETE' });
			if (!r.ok) throw new Error(await r.text());
			await loadFiles();
		} catch (e) {
			error = e instanceof Error ? e.message : 'Delete failed';
		}
	}

	function onFileInputChange(event: Event) {
		const input = event.currentTarget as HTMLInputElement;
		const file = input.files?.[0];
		input.value = '';
		if (file) void uploadFile(file);
	}

	function onDrop(event: DragEvent) {
		event.preventDefault();
		dragDepth = 0;
		const file = event.dataTransfer?.files?.[0];
		if (file) void uploadFile(file);
	}
</script>

<dialog bind:this={dialog} class="modal">
	<div class="modal-box max-w-2xl">
		<h3 class="text-lg font-bold">Drive media — {category}</h3>
		<p class="mt-1 text-sm text-base-content/70">
			Upload a new file or pick an existing one from the portal folder on PHH-DRIVE.
		</p>

		<div
			class="mt-4 rounded-box border-2 border-dashed p-6 text-center transition-colors {dragDepth > 0
				? 'border-primary bg-primary/5'
				: 'border-base-300'}"
			ondragenter={() => (dragDepth += 1)}
			ondragleave={() => (dragDepth = Math.max(0, dragDepth - 1))}
			ondragover={(e) => e.preventDefault()}
			ondrop={onDrop}
			role="region"
			aria-label="Upload drop zone"
		>
			<LucideUpload class="mx-auto mb-2 size-8 text-base-content/50" aria-hidden="true" />
			<p class="text-sm text-base-content/70">Drag a file here or</p>
			<label class="btn btn-primary btn-sm mt-2">
				Choose file
				<input type="file" class="hidden" {accept} onchange={onFileInputChange} disabled={uploading} />
			</label>
			{#if uploading}
				<div class="mt-3 flex items-center justify-center gap-2 text-sm">
					<LoadingSpinner size="sm" />
					Uploading…
				</div>
			{/if}
		</div>

		<div class="mt-6">
			<div class="mb-2 flex items-center gap-2">
				<LucideFolderOpen class="size-4" aria-hidden="true" />
				<h4 class="font-medium">Files in this folder</h4>
			</div>

			{#if loading}
				<div class="flex items-center gap-2 py-6 text-sm text-base-content/70">
					<LoadingSpinner size="sm" />
					Loading…
				</div>
			{:else if files.length === 0}
				<p class="py-4 text-sm text-base-content/60">No files yet.</p>
			{:else}
				<ul class="max-h-64 divide-y divide-base-200 overflow-y-auto rounded-box border border-base-300">
					{#each files as file (file.id)}
						<li class="flex items-center justify-between gap-2 px-3 py-2">
							<div class="min-w-0">
								<p class="truncate font-medium">{file.name}</p>
								{#if file.updatedAt}
									<p class="text-xs text-base-content/50">
										{new Date(file.updatedAt).toLocaleString()}
									</p>
								{/if}
							</div>
							<div class="flex shrink-0 gap-1">
								<button
									type="button"
									class="btn btn-primary btn-xs"
									disabled={pickingId !== null || uploading}
									onclick={() => void pickFile(file.id)}
								>
									{pickingId === file.id ? '…' : 'Use'}
								</button>
								<button
									type="button"
									class="btn btn-ghost btn-xs text-error"
									disabled={pickingId !== null || uploading}
									aria-label="Trash {file.name}"
									onclick={() => void trashFile(file.id, file.name)}
								>
									<LucideTrash2 class="size-3.5" />
								</button>
							</div>
						</li>
					{/each}
				</ul>
			{/if}
		</div>

		{#if error}
			<div class="alert alert-error mt-4">
				<span>{error}</span>
			</div>
		{/if}

		<div class="modal-action">
			<button type="button" class="btn" onclick={close}>Close</button>
		</div>
	</div>
	<form method="dialog" class="modal-backdrop">
		<button aria-label="Close dialog">close</button>
	</form>
</dialog>
