<script lang="ts">
	import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';

	let {
		size = 'lg',
		class: className = ''
	}: {
		size?: 'sm' | 'md' | 'lg';
		class?: string;
	} = $props();
</script>

<div class="flex justify-center py-12 {className}">
	<LoadingSpinner {size} />
</div>
