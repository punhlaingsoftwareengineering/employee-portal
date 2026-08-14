<script lang="ts">
	import type { PortalDriveCategory } from '$lib/constants/drive-media-categories';
	import type { ImageAspectRatio } from '$lib/constants/image-aspect';
	import { aspectHint } from '$lib/constants/image-aspect';
	import DriveMediaPickerDialog from '$lib/components/drive/DriveMediaPickerDialog.svelte';
	import { LucideHardDriveUpload } from '@lucide/svelte';
	import { normalizePublicDriveUrl } from '$lib/utils/drive-public-url';
	import {
		assertImageUrlAspect,
		isImageUrl
	} from '$lib/utils/image-aspect-ratio';

	let {
		category,
		value = $bindable(''),
		accept = 'image/*',
		aspectRatio = null,
		placeholder = 'https://…',
		required = false,
		disabled = false,
		inputClass = 'input input-bordered w-full max-w-md',
		onchange
	}: {
		category: PortalDriveCategory;
		value?: string;
		accept?: string;
		aspectRatio?: ImageAspectRatio | null;
		placeholder?: string;
		required?: boolean;
		disabled?: boolean;
		inputClass?: string;
		onchange?: () => void;
	} = $props();

	let picker = $state<DriveMediaPickerDialog | null>(null);
	let aspectError = $state<string | null>(null);
	let checkingAspect = $state(false);

	const acceptsImages = $derived(accept.includes('image'));
	const isImage = $derived(
		acceptsImages || isImageUrl(value) || /\.(avif|bmp|gif|jpe?g|png|svg|webp)(\?|#|$)/i.test(value)
	);

	const previewStyle = $derived.by(() => {
		if (!aspectRatio) return undefined;
		const maxH = 64;
		const h = maxH;
		const w = Math.round((maxH * aspectRatio.width) / aspectRatio.height);
		return `width:${Math.min(w, 200)}px;height:${h}px;`;
	});

	function applyUrl(url: string) {
		aspectError = null;
		value = normalizePublicDriveUrl(url);
		onchange?.();
	}

	async function validateCurrentUrl() {
		aspectError = null;
		const trimmed = value.trim();
		if (!trimmed || !aspectRatio || !acceptsImages) {
			onchange?.();
			return;
		}
		checkingAspect = true;
		try {
			await assertImageUrlAspect(trimmed, aspectRatio, {
				allowNonImage: accept.includes('pdf') || accept.includes('video')
			});
			onchange?.();
		} catch (e) {
			aspectError = e instanceof Error ? e.message : 'Invalid image aspect ratio';
			value = '';
			onchange?.();
		} finally {
			checkingAspect = false;
		}
	}

	function onInputChange() {
		value = normalizePublicDriveUrl(value);
		void validateCurrentUrl();
	}
</script>

<div class="flex w-full max-w-md flex-col gap-2">
	<div class="flex flex-wrap gap-2">
		<input
			type="url"
			bind:value
			class="{inputClass} min-w-0 flex-1 basis-40"
			{placeholder}
			{required}
			{disabled}
			onchange={onInputChange}
		/>
		<button
			type="button"
			class="btn btn-secondary btn-sm shrink-0"
			{disabled}
			onclick={() => picker?.open()}
		>
			<LucideHardDriveUpload class="size-4 shrink-0" />
			Upload
		</button>
	</div>
	{#if aspectRatio && acceptsImages}
		<p class="text-xs text-base-content/60">{aspectHint(aspectRatio)}</p>
	{/if}
	{#if checkingAspect}
		<p class="text-xs text-base-content/60">Checking image aspect ratio…</p>
	{/if}
	{#if aspectError}
		<p class="text-sm text-error">{aspectError}</p>
	{/if}
	{#if value && isImage}
		<img
			src={normalizePublicDriveUrl(value)}
			alt=""
			class="rounded-box border border-base-300 object-cover"
			style={previewStyle ?? 'width:4rem;height:4rem;'}
		/>
	{/if}
</div>

<DriveMediaPickerDialog
	bind:this={picker}
	{category}
	{accept}
	{aspectRatio}
	onSelect={applyUrl}
/>
