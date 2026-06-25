<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	import { AUTH_ROUTES } from '$lib/constants/auth-routes';
	import { appSettings } from '$lib/app-settings.svelte';
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

	let {
		logoutFormId = 'sidebar-logout',
		onNavigate
	}: {
		logoutFormId?: string;
		onNavigate?: () => void;
	} = $props();

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

	function handleNavigate() {
		onNavigate?.();
	}
</script>

<div class="portal-sidebar-nav flex h-full min-h-0 flex-col px-3 py-3">
	<header class="portal-panel-header -mx-3 shrink-0 px-3 pt-0">
		<h2 class="portal-panel-header__title">
			{appSettings.title}
		</h2>
	</header>

	<nav class="menu menu-sm my-2 min-h-0 flex-1 overflow-y-auto px-0">
		<ul>
		{#if !permissions?.isGuest}
			{#if canSeeDashboard}
				<li>
					<a
						href="/dashboard"
						class:active={page.url.pathname.startsWith('/dashboard')}
						data-sveltekit-preload-data="hover"
						onclick={handleNavigate}
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
						onclick={handleNavigate}
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
						onclick={handleNavigate}
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
						onclick={handleNavigate}
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
						onclick={handleNavigate}
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
						onclick={handleNavigate}
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
					onclick={handleNavigate}
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
					onclick={handleNavigate}
				>
					<UserCog class="h-4 w-4" />
					Users
				</a>
			</li>
		{/if}
		</ul>
	</nav>

	<footer class="-mx-3 shrink-0 border-t border-base-content/10 px-3 pt-2">
		<form
			id={logoutFormId}
			method="post"
			action={AUTH_ROUTES.logout}
			class="hidden"
			use:enhance={logoutLoading.enhanceSubmit}
		></form>
		<div class="menu menu-sm p-0">
			<ul>
				<li>
					<button type="submit" form={logoutFormId} disabled={logoutLoading.submitting}>
						{#if logoutLoading.submitting}
							<LoadingSpinner size="sm" />
						{:else}
							<LogOut class="h-4 w-4 shrink-0" />
						{/if}
						<span>Sign out</span>
					</button>
				</li>
			</ul>
		</div>
	</footer>
</div>
