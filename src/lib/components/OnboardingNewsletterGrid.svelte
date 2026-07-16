<script lang="ts">
	import { ExternalLink, FileText } from '@lucide/svelte';
	import type { Newsletter } from '$lib/server/db/schema/newsletter';

	let { newsletters }: { newsletters: Newsletter[] } = $props();
</script>

<ul class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
	{#each newsletters as item (item.id)}
		<li>
			<a
				href={item.pdfUrl}
				target="_blank"
				rel="noopener noreferrer"
				class="group flex h-full flex-col overflow-hidden rounded-box border border-base-300 bg-base-100 shadow-sm transition-shadow hover:shadow-md"
			>
				<div
					class="relative aspect-[3/4] overflow-hidden border-b border-base-300 bg-base-200"
					aria-hidden="true"
				>
					<object
						data={`${item.pdfUrl}#page=1&view=FitH&toolbar=0`}
						type="application/pdf"
						class="pointer-events-none h-full w-full"
						aria-label="{item.title} preview"
					>
						<div class="flex h-full w-full flex-col items-center justify-center gap-2 p-4 text-base-content/40">
							<FileText class="h-12 w-12" />
							<span class="text-xs">PDF</span>
						</div>
					</object>
					<span
						class="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-base-100/90 to-transparent px-3 pb-2 pt-8 text-center text-xs font-medium opacity-0 transition-opacity group-hover:opacity-100"
					>
						Open PDF
						<ExternalLink class="ml-1 inline h-3 w-3" />
					</span>
				</div>
				<div class="flex flex-1 items-start p-3">
					<p class="line-clamp-2 text-sm font-semibold leading-snug">{item.title}</p>
				</div>
			</a>
		</li>
	{/each}
</ul>
