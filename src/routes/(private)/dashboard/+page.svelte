<script lang="ts">
	import { LayoutDashboard } from 'lucide-svelte';
	import ToolsGrid from '$lib/components/ToolsGrid.svelte';
</script>

<div class="mb-6">
	<h1 class="flex items-center gap-2 text-2xl font-bold">
		<LayoutDashboard class="h-6 w-6" />
		Dashboard
	</h1>
</div>

<ToolsGrid />
