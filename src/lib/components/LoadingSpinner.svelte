<script lang="ts">
	import { LoaderCircle } from '@lucide/svelte';

	let {
		size = 'md',
		class: className = ''
	}: {
		size?: 'sm' | 'md' | 'lg';
		class?: string;
	} = $props();

	const sizeClass = $derived(
		{
			sm: 'h-4 w-4',
			md: 'h-6 w-6',
			lg: 'h-8 w-8'
		}[size]
	);
</script>

<LoaderCircle class="{sizeClass} animate-spin {className}" aria-hidden="true" />
