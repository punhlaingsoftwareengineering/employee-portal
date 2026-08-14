<script lang="ts">
	import { ExternalLink, FileText, Image } from '@lucide/svelte';
	import { normalizePublicDriveUrl } from '$lib/utils/drive-public-url';
	import { newsletterMediaKind, type NewsletterMediaKind } from '$lib/utils/newsletter-media';

	type NewsletterCard = {
		id: string;
		title: string;
		pdfUrl: string;
		mediaKind?: NewsletterMediaKind;
	};

	let { newsletters }: { newsletters: NewsletterCard[] } = $props();

	function openUrlFor(item: NewsletterCard): string {
		return normalizePublicDriveUrl(item.pdfUrl) || item.pdfUrl;
	}

	/** Same-origin proxy so PDF/image previews render inside the card. */
	function previewUrlFor(item: NewsletterCard): string {
		return `/api/public/newsletter-media/${item.id}`;
	}

	function kindFor(item: NewsletterCard): NewsletterMediaKind {
		return item.mediaKind ?? newsletterMediaKind(openUrlFor(item));
	}

	function pdfPreviewSrc(url: string): string {
		const hash = 'page=1&toolbar=0&navpanes=0&scrollbar=0&view=FitH';
		return url.includes('#') ? `${url}&${hash}` : `${url}#${hash}`;
	}
</script>

<ul class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
	{#each newsletters as item (item.id)}
		{@const openUrl = openUrlFor(item)}
		{@const previewUrl = previewUrlFor(item)}
		{@const kind = kindFor(item)}
		<li>
			<a
				href={openUrl}
				target="_blank"
				rel="noopener noreferrer"
				class="group flex h-full flex-col overflow-hidden rounded-box border border-base-300 bg-base-100 shadow-sm transition-shadow hover:shadow-md"
			>
				<div
					class="relative aspect-[4/5] overflow-hidden border-b border-base-300 bg-base-200"
					aria-hidden="true"
				>
					{#if kind === 'image'}
						<img
							src={previewUrl}
							alt=""
							class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
							loading="lazy"
						/>
					{:else}
						<iframe
							src={kind === 'pdf' ? pdfPreviewSrc(previewUrl) : previewUrl}
							title="{item.title} preview"
							class="newsletter-pdf-frame pointer-events-none absolute inset-0 z-[1] border-0 bg-base-100"
							loading="lazy"
							tabindex="-1"
						></iframe>
						<div
							class="absolute inset-0 z-0 flex h-full w-full flex-col items-center justify-center gap-2 p-4 text-base-content/40"
						>
							{#if kind === 'pdf'}
								<FileText class="h-10 w-10" />
								<span class="text-xs">PDF</span>
							{:else}
								<Image class="h-10 w-10" />
								<span class="text-xs">Preview</span>
							{/if}
						</div>
					{/if}
					<span
						class="pointer-events-none absolute inset-x-0 bottom-0 z-[2] bg-gradient-to-t from-base-100/90 to-transparent px-3 pb-2 pt-8 text-center text-xs font-medium opacity-0 transition-opacity group-hover:opacity-100"
					>
						{#if kind === 'image'}
							Open image
						{:else if kind === 'pdf'}
							Open PDF
						{:else}
							Open
						{/if}
						<ExternalLink class="ml-1 inline h-3 w-3" />
					</span>
				</div>
				<div class="flex flex-1 items-start p-2.5">
					<p class="line-clamp-2 text-sm font-semibold leading-snug">{item.title}</p>
				</div>
			</a>
		</li>
	{/each}
</ul>

<style>
	.newsletter-pdf-frame {
		width: 140%;
		height: 140%;
		transform: scale(0.72);
		transform-origin: top left;
	}
</style>
