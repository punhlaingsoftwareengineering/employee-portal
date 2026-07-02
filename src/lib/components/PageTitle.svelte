<script lang="ts">
	import { getContext } from 'svelte';
	import { page } from '$app/state';
	import { appSettings } from '$lib/app-settings.svelte';
	import { DEFAULT_APP_TITLE } from '$lib/constants/app-settings';
	import {
		formatPageTitle,
		PAGE_TITLE_PREFIX_KEY
	} from '$lib/utils/page-title';

	let {
		title = '',
		prefix
	}: {
		title?: string;
		prefix?: string;
	} = $props();

	const contextPrefix = getContext<string | undefined>(PAGE_TITLE_PREFIX_KEY);

	const appName = $derived(
		appSettings.title ||
			page.data.appBranding?.title ||
			DEFAULT_APP_TITLE
	);

	const documentTitle = $derived(
		formatPageTitle(
			[prefix ?? contextPrefix ?? '', title].filter(Boolean),
			appName
		)
	);
</script>

<svelte:head>
	<title>{documentTitle}</title>
</svelte:head>
