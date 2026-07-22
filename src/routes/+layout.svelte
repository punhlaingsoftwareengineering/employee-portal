<script lang="ts">
	import { page } from '$app/state';
	import { locales, localizeHref } from '$lib/paraglide/runtime';
	import AppSettingsSync from '$lib/components/AppSettingsSync.svelte';
	import LoadingProgressHost from '$lib/components/LoadingProgressHost.svelte';
	import PageTitle from '$lib/components/PageTitle.svelte';
	import SupportFab from '$lib/components/SupportFab.svelte';
	import ToastHost from '$lib/components/ToastHost.svelte';
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';

	let { data, children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<PageTitle />

<AppSettingsSync branding={data.appBranding} themePolicy={data.portalThemePolicy} fontPolicy={data.portalFontPolicy} />

<div class="min-h-screen bg-base-200">
	{@render children?.()}
</div>

<SupportFab canUseAiChat={data.canUseAiChat} />
<ToastHost />
<LoadingProgressHost />

<div style="display:none">
	{#each locales as locale (locale)}
		<a href={localizeHref(page.url.pathname, { locale })}>{locale}</a>
	{/each}
</div>
