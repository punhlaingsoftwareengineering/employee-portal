<script lang="ts">
	import { browser } from '$app/environment';
	import { ChevronLeft, ChevronRight, Download } from 'lucide-svelte';
	import { APP_DOWNLOAD_PLATFORM_LABELS } from '$lib/constants/app-download';
	import ServiceIcon from '$lib/components/ServiceIcon.svelte';
	import type { App } from '$lib/server/db/schema/app';
	import {
		detectDownloadPlatform,
		listDownloadEntries,
		orderDownloadsForPlatform
	} from '$lib/utils/app-download';

	let { app }: { app: App } = $props();

	const screenshots = $derived(app.screenshotUrls ?? []);
	const metaParts = $derived(
		[app.tagline, app.developer, app.version ? `v${app.version}` : null].filter(Boolean)
	);
	const downloads = $derived(listDownloadEntries(app.downloadUrls, app.downloadUrl));
	const detectedPlatform = $derived(browser ? detectDownloadPlatform() : null);
	const orderedDownloads = $derived(orderDownloadsForPlatform(downloads, detectedPlatform));

	function screenshotSlideId(index: number): string {
		return `screenshot-${app.id}-${index + 1}`;
	}

	function prevScreenshotHref(index: number): string {
		const target = index === 0 ? screenshots.length : index;
		return `#${screenshotSlideId(target - 1)}`;
	}

	function nextScreenshotHref(index: number): string {
		const target = index === screenshots.length - 1 ? 1 : index + 2;
		return `#${screenshotSlideId(target - 1)}`;
	}
</script>

<div class="card bg-base-100 overflow-hidden shadow-sm">
	{#if app.bannerUrl}
		<figure class="h-28 w-full bg-base-200 sm:h-32">
			<img src={app.bannerUrl} alt="" class="h-full w-full object-cover" />
		</figure>
	{:else}
		<div class="h-28 w-full bg-gradient-to-br from-primary/20 to-base-200 sm:h-32"></div>
	{/if}

	<div class="card-body gap-6">
		<div class="flex flex-col gap-4 sm:flex-row sm:items-start">
			<ServiceIcon
				iconUrl={app.iconUrl}
				name={app.name}
				class="h-20 w-20 shrink-0 rounded-2xl shadow-md"
			/>
			<div class="min-w-0 flex-1">
				<div class="flex flex-wrap items-center gap-2">
					<h1 class="text-2xl font-bold">{app.name}</h1>
					{#if app.category}
						<span class="badge badge-outline">{app.category}</span>
					{/if}
				</div>
				{#if metaParts.length > 0}
					<p class="mt-1 text-base-content/70">{metaParts.join(' · ')}</p>
				{/if}

				{#if orderedDownloads.length > 0}
					<div class="mt-4 flex flex-wrap gap-2">
						{#each orderedDownloads as entry (entry.platform)}
							<a
								href={entry.url}
								download
								target="_blank"
								rel="noopener noreferrer"
								class="btn gap-2 {entry.isPrimary ? 'btn-primary' : 'btn-outline'}"
							>
								<Download class="h-4 w-4" />
								{#if entry.isPrimary}
									Download for {APP_DOWNLOAD_PLATFORM_LABELS[entry.platform]}
								{:else}
									{APP_DOWNLOAD_PLATFORM_LABELS[entry.platform]}
								{/if}
							</a>
						{/each}
					</div>
				{/if}
			</div>
		</div>

		{#if app.description}
			<section>
				<h2 class="text-lg font-semibold">About</h2>
				<p class="mt-2 whitespace-pre-wrap text-base-content/80">{app.description}</p>
			</section>
		{/if}

		<section>
			<h2 class="text-lg font-semibold">Screenshots</h2>
			{#if screenshots.length === 0}
				<p class="mt-2 text-sm text-base-content/60">No screenshots available.</p>
			{:else}
				<div class="carousel mt-3 w-full rounded-box bg-base-200">
					{#each screenshots as url, index (url)}
						<div
							id={screenshotSlideId(index)}
							class="carousel-item relative w-full justify-center"
						>
							<img
								src={url}
								alt="Screenshot {index + 1} of {app.name}"
								width="680"
								height="550"
								class="mx-auto block h-[550px] w-[680px] object-contain"
							/>
							{#if screenshots.length > 1}
								<div
									class="absolute left-5 right-5 top-1/2 flex -translate-y-1/2 transform justify-between"
								>
									<a
										href={prevScreenshotHref(index)}
										class="btn btn-circle btn-sm"
										aria-label="Previous screenshot"
									>
										<ChevronLeft class="h-5 w-5" />
									</a>
									<a
										href={nextScreenshotHref(index)}
										class="btn btn-circle btn-sm"
										aria-label="Next screenshot"
									>
										<ChevronRight class="h-5 w-5" />
									</a>
								</div>
							{/if}
						</div>
					{/each}
				</div>
			{/if}
		</section>
	</div>
</div>
