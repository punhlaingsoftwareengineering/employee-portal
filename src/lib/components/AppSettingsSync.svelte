<script lang="ts">
	import { onMount } from 'svelte';
	import type { AppBranding, PortalFontPolicy, PortalThemePolicy } from '$lib/constants/app-settings';
	import {
		appSettings,
		applyAppSettings,
		hydrateAppSettingsFromStorage,
		initAppSettingsFromServer,
		initPortalFontPolicyFromServer,
		initPortalThemePolicyFromServer,
		watchSystemThemePreference
	} from '$lib/app-settings.svelte';

	let {
		branding,
		themePolicy,
		fontPolicy
	}: {
		branding?: AppBranding;
		themePolicy?: PortalThemePolicy;
		fontPolicy?: PortalFontPolicy;
	} = $props();

	$effect(() => {
		initAppSettingsFromServer(branding);
		initPortalThemePolicyFromServer(themePolicy);
		initPortalFontPolicyFromServer(fontPolicy);
	});

	onMount(() => {
		hydrateAppSettingsFromStorage();
		applyAppSettings(appSettings);
		return watchSystemThemePreference(() => applyAppSettings(appSettings));
	});
</script>
