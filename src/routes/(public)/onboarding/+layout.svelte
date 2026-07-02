<script lang="ts">
	import { setContext } from 'svelte';
	import { PAGE_TITLE_PREFIX_KEY } from '$lib/utils/page-title';

	let { children } = $props();

	setContext(PAGE_TITLE_PREFIX_KEY, 'Onboarding');
</script>

{@render children?.()}
