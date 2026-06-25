<script lang="ts">
	import { ArrowLeft } from 'lucide-svelte';
	import AppDetailPanel from '$lib/components/AppDetailPanel.svelte';
	import PrivatePageHeader from '$lib/components/PrivatePageHeader.svelte';

	let { data } = $props();
</script>

<svelte:head>
	<title>{data.app.name}</title>
</svelte:head>

<PrivatePageHeader title={data.app.name} />

<div>
	<a href="/tools" class="btn btn-ghost btn-sm gap-2">
		<ArrowLeft class="h-4 w-4" />
		Back to tools
	</a>
</div>

<AppDetailPanel app={data.app} />
