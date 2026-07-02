<script lang="ts">
	import { page } from '$app/state';
	import { BookOpen, GraduationCap, Layers, Smartphone } from '@lucide/svelte';
	import LoadingCenter from '$lib/components/LoadingCenter.svelte';
	import PrivatePageHeader from '$lib/components/PrivatePageHeader.svelte';
	import ToolGuidesPanel from '$lib/components/ToolGuidesPanel.svelte';
	import ToolLearningsPanel from '$lib/components/ToolLearningsPanel.svelte';
	import AppsManageTable from '$lib/components/tools-manage/AppsManageTable.svelte';
	import ServicesManageTable from '$lib/components/tools-manage/ServicesManageTable.svelte';
	import { getApps } from '$lib/remotes/app.remote';
	import { getServices } from '$lib/remotes/service.remote';

	let { children } = $props();

	const onServices = $derived(page.url.pathname.startsWith('/tools/manage/services'));
	const onApps = $derived(page.url.pathname.startsWith('/tools/manage/apps'));
	const onGuide = $derived(page.url.pathname.startsWith('/tools/manage/guide'));
	const onLearning = $derived(page.url.pathname.startsWith('/tools/manage/learning'));
</script>

<svelte:boundary>
	{@const services = await getServices()}
	{@const apps = await getApps()}

	<PrivatePageHeader title="Manage tools" />

	<p class="text-base-content/70">
		Register services and apps, and manage PDF guides and learning videos.
	</p>

	<div class="tabs tabs-lift">
		<a
			href="/tools/manage/services"
			class="tab"
			class:tab-active={onServices}
			data-sveltekit-preload-data="hover"
			data-sveltekit-preload-code="hover"
		>
			<Layers class="size-4 me-2" />
			Services
		</a>
		<div class="tab-content bg-base-100 border-base-300 p-6">
			{#if onServices}
				<ServicesManageTable {services} />
			{/if}
		</div>

		<a
			href="/tools/manage/apps"
			class="tab"
			class:tab-active={onApps}
			data-sveltekit-preload-data="hover"
			data-sveltekit-preload-code="hover"
		>
			<Smartphone class="size-4 me-2" />
			Apps
		</a>
		<div class="tab-content bg-base-100 border-base-300 p-6">
			{#if onApps}
				<AppsManageTable {apps} />
			{/if}
		</div>

		<a
			href="/tools/manage/guide"
			class="tab"
			class:tab-active={onGuide}
			data-sveltekit-preload-data="hover"
			data-sveltekit-preload-code="hover"
		>
			<BookOpen class="size-4 me-2" />
			Guide
		</a>
		<div class="tab-content bg-base-100 border-base-300 p-6">
			{#if onGuide}
				<ToolGuidesPanel />
			{/if}
		</div>

		<a
			href="/tools/manage/learning"
			class="tab"
			class:tab-active={onLearning}
			data-sveltekit-preload-data="hover"
			data-sveltekit-preload-code="hover"
		>
			<GraduationCap class="size-4 me-2" />
			Learning
		</a>
		<div class="tab-content bg-base-100 border-base-300 p-6">
			{#if onLearning}
				<ToolLearningsPanel />
			{/if}
		</div>
	</div>

	{@render children?.()}

	{#snippet pending()}
		<PrivatePageHeader title="Manage tools" />
		<p class="text-base-content/70">Register services and apps for role assignment.</p>
		<LoadingCenter />
	{/snippet}

	{#snippet failed(error)}
		<div class="alert alert-error">
			<span>{error instanceof Error ? error.message : 'Failed to load tools'}</span>
		</div>
	{/snippet}
</svelte:boundary>
