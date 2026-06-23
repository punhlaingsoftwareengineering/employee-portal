<script lang="ts">
	let { children } = $props();
</script>

<div class="container mx-auto w-full max-w-2xl px-4 py-10">
	<div class="w-full space-y-6">
		{@render children()}
	</div>
</div>
