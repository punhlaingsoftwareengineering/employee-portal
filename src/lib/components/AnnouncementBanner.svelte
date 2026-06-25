<script lang="ts">
	import type { Announcement } from '$lib/server/db/schema/announcement';
	import type { AnnouncementAccentPreset } from '$lib/constants/announcement';

	let { announcement }: { announcement: Announcement } = $props();

	const accentClasses: Record<AnnouncementAccentPreset, { bg: string; text: string }> = {
		primary: { bg: 'bg-primary', text: 'text-primary-content' },
		secondary: { bg: 'bg-secondary', text: 'text-secondary-content' },
		accent: { bg: 'bg-accent', text: 'text-accent-content' },
		info: { bg: 'bg-info', text: 'text-info-content' },
		success: { bg: 'bg-success', text: 'text-success-content' },
		warning: { bg: 'bg-warning', text: 'text-warning-content' },
		error: { bg: 'bg-error', text: 'text-error-content' },
		neutral: { bg: 'bg-neutral', text: 'text-neutral-content' }
	};

	const presetClasses = $derived(accentClasses[announcement.accentPreset]);
	const bgClass = $derived(announcement.accentColor ? '' : presetClasses.bg);
	const textClass = $derived(announcement.accentColor ? 'text-white' : presetClasses.text);
	const textStyle = $derived(
		announcement.accentColor ? `background-color: ${announcement.accentColor}` : undefined
	);
</script>

{#if announcement.type === 'image'}
	{#if announcement.linkUrl}
		<a
			href={announcement.linkUrl}
			class="block h-24 w-full overflow-hidden"
			target="_blank"
			rel="noopener noreferrer"
		>
			<img
				src={announcement.imageUrl ?? ''}
				alt={announcement.title}
				class="h-full w-full object-cover"
			/>
		</a>
	{:else}
		<div class="h-24 w-full overflow-hidden">
			<img
				src={announcement.imageUrl ?? ''}
				alt={announcement.title}
				class="h-full w-full object-cover"
			/>
		</div>
	{/if}
{:else if announcement.linkUrl}
	<a
		href={announcement.linkUrl}
		class="block w-full px-4 py-3 {bgClass} {textClass}"
		style={textStyle}
		target="_blank"
		rel="noopener noreferrer"
	>
		<p class="font-semibold">{announcement.title}</p>
		{#if announcement.body}
			<p class="mt-1 text-sm opacity-90">{announcement.body}</p>
		{/if}
	</a>
{:else}
	<div class="w-full px-4 py-3 {bgClass} {textClass}" style={textStyle}>
		<p class="font-semibold">{announcement.title}</p>
		{#if announcement.body}
			<p class="mt-1 text-sm opacity-90">{announcement.body}</p>
		{/if}
	</div>
{/if}
