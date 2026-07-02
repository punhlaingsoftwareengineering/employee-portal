<script lang="ts">
	import { page } from '$app/state';
	import { BookOpen, GraduationCap, Wrench } from '@lucide/svelte';
	import PrivatePageHeader from '$lib/components/PrivatePageHeader.svelte';

	let { children } = $props();

	const isAdmin = $derived(page.data.permissions?.isAdmin ?? false);

	const showTabs = $derived(
		!page.url.pathname.startsWith('/tools/manage') &&
			!page.url.pathname.startsWith('/tools/e-signature')
	);

	const onTools = $derived(page.url.pathname === '/tools');
	const onGuide = $derived(page.url.pathname.startsWith('/tools/guide'));
	const onLearning = $derived(page.url.pathname.startsWith('/tools/learning'));

	const toolsPageTitle = $derived(
		onGuide ? 'Guide' : onLearning ? 'Learning' : 'Tools'
	);
</script>

{#if showTabs}
	<PrivatePageHeader title={toolsPageTitle} icon={Wrench} />

	<p class="text-base-content/70">Services, apps, guides, and learning resources for your account.</p>

	{#if isAdmin}
		{@render children()}
	{:else}
		<div class="tabs tabs-lift">
			<a
				href="/tools"
				class="tab"
				class:tab-active={onTools}
				data-sveltekit-preload-data="hover"
			>
				<Wrench class="size-4 me-2" />
				Tools
			</a>
			<div class="tab-content bg-base-100 border-base-300 p-6">
				{#if onTools}
					{@render children()}
				{/if}
			</div>

			<a
				href="/tools/guide"
				class="tab"
				class:tab-active={onGuide}
				data-sveltekit-preload-data="hover"
			>
				<BookOpen class="size-4 me-2" />
				Guide
			</a>
			<div class="tab-content bg-base-100 border-base-300 p-6">
				{#if onGuide}
					{@render children()}
				{/if}
			</div>

			<a
				href="/tools/learning"
				class="tab"
				class:tab-active={onLearning}
				data-sveltekit-preload-data="hover"
			>
				<GraduationCap class="size-4 me-2" />
				Learning
			</a>
			<div class="tab-content bg-base-100 border-base-300 p-6">
				{#if onLearning}
					{@render children()}
				{/if}
			</div>
		</div>
	{/if}
{:else}
	{@render children()}
{/if}
