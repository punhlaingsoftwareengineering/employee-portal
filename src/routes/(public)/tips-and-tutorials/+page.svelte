<script lang="ts">
	import { BookOpen, ExternalLink, FileText, GraduationCap, Play } from '@lucide/svelte';
	import PageTitle from '$lib/components/PageTitle.svelte';
	import SectionHead from '$lib/components/SectionHead.svelte';

	let { data } = $props();
</script>

<PageTitle title="Tips & Tutorials" />

<div class="container mx-auto max-w-5xl px-4 py-8">
	<header class="mb-10">
		<h1 class="text-3xl font-bold">Tips & Tutorials</h1>
		<p class="mt-2 text-base-content/70">
			Guides and walkthrough videos to help you get the most from the portal.
		</p>
	</header>

	<section class="mb-12">
		<SectionHead icon={BookOpen} title="Guides" />
		{#if data.guides.length === 0}
			<div class="card bg-base-100 shadow-sm">
				<div class="card-body items-center text-center">
					<FileText class="h-10 w-10 text-base-content/30" />
					<p class="text-base-content/70">No guides published yet.</p>
				</div>
			</div>
		{:else}
			<ul class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{#each data.guides as item (item.id)}
					<li class="card bg-base-100 shadow-sm">
						<div class="card-body gap-3">
							<div class="flex min-w-0 items-start gap-3">
								<div
									class="flex h-10 w-10 shrink-0 items-center justify-center rounded-box bg-primary/10 text-primary"
								>
									<FileText class="h-5 w-5" />
								</div>
								<div class="min-w-0">
									<h3 class="font-semibold leading-tight">{item.title}</h3>
									{#if item.description}
										<p class="mt-1 line-clamp-2 text-sm text-base-content/70">
											{item.description}
										</p>
									{/if}
								</div>
							</div>
							<a
								href={item.pdfUrl}
								class="btn btn-outline btn-sm gap-2 self-start"
								target="_blank"
								rel="noopener noreferrer"
							>
								Open PDF
								<ExternalLink class="h-4 w-4" />
							</a>
						</div>
					</li>
				{/each}
			</ul>
		{/if}
	</section>

	<section>
		<SectionHead icon={GraduationCap} title="Video tutorials" />
		{#if data.learnings.length === 0}
			<div class="card bg-base-100 shadow-sm">
				<div class="card-body items-center text-center">
					<Play class="h-10 w-10 text-base-content/30" />
					<p class="text-base-content/70">No tutorial videos published yet.</p>
				</div>
			</div>
		{:else}
			<ul class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{#each data.learnings as item (item.id)}
					<li class="card bg-base-100 shadow-sm">
						<div class="card-body gap-3">
							<div class="flex min-w-0 items-start gap-3">
								<div
									class="flex h-10 w-10 shrink-0 items-center justify-center rounded-box bg-secondary/10 text-secondary"
								>
									<Play class="h-5 w-5" />
								</div>
								<div class="min-w-0">
									<div class="flex flex-wrap items-center gap-2">
										<h3 class="font-semibold leading-tight">{item.title}</h3>
										{#if item.duration}
											<span class="badge badge-ghost badge-sm">{item.duration}</span>
										{/if}
									</div>
									{#if item.description}
										<p class="mt-1 line-clamp-2 text-sm text-base-content/70">
											{item.description}
										</p>
									{/if}
								</div>
							</div>
							<a
								href={item.videoUrl}
								class="btn btn-outline btn-sm gap-2 self-start"
								target="_blank"
								rel="noopener noreferrer"
							>
								Watch video
								<ExternalLink class="h-4 w-4" />
							</a>
						</div>
					</li>
				{/each}
			</ul>
		{/if}
	</section>
</div>
