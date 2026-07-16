<script lang="ts">
	import { MessageCircle, Share2 } from '@lucide/svelte';
	import CommunityLinkCard from '$lib/components/CommunityLinkCard.svelte';
	import PageTitle from '$lib/components/PageTitle.svelte';
	import SectionHead from '$lib/components/SectionHead.svelte';
	import { AUTH_ROUTES } from '$lib/constants/auth-routes';

	let { data } = $props();
</script>

<PageTitle title="Community" />

<div class="container mx-auto max-w-5xl px-4 py-12">
	{#if data.sections.length === 0}
		<div class="card bg-base-100 shadow-sm">
			<div class="card-body items-center text-center">
				<p class="text-base-content/70">Community links will appear here once they are published.</p>
				<div class="mt-4 flex flex-wrap justify-center gap-3">
					<a href={AUTH_ROUTES.signup} class="btn btn-primary gap-2">
						<MessageCircle class="h-4 w-4" />
						Create account
					</a>
					<a href={AUTH_ROUTES.login} class="btn btn-outline">Sign in</a>
				</div>
			</div>
		</div>
	{:else}
		<div class="flex flex-col gap-12 pb-8">
			{#each data.sections as section (section.id)}
				<section>
					<SectionHead
						icon={Share2}
						title={section.name}
						description={section.description ?? undefined}
					/>
					{#if section.links.length === 0}
						<p class="text-sm text-base-content/60">No links in this section yet.</p>
					{:else}
						<ul class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
							{#each section.links as link (link.id)}
								<li class="h-full">
									<CommunityLinkCard {link} />
								</li>
							{/each}
						</ul>
					{/if}
				</section>
			{/each}
		</div>
	{/if}
</div>
