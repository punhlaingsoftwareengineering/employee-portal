<script lang="ts">
	import type { Snippet } from 'svelte';
	import { getContext, onMount } from 'svelte';
	import type { DataTableContext } from '$lib/components/data-table.types';
	import { createId } from '$lib/utils/id';

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
		if (!children) return;

		const id = label.toLowerCase().replace(/[^a-z0-9]+/g, '-') || createId();

		return table.register({
			id,
			label,
			firstData,
			class: className || undefined,
			filterText,
			children
		});
	});
</script>

<span class="hidden" aria-hidden="true"></span>
