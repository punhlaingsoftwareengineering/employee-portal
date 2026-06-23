<script lang="ts">
	import { browser } from '$app/environment';
	import type { AppBranding } from '$lib/app-settings.svelte';
	import {
		appSettings,
		applyAppSettings,
		hydrateAppSettingsFromStorage,
		initAppSettingsFromServer
	} from '$lib/app-settings.svelte';

	let { branding }: { branding?: AppBranding } = $props();

	if (browser) {
		hydrateAppSettingsFromStorage();
	}

	$effect.pre(() => {
		if (!browser) {
			initAppSettingsFromServer(branding);
		}
		applyAppSettings(appSettings);
	});
</script>
