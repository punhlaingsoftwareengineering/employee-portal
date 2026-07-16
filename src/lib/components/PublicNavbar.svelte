<script lang="ts">
	import { page } from '$app/state';
	import PortalIcon from '$lib/components/PortalIcon.svelte';
	import NotificationBell from '$lib/components/NotificationBell.svelte';
	import { AUTH_ROUTES } from '$lib/constants/auth-routes';
	import { DEFAULT_APP_TITLE } from '$lib/constants/app-settings';
	import { PUBLIC_ROUTES } from '$lib/constants/public-routes';
	import { appSettings } from '$lib/app-settings.svelte';

	const notifications = $derived(page.data.notifications ?? []);
	const defaultSoundUrl = $derived(page.data.defaultSoundUrl ?? null);
	const docsHref = $derived(page.data.docsHref ?? null);

	const onboardingSections = $derived(
		page.data.onboardingSections ?? { hasServices: false, hasApps: false }
	);
	const onTipsPage = $derived(
		page.url.pathname === PUBLIC_ROUTES.tipsAndTutorials ||
			page.url.pathname.startsWith(`${PUBLIC_ROUTES.tipsAndTutorials}/`)
	);
	const onCommunityPage = $derived(
		page.url.pathname === PUBLIC_ROUTES.community ||
			page.url.pathname.startsWith(`${PUBLIC_ROUTES.community}/`)
	);
	const onServicesPage = $derived(page.url.pathname === PUBLIC_ROUTES.services);
	const onAppsPage = $derived(page.url.pathname === PUBLIC_ROUTES.apps);
</script>

<div class="navbar bg-base-100 border-b border-base-300 shadow-sm">
	<div class="navbar-start">
		<a href={PUBLIC_ROUTES.onboarding} class="btn btn-ghost gap-2 text-xl font-bold">
			<PortalIcon iconUrl={appSettings.iconUrl} class="h-6 w-6" />
			{appSettings.title || DEFAULT_APP_TITLE}
		</a>
	</div>

	<div class="navbar-center hidden md:flex">
		<ul class="menu menu-horizontal px-1">
			{#if docsHref}
				<li>
					<a href={docsHref} target="_blank" rel="noopener noreferrer">Docs</a>
				</li>
			{/if}
			<li>
				<a href={PUBLIC_ROUTES.tipsAndTutorials} class:active={onTipsPage}>Tips & Tutorials</a>
			</li>
			<li>
				<a href={PUBLIC_ROUTES.community} class:active={onCommunityPage}>Community</a>
			</li>
			{#if onboardingSections.hasServices}
				<li>
					<a href={PUBLIC_ROUTES.services} class:active={onServicesPage}>Services</a>
				</li>
			{/if}
			{#if onboardingSections.hasApps}
				<li>
					<a href={PUBLIC_ROUTES.apps} class:active={onAppsPage}>Apps</a>
				</li>
			{/if}
		</ul>
	</div>

	<div class="navbar-end gap-2">
		<NotificationBell initialNotifications={notifications} {defaultSoundUrl} />
		<a href={AUTH_ROUTES.login} class="btn btn-ghost">Sign in</a>
		<a href={AUTH_ROUTES.signup} class="btn btn-primary">Get started</a>
	</div>
</div>
