<script lang="ts">
	import type { PortalDriveCategory } from '$lib/constants/drive-media-categories';
	import DriveMediaPickerDialog from '$lib/components/drive/DriveMediaPickerDialog.svelte';
	import { LucideHardDriveUpload } from '@lucide/svelte';

	let {
		category,
		value = $bindable(''),
		accept = 'image/*',
		placeholder = 'https://…',
		required = false,
		disabled = false,
		inputClass = 'input input-bordered w-full max-w-md',
		onchange
	}: {
		category: PortalDriveCategory;
		value?: string;
		accept?: string;
		placeholder?: string;
		required?: boolean;
		disabled?: boolean;
		inputClass?: string;
		onchange?: () => void;
	} = $props();

	let picker = $state<DriveMediaPickerDialog | null>(null);

	const isImage = $derived(accept.includes('image'));

	function applyUrl(url: string) {
		value = url;
		onchange?.();
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
			onchange={() => onchange?.()}
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
	{#if value && isImage}
		<img src={value} alt="" class="h-16 w-16 rounded-box border border-base-300 object-cover" />
	{/if}
</div>

<DriveMediaPickerDialog bind:this={picker} {category} {accept} onSelect={applyUrl} />
