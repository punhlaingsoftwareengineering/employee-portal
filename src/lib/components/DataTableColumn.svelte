<script lang="ts">
	import type { Snippet } from 'svelte';
	import { getContext, onMount } from 'svelte';
	import type { DataTableContext } from '$lib/components/data-table.types';

	let {
		label,
		filterText,
		firstData = false,
		class: className = '',
		children
	}: {
		label: string;
		filterText: (row: any) => string;
		firstData?: boolean;
		class?: string;
		children: Snippet<[{ row: any }]>;
	} = $props();

	const table = getContext<DataTableContext<any>>('data-table');

	onMount(() => {
		const id = label.toLowerCase().replace(/[^a-z0-9]+/g, '-') || crypto.randomUUID();

		return table.register({
			id,
			get label() {
				return label;
			},
			get firstData() {
				return firstData;
			},
			get class() {
				return className || undefined;
			},
			get filterText() {
				return filterText;
			},
			get children() {
				return children;
			}
		});
	});
</script>

<span class="hidden" aria-hidden="true"></span>
