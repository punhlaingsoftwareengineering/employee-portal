<script lang="ts">
	import { page } from '$app/state';
	import PortalIcon from '$lib/components/PortalIcon.svelte';
	import NewsletterDialog from '$lib/components/NewsletterDialog.svelte';
	import DataTable from '$lib/components/DataTable.svelte';
	import DataTableColumn from '$lib/components/DataTableColumn.svelte';
	import IconActionButton from '$lib/components/IconActionButton.svelte';
	import LoadingCenter from '$lib/components/LoadingCenter.svelte';
	import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
	import {
		APP_FONTS,
		APP_THEMES,
		DEFAULT_APP_TITLE,
		type AppFont,
		type AppTheme
	} from '$lib/constants/app-settings';
	import { appSettings, resetAppSettings, updateAppSettings } from '$lib/app-settings.svelte';
	import { createKeyedLoading } from '$lib/keyed-loading.svelte';
	import { deleteNewsletter, getNewsletters } from '$lib/remotes/newsletter.remote';
	import { ExternalLink, Pencil, Plus, RotateCcw, Trash2 } from 'lucide-svelte';

	const isAdmin = $derived(page.data.permissions?.isAdmin ?? false);

	let title = $state(appSettings.title);
	let iconUrl = $state(appSettings.iconUrl ?? '');
	let newsletterDialog = $state<NewsletterDialog | null>(null);
	const deleteLoading = createKeyedLoading();

	function setTheme(theme: AppTheme) {
		updateAppSettings({ theme });
	}

	function setFont(font: AppFont) {
		updateAppSettings({ font });
	}

	function saveTitle() {
		const trimmed = title.trim() || DEFAULT_APP_TITLE;
		title = trimmed;
		updateAppSettings({ title: trimmed });
	}

	function saveIconUrl() {
		const trimmed = iconUrl.trim();
		iconUrl = trimmed;
		updateAppSettings({ iconUrl: trimmed || null });
	}

	function handleReset() {
		resetAppSettings();
		title = appSettings.title;
		iconUrl = appSettings.iconUrl ?? '';
	}
</script>

<h1 class="mb-6 text-2xl font-bold">Settings</h1>

