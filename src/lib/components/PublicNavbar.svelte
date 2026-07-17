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

	const user = $derived(page.data.user ?? null);
	const userDisplayName = $derived(
		user?.name?.trim() || user?.email?.split('@')[0] || 'Account'
	);
	const userInitials = $derived.by(() => {
		const source = user?.name?.trim() || user?.email || '';
		const parts = source.split(/\s+/).filter(Boolean);

		if (parts.length >= 2) {
			return `${parts[0]![0] ?? ''}${parts[parts.length - 1]![0] ?? ''}`.toUpperCase();
		}

		if (parts.length === 1) {
			return parts[0]!.slice(0, 2).toUpperCase();
		}

		return '?';
	});
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
		{#if user}
			<a href="/dashboard" class="btn btn-ghost max-w-48 gap-2 pl-2 pr-3">
				{#if user.image}
					<div class="avatar">
						<div class="w-8 rounded-full">
							<img src={user.image} alt="" />
						</div>
					</div>
				{:else}
					<div class="avatar avatar-placeholder">
						<div class="w-8 rounded-full bg-neutral text-neutral-content">
							<span class="text-xs">{userInitials}</span>
						</div>
					</div>
				{/if}
				<span class="hidden truncate sm:inline">{userDisplayName}</span>
			</a>
		{:else}
			<a href={AUTH_ROUTES.login} class="btn btn-primary">Sign in</a>
		{/if}
	</div>
</div>
