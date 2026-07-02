<script lang="ts">
	import { onMount } from 'svelte';
	import type { AppBranding, PortalThemePolicy } from '$lib/constants/app-settings';
	import {
		appSettings,
		applyAppSettings,
		hydrateAppSettingsFromStorage,
		initAppSettingsFromServer,
		initPortalThemePolicyFromServer,
		watchSystemThemePreference
	} from '$lib/app-settings.svelte';

	let {
		branding,
		themePolicy
	}: {
		branding?: AppBranding;
		themePolicy?: PortalThemePolicy;
	} = $props();

	$effect(() => {
		initAppSettingsFromServer(branding);
		initPortalThemePolicyFromServer(themePolicy);
	});

	onMount(() => {
		hydrateAppSettingsFromStorage();
		applyAppSettings(appSettings);
		return watchSystemThemePreference(() => applyAppSettings(appSettings));
	});
</script>
