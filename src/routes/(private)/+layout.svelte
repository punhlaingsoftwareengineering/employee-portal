<script lang="ts">
	import { appSettings } from '$lib/app-settings.svelte';
	import PortalIcon from '$lib/components/PortalIcon.svelte';
	import PortalSidebarNav from '$lib/components/PortalSidebarNav.svelte';
	import SidebarResizeHandle from '$lib/components/SidebarResizeHandle.svelte';
	import { sidebarLayout } from '$lib/sidebar-layout.svelte';
	import { page } from '$app/state';

	let { children } = $props();

	function closeDrawer() {
		const toggle = document.getElementById('app-drawer');
		if (toggle instanceof HTMLInputElement) toggle.checked = false;
	}
</script>

<div
	class="portal-private relative min-h-screen lg:flex lg:h-screen lg:overflow-hidden"
	style:--portal-navbar-height="4rem"
>
	<!-- Desktop sidebar -->
	<aside
		class="relative hidden shrink-0 overflow-hidden border-r border-base-content/10 bg-base-300 lg:block lg:h-screen"
		class:sidebar-width-transition={!sidebarLayout.resizing}
		style:width="{sidebarLayout.width}px"
	>
		<PortalSidebarNav logoutFormId="sidebar-logout-desktop" />
		<SidebarResizeHandle />
	</aside>

	<div class="flex min-h-screen min-w-0 flex-1 flex-col bg-base-100 lg:min-h-0 lg:overflow-y-auto">
		<header class="navbar border-b border-base-content/10 bg-base-100 lg:hidden">
			<label for="app-drawer" class="btn btn-ghost btn-square" aria-label="Open menu">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-5 w-5"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M4 6h16M4 12h16M4 18h16"
					/>
				</svg>
			</label>
			<span class="flex items-center gap-2 font-semibold">
				<PortalIcon iconUrl={appSettings.iconUrl} class="h-5 w-5" />
				{appSettings.title}
			</span>
		</header>

		<main class="portal-private-main">
			{#key page.url.pathname}
				{@render children()}
			{/key}
		</main>
	</div>

	<!-- Mobile nav overlay (page content stays in main above) -->
	<div class="drawer lg:hidden">
		<input id="app-drawer" type="checkbox" class="drawer-toggle" />
		<div class="drawer-content pointer-events-none fixed inset-0 h-0 w-0 overflow-hidden opacity-0"></div>
		<div class="drawer-side z-40">
			<label for="app-drawer" class="drawer-overlay" aria-label="Close menu"></label>
			<aside class="flex h-full min-h-0 w-64 flex-col overflow-hidden border-r border-base-content/10 bg-base-300">
				<PortalSidebarNav logoutFormId="sidebar-logout-mobile" onNavigate={closeDrawer} />
			</aside>
		</div>
	</div>
</div>
