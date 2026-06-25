<script lang="ts">
	import {
		MAX_SIDEBAR_WIDTH,
		MIN_SIDEBAR_WIDTH
	} from '$lib/constants/app-settings';
	import { sidebarLayout } from '$lib/sidebar-layout.svelte';

	let handleEl = $state<HTMLDivElement | null>(null);
	let startX = $state(0);
	let startWidth = $state(0);

	function onPointerDown(event: PointerEvent) {
		if (event.button !== 0) return;

		startX = event.clientX;
		startWidth = sidebarLayout.width;
		sidebarLayout.resizing = true;
		document.body.classList.add('sidebar-resizing');
		handleEl?.setPointerCapture(event.pointerId);
		event.preventDefault();
	}

	function onPointerMove(event: PointerEvent) {
		if (!sidebarLayout.resizing) return;

		const delta = event.clientX - startX;
		sidebarLayout.setWidth(startWidth + delta);
	}

	function onPointerUp(event: PointerEvent) {
		if (!sidebarLayout.resizing) return;

		sidebarLayout.resizing = false;
		document.body.classList.remove('sidebar-resizing');
		sidebarLayout.persistWidth();
		handleEl?.releasePointerCapture(event.pointerId);
	}
</script>

<div
	bind:this={handleEl}
	class="absolute top-0 right-0 z-10 hidden h-full w-1.5 cursor-col-resize touch-none hover:bg-base-content/10 lg:block"
	role="separator"
	aria-orientation="vertical"
	aria-label="Resize sidebar"
	aria-valuemin={MIN_SIDEBAR_WIDTH}
	aria-valuemax={MAX_SIDEBAR_WIDTH}
	aria-valuenow={sidebarLayout.width}
	aria-valuetext="{sidebarLayout.width} pixels"
	onpointerdown={onPointerDown}
	onpointermove={onPointerMove}
	onpointerup={onPointerUp}
	onpointercancel={onPointerUp}
></div>
