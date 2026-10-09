<script lang="ts">
	import { page } from '$app/state';
	import { locales, localizeHref } from '$lib/paraglide/runtime';
	import AppSettingsSync from '$lib/components/AppSettingsSync.svelte';
	import LoadingProgressHost from '$lib/components/LoadingProgressHost.svelte';
	import SupportFab from '$lib/components/SupportFab.svelte';
	import ToastHost from '$lib/components/ToastHost.svelte';
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { DEFAULT_APP_TITLE } from '$lib/constants/app-settings';

	let { data, children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>{DEFAULT_APP_TITLE}</title>
</svelte:head>

<AppSettingsSync
	branding={data.appBranding}
	themePolicy={data.portalThemePolicy}
	fontPolicy={data.portalFontPolicy}
	fontSizePolicy={data.portalFontSizePolicy}
/>

<div class="min-h-screen overscroll-none bg-base-200">
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
