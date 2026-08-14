<script lang="ts">
	import type { PortalDriveCategory } from '$lib/constants/drive-media-categories';
	import type { ImageAspectRatio } from '$lib/constants/image-aspect';
	import { aspectHint } from '$lib/constants/image-aspect';
	import DriveMediaPickerDialog from '$lib/components/drive/DriveMediaPickerDialog.svelte';
	import { LucideHardDriveUpload } from '@lucide/svelte';

	let {
		category,
		accept = 'image/*',
		aspectRatio = null,
		disabled = false,
		onAppend
	}: {
		category: PortalDriveCategory;
		accept?: string;
		aspectRatio?: ImageAspectRatio | null;
		disabled?: boolean;
		onAppend: (url: string) => void;
	} = $props();

	let picker = $state<DriveMediaPickerDialog | null>(null);
</script>

<div class="flex flex-col gap-1">
	<button
		type="button"
		class="btn btn-secondary btn-sm"
		{disabled}
		onclick={() => picker?.open()}
	>
		<LucideHardDriveUpload class="size-4" />
		Add from Drive
	</button>
	{#if aspectRatio && accept.includes('image')}
		<p class="text-xs text-base-content/60">{aspectHint(aspectRatio)}</p>
	{/if}
</div>

<DriveMediaPickerDialog
	bind:this={picker}
	{category}
	{accept}
	{aspectRatio}
	onSelect={onAppend}
/>
