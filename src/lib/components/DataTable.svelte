<script lang="ts" generics="T">
	import type { Snippet } from 'svelte';
	import { setContext } from 'svelte';
	import { filterRows } from '$lib/utils/table-filter';
	import type { DataTableColumnHandle, DataTableContext } from '$lib/components/data-table.types';

	let {
		rows,
		rowKey,
		emptyMessage = 'No rows.',
		pageSize = 20,
		pageSizeOptions = [10, 20, 50],
		actions,
		children
	}: {
		rows: T[];
		rowKey: (row: T) => string;
		emptyMessage?: string;
		pageSize?: number;
		pageSizeOptions?: number[];
		actions?: Snippet<[{ row: T }]>;
		children?: Snippet;
	} = $props();

	const columnRegistry = new Map<string, DataTableColumnHandle<T>>();
	let columns = $state<DataTableColumnHandle<T>[]>([]);
	let filters = $state<Record<string, string>>({});
	let currentPageSize = $state(20);
	let currentPage = $state(1);
	let syncQueued = false;

	if (pageSize !== 20) {
		currentPageSize = pageSize;
	}

	function syncColumns() {
		if (syncQueued) return;
		syncQueued = true;
		queueMicrotask(() => {
			columns = Array.from(columnRegistry.values());
			syncQueued = false;
		});
	}

	setContext<DataTableContext<T>>('data-table', {
		register(column) {
			columnRegistry.set(column.id, column);
			syncColumns();
			return () => {
				columnRegistry.delete(column.id);
				syncColumns();
			};
		}
	});

	setContext('data-table-actions', {
		size: 'xs' as const,
		tooltipPlacement: 'tooltip-right' as const
	});

	const filteredRows = $derived.by(() => {
		const columnFilters = columns.map((column) => ({
			id: column.id,
			filterText: column.filterText
		}));
		return filterRows(rows, columnFilters, filters);
	});

	const totalFiltered = $derived(filteredRows.length);
	const totalPages = $derived(Math.max(1, Math.ceil(totalFiltered / currentPageSize)));
	const safeCurrentPage = $derived(Math.min(currentPage, totalPages));
	const paginatedRows = $derived(
		filteredRows.slice(
			(safeCurrentPage - 1) * currentPageSize,
			safeCurrentPage * currentPageSize
		)
	);
	const rangeStart = $derived(
		totalFiltered === 0 ? 0 : (safeCurrentPage - 1) * currentPageSize + 1
	);
	const rangeEnd = $derived(Math.min(safeCurrentPage * currentPageSize, totalFiltered));
	const columnCount = $derived(columns.length);

	function resetPage() {
		currentPage = 1;
	}
</script>

{#if children}
	<div class="hidden" aria-hidden="true">
		{@render children()}
	</div>
{/if}

<div class="overflow-x-auto rounded-box border border-base-300">
	<table class="table data-table">
		<thead>
			<tr>
				<th class="sticky-col-actions" scope="col" aria-label="Actions"></th>
				<th class="sticky-col-serial" scope="col">#</th>
				{#each columns as column (column.id)}
					<th
						scope="col"
						class={column.class}
						class:sticky-col-first={column.firstData}
					>
						<input
							type="search"
							class="input input-bordered input-xs w-full min-w-[8rem]"
							placeholder={column.label}
							value={filters[column.id] ?? ''}
							oninput={(event) => {
								const value = event.currentTarget.value;
								filters = { ...filters, [column.id]: value };
								resetPage();
							}}
						/>
					</th>
				{/each}
			</tr>
		</thead>
		<tbody>
			{#each paginatedRows as row, index (rowKey(row))}
				<tr>
					<td class="sticky-col-actions">
						{#if actions}
							<div class="flex flex-nowrap gap-1">
								{@render actions({ row })}
							</div>
						{/if}
					</td>
					<td class="sticky-col-serial text-base-content/70">
						{(safeCurrentPage - 1) * currentPageSize + index + 1}
					</td>
					{#each columns as column (column.id)}
						<td class={column.class} class:sticky-col-first={column.firstData}>
							{@render column.children({ row })}
						</td>
					{/each}
				</tr>
			{:else}
				<tr>
					<td colspan={2 + columnCount} class="text-center text-base-content/60">
						{emptyMessage}
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>

{#if totalFiltered > 0}
	<div class="mt-3 flex flex-wrap items-center justify-between gap-3">
		<label class="flex shrink-0 flex-nowrap items-center gap-2 text-xs text-base-content/70">
			<span class="whitespace-nowrap">Rows per page</span>
			<select
				class="select select-bordered select-xs h-7 min-h-7 w-14 px-2 text-xs"
				value={currentPageSize}
				onchange={(event) => {
					currentPageSize = Number(event.currentTarget.value);
					resetPage();
				}}
			>
				{#each pageSizeOptions as option (option)}
					<option value={option}>{option}</option>
				{/each}
			</select>
		</label>

		<div class="join">
			<button
				type="button"
				class="btn btn-xs join-item"
				disabled={safeCurrentPage <= 1}
				aria-label="Previous page"
				onclick={() => {
					currentPage = Math.max(1, safeCurrentPage - 1);
				}}
			>
				«
			</button>
			<button type="button" class="btn btn-xs join-item btn-disabled" tabindex="-1">
				{safeCurrentPage} / {totalPages}
			</button>
			<button
				type="button"
				class="btn btn-xs join-item"
				disabled={safeCurrentPage >= totalPages}
				aria-label="Next page"
				onclick={() => {
					currentPage = Math.min(totalPages, safeCurrentPage + 1);
				}}
			>
				»
			</button>
		</div>

		<p class="shrink-0 whitespace-nowrap text-xs text-base-content/70">
			{rangeStart}–{rangeEnd} of {totalFiltered}
		</p>
	</div>
{/if}
