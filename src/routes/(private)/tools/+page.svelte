<script lang="ts">
	import { Wrench } from 'lucide-svelte';
	import PrivatePageHeader from '$lib/components/PrivatePageHeader.svelte';
	import ToolsGrid from '$lib/components/ToolsGrid.svelte';
</script>

<PrivatePageHeader title="Tools" icon={Wrench} />

<p class="text-base-content/70">Services and apps available for your account.</p>

<ToolsGrid />
