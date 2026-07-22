<script lang="ts">
	import { FileSpreadsheet } from '@lucide/svelte';
	import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
	import { withFormFeedback } from '$lib/form-feedback.svelte';

	let {
		label = 'Override with Excel',
		disabled = false,
		confirmMessage,
		onImport
	}: {
		label?: string;
		disabled?: boolean;
		confirmMessage?: string;
		onImport: (payload: { fileBase64: string; fileName: string }) => Promise<void>;
	} = $props();

	let fileInput = $state<HTMLInputElement | null>(null);
	let importing = $state(false);

	function openPicker() {
		fileInput?.click();
	}

	async function handleFileChange(event: Event) {
		const input = event.currentTarget as HTMLInputElement;
		const file = input.files?.[0];
		input.value = '';
		if (!file) return;

		if (confirmMessage && !confirm(confirmMessage)) return;

		importing = true;
		try {
			await withFormFeedback({
				successMessage: 'Imported from Excel',
				errorMessage: 'Failed to import Excel file',
				action: async () => {
					const buffer = await file.arrayBuffer();
					const bytes = new Uint8Array(buffer);
					let binary = '';
					for (let i = 0; i < bytes.length; i += 1) {
						binary += String.fromCharCode(bytes[i]!);
					}
					await onImport({
						fileBase64: btoa(binary),
						fileName: file.name
					});
				}
			});
		} catch {
			// Toast already shown by withFormFeedback
		} finally {
			importing = false;
		}
	}
</script>

<div class="flex flex-col items-end gap-2">
	<input
		bind:this={fileInput}
		type="file"
		accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
		class="hidden"
		onchange={handleFileChange}
	/>
	<button
		type="button"
		class="btn btn-outline gap-2"
		onclick={openPicker}
		disabled={disabled || importing}
	>
		{#if importing}
			<LoadingSpinner size="sm" />
		{:else}
			<FileSpreadsheet class="h-4 w-4" />
		{/if}
		{label}
	</button>
</div>
