<script lang="ts">
	import { LayoutDashboard } from '@lucide/svelte';
	import PrivatePageHeader from '$lib/components/PrivatePageHeader.svelte';
	import ToolsGrid from '$lib/components/ToolsGrid.svelte';
</script>

<PrivatePageHeader title="Dashboard" icon={LayoutDashboard} />

<ToolsGrid enablePins />
