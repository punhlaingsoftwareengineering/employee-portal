<script lang="ts">
	import type { PortalDriveCategory } from '$lib/constants/drive-media-categories';
	import DriveMediaPickerDialog from '$lib/components/drive/DriveMediaPickerDialog.svelte';
	import { LucideHardDriveUpload } from '@lucide/svelte';

	let {
		category,
		accept = 'image/*',
		disabled = false,
		onAppend
	}: {
		category: PortalDriveCategory;
		accept?: string;
		disabled?: boolean;
		onAppend: (url: string) => void;
	} = $props();

	let picker = $state<DriveMediaPickerDialog | null>(null);
</script>

<button
	type="button"
	class="btn btn-secondary btn-sm"
	{disabled}
	onclick={() => picker?.open()}
>
	<LucideHardDriveUpload class="size-4" />
	Add from Drive
</button>

<DriveMediaPickerDialog bind:this={picker} {category} {accept} onSelect={onAppend} />
