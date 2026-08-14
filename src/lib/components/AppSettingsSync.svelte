<script lang="ts">
	import { onMount } from 'svelte';
	import type {
		AppBranding,
		PortalFontPolicy,
		PortalFontSizePolicy,
		PortalThemePolicy
	} from '$lib/constants/app-settings';
	import {
		appSettings,
		applyAppSettings,
		hydrateAppSettingsFromStorage,
		initAppSettingsFromServer,
		initPortalFontPolicyFromServer,
		initPortalFontSizePolicyFromServer,
		initPortalThemePolicyFromServer,
		watchSystemThemePreference
	} from '$lib/app-settings.svelte';

	let {
		branding,
		themePolicy,
		fontPolicy,
		fontSizePolicy
	}: {
		branding?: AppBranding;
		themePolicy?: PortalThemePolicy;
		fontPolicy?: PortalFontPolicy;
		fontSizePolicy?: PortalFontSizePolicy;
	} = $props();

	$effect(() => {
		initAppSettingsFromServer(branding);
		initPortalThemePolicyFromServer(themePolicy);
		initPortalFontPolicyFromServer(fontPolicy);
		initPortalFontSizePolicyFromServer(fontSizePolicy);
	});

	onMount(() => {
		// Apply server policies before hydrate so empty storage seeds portal defaults.
		initAppSettingsFromServer(branding);
		initPortalThemePolicyFromServer(themePolicy);
		initPortalFontPolicyFromServer(fontPolicy);
		initPortalFontSizePolicyFromServer(fontSizePolicy);
		hydrateAppSettingsFromStorage();
		applyAppSettings(appSettings);
		const stopWatchingSystem = watchSystemThemePreference(() => applyAppSettings(appSettings));
		const syncFromSharedStorage = () => {
			hydrateAppSettingsFromStorage();
			applyAppSettings(appSettings);
		};

		window.addEventListener('focus', syncFromSharedStorage);
		document.addEventListener('visibilitychange', syncFromSharedStorage);
		window.addEventListener('storage', syncFromSharedStorage);

		return () => {
			stopWatchingSystem();
			window.removeEventListener('focus', syncFromSharedStorage);
			document.removeEventListener('visibilitychange', syncFromSharedStorage);
			window.removeEventListener('storage', syncFromSharedStorage);
		};
	});
</script>