<div class="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
	<div class="card bg-base-100 shadow-sm">
		<div class="card-body">
			<h2 class="card-title text-lg">Appearance</h2>
			<p class="text-sm text-base-content/70">Theme and typography for this device.</p>
			<table class="form-table">
				<tbody>
					<tr>
						<td class="form-table-label">Theme</td>
						<td class="form-table-field">
							<div class="flex flex-wrap gap-2">
								{#each APP_THEMES as option (option.value)}
									<button
										type="button"
										class="btn btn-sm {appSettings.theme === option.value
											? 'btn-primary'
											: 'btn-outline'}"
										onclick={() => setTheme(option.value)}
									>
										{option.label}
									</button>
								{/each}
							</div>
						</td>
					</tr>
					<tr>
						<td class="form-table-label">Font</td>
						<td class="form-table-field">
							<div class="flex flex-wrap gap-2">
								{#each APP_FONTS as option (option.value)}
									<button
										type="button"
										class="btn btn-sm {appSettings.font === option.value
											? 'btn-primary'
											: 'btn-outline'}"
										onclick={() => setFont(option.value)}
									>
										{option.label}
									</button>
								{/each}
							</div>
						</td>
					</tr>
				</tbody>
			</table>
		</div>
	</div>

	<div class="card bg-base-100 shadow-sm">
		<div class="card-body">
			<h2 class="card-title text-lg">Portal branding</h2>
			<p class="text-sm text-base-content/70">
				Customize the portal title and icon image URL shown in the sidebar. Saved on this device.
			</p>
			<table class="form-table">
				<tbody>
					<tr>
						<td class="form-table-label">Title</td>
						<td class="form-table-field">
							<input
								type="text"
								class="input input-bordered w-full max-w-md"
								bind:value={title}
								maxlength="48"
								placeholder={DEFAULT_APP_TITLE}
								onchange={saveTitle}
							/>
						</td>
					</tr>
					<tr>
						<td class="form-table-label">Icon link</td>
						<td class="form-table-field">
							<input
								type="url"
								class="input input-bordered w-full max-w-md"
								bind:value={iconUrl}
								placeholder="https://example.com/logo.png"
								onchange={saveIconUrl}
							/>
							<p class="mt-1 text-xs text-base-content/60">
								Leave empty for the default building icon. Use a square PNG or SVG URL.
							</p>
						</td>
					</tr>
					<tr>
						<td class="form-table-label">Preview</td>
						<td class="form-table-field">
							<div
								class="flex items-center gap-2 rounded-box border border-base-300 bg-base-200 px-4 py-3"
							>
								<PortalIcon iconUrl={iconUrl || null} class="h-5 w-5" />
								<span class="font-semibold">{title || DEFAULT_APP_TITLE}</span>
							</div>
						</td>
					</tr>
				</tbody>
			</table>
		</div>
	</div>

	<div class="card bg-base-100 shadow-sm">
		<div class="card-body">
			<svelte:boundary>
				{@const newsletters = await getNewsletters()}

				<NewsletterDialog bind:this={newsletterDialog} />

				<div class="mb-4 flex items-start justify-between gap-4">
					<div>
						<h2 class="card-title text-lg">Newsletters</h2>
						<p class="text-sm text-base-content/70">
							PDF newsletter links for users with Settings access.
							{#if isAdmin}
								Admins can add, edit, and remove entries.
							{/if}
						</p>
					</div>
					{#if isAdmin}
						<button
							type="button"
							class="btn btn-primary btn-sm gap-2"
							onclick={() => newsletterDialog?.open()}
						>
							<Plus class="h-4 w-4" />
							Add newsletter
						</button>
					{/if}
				</div>

				{#if newsletters.length === 0}
					<p class="text-sm text-base-content/60">No newsletters yet.</p>
				{:else}
					<DataTable
						rows={newsletters}
						rowKey={(item) => item.id}
						emptyMessage="No newsletters yet."
					>
						{#snippet actions({ row: item })}
							{#if isAdmin}
								<IconActionButton
									label="Edit"
									variant="secondary"
									onclick={() => newsletterDialog?.open(item)}
								>
									<Pencil class="h-4 w-4" />
								</IconActionButton>
								<IconActionButton
									label="Delete"
									variant="error"
									disabled={deleteLoading.isPending(item.id)}
									onclick={async () => {
										if (!confirm('Delete this newsletter?')) return;
										await deleteLoading.run(item.id, async () => {
											await deleteNewsletter(item.id);
										});
									}}
								>
									{#if deleteLoading.isPending(item.id)}
										<LoadingSpinner size="sm" />
									{:else}
										<Trash2 class="h-4 w-4" />
									{/if}
								</IconActionButton>
							{/if}
						{/snippet}

						<DataTableColumn label="Title" firstData filterText={(item) => item.title}>
							{#snippet children({ row: item })}
								{item.title}
							{/snippet}
						</DataTableColumn>

						<DataTableColumn label="PDF" filterText={(item) => item.pdfUrl}>
							{#snippet children({ row: item })}
								<a
									href={item.pdfUrl}
									class="link link-primary inline-flex items-center gap-1"
									target="_blank"
									rel="noopener noreferrer"
								>
									Download PDF
									<ExternalLink class="h-3.5 w-3.5" />
								</a>
							{/snippet}
						</DataTableColumn>
					</DataTable>
				{/if}

				{#snippet pending()}
					<h2 class="card-title mb-4 text-lg">Newsletters</h2>
					<LoadingCenter />
				{/snippet}

				{#snippet failed(error)}
					<div class="alert alert-error">
						<span>{error instanceof Error ? error.message : 'Failed to load newsletters'}</span>
					</div>
				{/snippet}
			</svelte:boundary>
		</div>
	</div>

	<div class="flex justify-end xl:col-span-3">
		<button type="button" class="btn btn-ghost gap-2" onclick={handleReset}>
			<RotateCcw class="h-4 w-4" />
			Reset device preferences
		</button>
	</div>
</div>
