<script lang="ts" generics="T">
	import { Download } from '@lucide/svelte';
	import { toast } from '$lib/toast.svelte';
	import {
		exportTableRows,
		type ExportColumn,
		type TableExportFormat
	} from '$lib/utils/table-export';

	let {
		rows,
		columns,
		fileBaseName,
		disabled = false
	}: {
		rows: T[];
		columns: ExportColumn<T>[];
		fileBaseName: string;
		disabled?: boolean;
	} = $props();

	let exporting = $state(false);

	function handleExport(format: TableExportFormat) {
		if (disabled || exporting) return;
		exporting = true;
		try {
			exportTableRows(rows, columns, fileBaseName, format);
			toast.success(
				`Exported ${rows.length} row${rows.length === 1 ? '' : 's'} as ${format.toUpperCase()}`
			);
			(document.activeElement as HTMLElement | null)?.blur();
		} catch (err) {
			toast.error(err instanceof Error ? err.message : 'Failed to export');
		} finally {
			exporting = false;
		}
	}
</script>

<div class="dropdown dropdown-end">
	<button
		type="button"
		tabindex="0"
		class="btn cursor-pointer gap-2 disabled:cursor-not-allowed"
		disabled={disabled || exporting}
		aria-haspopup="menu"
		aria-label="Export"
	>
		{#if exporting}
			<span class="loading loading-sm loading-spinner"></span>
		{:else}
			<Download class="h-4 w-4" />
		{/if}
		Export
	</button>
	<ul
		tabindex="-1"
		role="menu"
		class="menu dropdown-content z-50 mt-2 w-44 rounded-box border border-base-300 bg-base-100 p-2 shadow-lg"
	>
		<li role="none">
			<button
				type="button"
				role="menuitem"
				class="cursor-pointer"
				disabled={disabled || exporting}
				onclick={() => handleExport('csv')}
			>
				CSV
			</button>
		</li>
		<li role="none">
			<button
				type="button"
				role="menuitem"
				class="cursor-pointer"
				disabled={disabled || exporting}
				onclick={() => handleExport('xlsx')}
			>
				XLSX
			</button>
		</li>
	</ul>
</div>
