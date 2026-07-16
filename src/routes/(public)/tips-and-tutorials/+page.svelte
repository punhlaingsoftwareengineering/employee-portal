<script lang="ts">
	import { BookOpen, ExternalLink, FileText, GraduationCap, Play, Search } from '@lucide/svelte';
	import PageTitle from '$lib/components/PageTitle.svelte';
	import SectionHead from '$lib/components/SectionHead.svelte';

	let { data } = $props();

	let searchQuery = $state('');

	const query = $derived(searchQuery.trim().toLowerCase());

	function matchesSearch(title: string, description: string | null | undefined): boolean {
		if (!query) return true;
		const haystack = `${title} ${description ?? ''}`.toLowerCase();
		return haystack.includes(query);
	}

	const filteredGuides = $derived(
		data.guides.filter((item) => matchesSearch(item.title, item.description))
	);
	const filteredLearnings = $derived(
		data.learnings.filter((item) => matchesSearch(item.title, item.description))
	);

	const hasAnyContent = $derived(data.guides.length > 0 || data.learnings.length > 0);
	const hasFilteredResults = $derived(
		filteredGuides.length > 0 || filteredLearnings.length > 0
	);
</script>

<PageTitle title="Tips & Tutorials" />

<div class="container mx-auto max-w-5xl px-4 py-8">
	{#if hasAnyContent}
		<label class="input input-bordered mb-8 w-full">
			<Search class="h-4 w-4 shrink-0 opacity-50" aria-hidden="true" />
			<input
				type="search"
				class="grow focus:outline-none focus:ring-0 focus:ring-offset-0"
				placeholder="Search guides and tutorials…"
				bind:value={searchQuery}
				aria-label="Search guides and tutorials"
			/>
		</label>
	{/if}

	{#if hasAnyContent && !hasFilteredResults}
		<div class="alert alert-info mb-8">
			<span>No guides or tutorials match “{searchQuery.trim()}”.</span>
		</div>
	{/if}

	<section class="mb-12">
		<SectionHead icon={BookOpen} title="Guides" />
		{#if data.guides.length === 0}
			<div class="card bg-base-100 shadow-sm">
				<div class="card-body items-center text-center">
					<FileText class="h-10 w-10 text-base-content/30" />
					<p class="text-base-content/70">No guides published yet.</p>
				</div>
			</div>
		{:else if filteredGuides.length === 0}
			<p class="text-sm text-base-content/60">No guides match your search.</p>
		{:else}
			<div class="h-80 overflow-y-auto rounded-box border border-base-300">
				<table class="table table-zebra table-pin-rows">
					<thead>
						<tr>
							<th scope="col" class="w-12">No.</th>
							<th scope="col">Title</th>
							<th scope="col" class="hidden md:table-cell">Description</th>
							<th scope="col" class="w-28">
								<span class="sr-only">Open</span>
							</th>
						</tr>
					</thead>
					<tbody>
						{#each filteredGuides as item, index (item.id)}
							<tr>
								<td class="align-middle text-base-content/70">{index + 1}</td>
								<td class="align-middle font-medium">{item.title}</td>
								<td class="hidden align-middle text-sm text-base-content/70 md:table-cell">
									{#if item.description}
										<span class="line-clamp-2">{item.description}</span>
									{:else}
										<span class="text-base-content/40">—</span>
									{/if}
								</td>
								<td class="align-middle">
									<a
										href={item.pdfUrl}
										class="btn btn-outline btn-sm gap-1"
										target="_blank"
										rel="noopener noreferrer"
									>
										PDF
										<ExternalLink class="h-3.5 w-3.5" />
									</a>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
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
		{:else if filteredLearnings.length === 0}
			<p class="text-sm text-base-content/60">No tutorials match your search.</p>
		{:else}
			<div class="h-80 overflow-y-auto rounded-box border border-base-300">
				<table class="table table-zebra table-pin-rows">
					<thead>
						<tr>
							<th scope="col" class="w-12">No.</th>
							<th scope="col">Title</th>
							<th scope="col" class="hidden md:table-cell">Description</th>
							<th scope="col" class="w-28">
								<span class="sr-only">Watch</span>
							</th>
						</tr>
					</thead>
					<tbody>
						{#each filteredLearnings as item, index (item.id)}
							<tr>
								<td class="align-middle text-base-content/70">{index + 1}</td>
								<td class="align-middle">
									<div class="flex flex-wrap items-center gap-2">
										<span class="font-medium">{item.title}</span>
										{#if item.duration}
											<span class="badge badge-ghost badge-sm">{item.duration}</span>
										{/if}
									</div>
								</td>
								<td class="hidden align-middle text-sm text-base-content/70 md:table-cell">
									{#if item.description}
										<span class="line-clamp-2">{item.description}</span>
									{:else}
										<span class="text-base-content/40">—</span>
									{/if}
								</td>
								<td class="align-middle">
									<a
										href={item.videoUrl}
										class="btn btn-outline btn-sm gap-1"
										target="_blank"
										rel="noopener noreferrer"
									>
										Watch
										<ExternalLink class="h-3.5 w-3.5" />
									</a>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}
	</section>
</div>
