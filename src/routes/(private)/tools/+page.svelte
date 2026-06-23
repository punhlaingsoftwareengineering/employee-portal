<script lang="ts">
	import { Wrench } from 'lucide-svelte';
	import ToolsGrid from '$lib/components/ToolsGrid.svelte';
</script>

<div class="mb-6">
	<h1 class="flex items-center gap-2 text-2xl font-bold">
		<Wrench class="h-6 w-6" />
		Tools
	</h1>
	<p class="mt-1 text-base-content/70">Services and apps available for your account.</p>
</div>

<ToolsGrid />
