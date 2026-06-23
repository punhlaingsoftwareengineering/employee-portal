<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	import { AUTH_ROUTES } from '$lib/constants/auth-routes';
	import { appSettings } from '$lib/app-settings.svelte';
	import PortalIcon from '$lib/components/PortalIcon.svelte';
	import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
	import { createFormLoading } from '$lib/form-loading.svelte';
	import {
		Users,
		Building2,
		Warehouse,
		LogOut,
		Shield,
		UserCog,
		Settings,
		LayoutDashboard,
		Wrench
	} from 'lucide-svelte';

	let { children } = $props();
	const logoutLoading = createFormLoading();

	const permissions = $derived(page.data.permissions);
	const isAdmin = $derived(permissions?.isAdmin ?? false);
	const availableServices = $derived(page.data.availableServices ?? []);
	const availableApps = $derived(page.data.availableApps ?? []);

	const hasAnyTools = $derived(
		isAdmin || availableServices.length > 0 || availableApps.length > 0
	);

	const canSeeDashboard = $derived(
		isAdmin ||
			(permissions?.departmentRoles?.some((a) => a.permissions.navDashboard) ?? false)
	);
	const canSeeEmployees = $derived(
		isAdmin ||
			(permissions?.departmentRoles?.some((a) => a.permissions.navEmployees) ?? false)
	);
	const canSeeDepartments = $derived(
		isAdmin ||
			(permissions?.departmentRoles?.some((a) => a.permissions.navDepartments) ?? false)
	);
	const canSeeFacilities = $derived(
		isAdmin ||
			(permissions?.departmentRoles?.some((a) => a.permissions.navFacilities) ?? false)
	);
	const canSeeTools = $derived(
		hasAnyTools &&
			(isAdmin || (permissions?.departmentRoles?.some((a) => a.permissions.navTools) ?? false))
	);
	const canSeeSettings = $derived(
		isAdmin ||
			(permissions?.departmentRoles?.some((a) => a.permissions.navSettings) ?? false)
	);

	const employeeNavAllowed = $derived(
		canSeeEmployees &&
			!permissions?.isGuest &&
			(isAdmin ||
				(permissions?.departmentRoles?.some((a) => {
					const p = a.permissions;
					return p.employeeReadAll || p.employeeWrite || p.employeeDelete;
				}) ??
					false))
	);

	const departmentNavAllowed = $derived(
		canSeeDepartments &&
			!permissions?.isGuest &&
			(isAdmin ||
				(permissions?.departmentRoles?.some((a) => {
					const p = a.permissions;
					return p.departmentReadAll || p.departmentWrite;
				}) ??
					false))
	);
	const facilityNavAllowed = $derived(
		canSeeFacilities &&
			!permissions?.isGuest &&
			(isAdmin ||
				(permissions?.departmentRoles?.some((a) => {
					const p = a.permissions;
					return p.facilityReadAll || p.facilityWrite;
				}) ??
					false))
	);
	const toolsNavActive = $derived(
		page.url.pathname === '/tools' ||
			page.url.pathname.startsWith('/tools/manage') ||
			page.url.pathname.startsWith('/apps/')
	);
	const toolsNavHref = $derived(isAdmin ? '/tools/manage' : '/tools');

	function closeDrawer() {
		const toggle = document.getElementById('app-drawer');
		if (toggle instanceof HTMLInputElement) toggle.checked = false;
	}
</script>

<div class="drawer lg:drawer-open portal-private">
	<input id="app-drawer" type="checkbox" class="drawer-toggle" />
	<div class="drawer-content flex min-h-screen flex-col bg-base-100">
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
		<main class="flex-1 p-6">
			{#key page.url.pathname}
				{@render children()}
			{/key}
		</main>
	</div>
	<div class="drawer-side z-40">
		<label for="app-drawer" class="drawer-overlay" aria-label="Close menu"></label>
		<aside
			class="menu flex min-h-full w-64 flex-col border-r border-base-content/10 bg-base-300 p-4"
		>
			<h2 class="menu-title flex items-center gap-2 px-4 text-lg font-bold">
				<PortalIcon iconUrl={appSettings.iconUrl} class="h-5 w-5" />
				{appSettings.title}
			</h2>
			<ul>
				{#if !permissions?.isGuest}
					{#if canSeeDashboard}
						<li>
							<a
								href="/dashboard"
								class:active={page.url.pathname.startsWith('/dashboard')}
								data-sveltekit-preload-data="hover"
								onclick={closeDrawer}
							>
								<LayoutDashboard class="h-4 w-4" />
								Dashboard
							</a>
						</li>
					{/if}
					{#if employeeNavAllowed}
						<li>
							<a
								href="/employees"
								class:active={page.url.pathname.startsWith('/employees')}
								data-sveltekit-preload-data="hover"
								onclick={closeDrawer}
							>
								<Users class="h-4 w-4" />
								Employees
							</a>
						</li>
					{/if}
					{#if departmentNavAllowed}
						<li>
							<a
								href="/departments"
								class:active={page.url.pathname.startsWith('/departments')}
								data-sveltekit-preload-data="hover"
								onclick={closeDrawer}
							>
								<Building2 class="h-4 w-4" />
								Departments
							</a>
						</li>
					{/if}
					{#if facilityNavAllowed}
						<li>
							<a
								href="/facilities"
								class:active={page.url.pathname.startsWith('/facilities')}
								data-sveltekit-preload-data="hover"
								onclick={closeDrawer}
							>
								<Warehouse class="h-4 w-4" />
								Facilities
							</a>
						</li>
					{/if}
					{#if canSeeTools}
						<li>
							<a
								href={toolsNavHref}
								class:active={toolsNavActive}
								data-sveltekit-preload-data="hover"
								onclick={closeDrawer}
							>
								<Wrench class="h-4 w-4" />
								Tools
							</a>
						</li>
					{/if}
					{#if canSeeSettings}
						<li>
							<a
								href="/settings"
								class:active={page.url.pathname.startsWith('/settings')}
								data-sveltekit-preload-data="hover"
								onclick={closeDrawer}
							>
								<Settings class="h-4 w-4" />
								Settings
							</a>
						</li>
					{/if}
				{/if}
				{#if isAdmin}
					<li>
						<a
							href="/roles"
							class:active={page.url.pathname.startsWith('/roles')}
							data-sveltekit-preload-data="hover"
							onclick={closeDrawer}
						>
							<Shield class="h-4 w-4" />
							Roles
						</a>
					</li>
					<li>
						<a
							href="/users"
							class:active={page.url.pathname.startsWith('/users')}
							data-sveltekit-preload-data="hover"
							onclick={closeDrawer}
						>
							<UserCog class="h-4 w-4" />
							Users
						</a>
					</li>
				{/if}
			</ul>
			<div class="mt-auto border-t border-base-content/10 pt-4">
				<form
					id="sidebar-logout"
					method="post"
					action={AUTH_ROUTES.logout}
					class="hidden"
					use:enhance={logoutLoading.enhanceSubmit}
				></form>
				<ul>
					<li>
						<button type="submit" form="sidebar-logout" disabled={logoutLoading.submitting}>
							{#if logoutLoading.submitting}
								<LoadingSpinner size="sm" />
							{:else}
								<LogOut class="h-4 w-4" />
							{/if}
							Sign out
						</button>
					</li>
				</ul>
			</div>
		</aside>
	</div>
</div>
