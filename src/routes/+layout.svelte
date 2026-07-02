<script lang="ts">
	import type { Pathname } from '$app/types';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { locales, localizeHref } from '$lib/paraglide/runtime';
	import AppSettingsSync from '$lib/components/AppSettingsSync.svelte';
	import PageTitle from '$lib/components/PageTitle.svelte';
	import SupportFab from '$lib/components/SupportFab.svelte';
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';

	let { data, children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<PageTitle />

<AppSettingsSync branding={data.appBranding} themePolicy={data.portalThemePolicy} />

<div class="min-h-screen bg-base-200">
	{@render children?.()}
</div>

<SupportFab user={data.user} />

<div style="display:none">
	{#each locales as locale (locale)}
		<a href={resolve(localizeHref(page.url.pathname, { locale }) as Pathname)}>{locale}</a>
	{/each}
</div>
