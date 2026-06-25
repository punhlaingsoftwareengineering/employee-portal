<script lang="ts">
	import { page } from '$app/state';
	import PortalIcon from '$lib/components/PortalIcon.svelte';
	import NewsletterDialog from '$lib/components/NewsletterDialog.svelte';
	import OnboardingSlideDialog from '$lib/components/OnboardingSlideDialog.svelte';
	import AnnouncementDialog from '$lib/components/AnnouncementDialog.svelte';
	import NotificationSoundDialog from '$lib/components/NotificationSoundDialog.svelte';
	import NotificationDialog from '$lib/components/NotificationDialog.svelte';
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
	import {
		deleteOnboardingSlide,
		getOnboardingSlides
	} from '$lib/remotes/onboarding-slide.remote';
	import {
		deleteAnnouncement,
		getAnnouncements
	} from '$lib/remotes/announcement.remote';
	import {
		deleteNotificationSound,
		getNotificationSounds
	} from '$lib/remotes/notification-sound.remote';
	import {
		deleteNotification,
		getNotifications
	} from '$lib/remotes/notification.remote';
	import {
		Bell,
		ExternalLink,
		Images,
		Megaphone,
		Newspaper,
		Palette,
		Pencil,
		Plus,
		RotateCcw,
		Sparkles,
		Trash2,
		Volume2
	} from 'lucide-svelte';
	import PrivatePageHeader from '$lib/components/PrivatePageHeader.svelte';
	import SettingsCardTitle from '$lib/components/SettingsCardTitle.svelte';

	const isAdmin = $derived(page.data.permissions?.isAdmin ?? false);

	let title = $state(appSettings.title);
	let iconUrl = $state(appSettings.iconUrl ?? '');
	let newsletterDialog = $state<NewsletterDialog | null>(null);
	let onboardingSlideDialog = $state<OnboardingSlideDialog | null>(null);
	let announcementDialog = $state<AnnouncementDialog | null>(null);
	let notificationSoundDialog = $state<NotificationSoundDialog | null>(null);
	let notificationDialog = $state<NotificationDialog | null>(null);
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

<PrivatePageHeader title="Settings" />

<div class="card-masonry">
	<div class="card bg-base-100 shadow-sm">
		<div class="card-body">
			<SettingsCardTitle icon={Palette} title="Appearance" />
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
			<SettingsCardTitle icon={Sparkles} title="Portal branding" />
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
						<SettingsCardTitle icon={Newspaper} title="Newsletters" />
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
					<SettingsCardTitle icon={Newspaper} title="Newsletters" class="mb-4" />
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

	<div class="card bg-base-100 shadow-sm">
		<div class="card-body">
			<svelte:boundary>
				{@const slides = await getOnboardingSlides()}

				<OnboardingSlideDialog bind:this={onboardingSlideDialog} />

				<div class="mb-4 flex items-start justify-between gap-4">
					<div>
						<SettingsCardTitle icon={Images} title="Onboarding carousel" />
						<p class="text-sm text-base-content/70">
							Slides shown on the public onboarding page.
							{#if isAdmin}
								Admins can add, edit, and remove entries.
							{/if}
						</p>
					</div>
					{#if isAdmin}
						<button
							type="button"
							class="btn btn-primary btn-sm gap-2"
							onclick={() => onboardingSlideDialog?.open()}
						>
							<Plus class="h-4 w-4" />
							Add slide
						</button>
					{/if}
				</div>

				{#if slides.length === 0}
					<p class="text-sm text-base-content/60">No carousel slides yet.</p>
				{:else}
					<DataTable rows={slides} rowKey={(item) => item.id} emptyMessage="No slides yet.">
						{#snippet actions({ row: item })}
							{#if isAdmin}
								<IconActionButton
									label="Edit"
									variant="secondary"
									onclick={() => onboardingSlideDialog?.open(item)}
								>
									<Pencil class="h-4 w-4" />
								</IconActionButton>
								<IconActionButton
									label="Delete"
									variant="error"
									disabled={deleteLoading.isPending(item.id)}
									onclick={async () => {
										if (!confirm('Delete this slide?')) return;
										await deleteLoading.run(item.id, async () => {
											await deleteOnboardingSlide(item.id);
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

						<DataTableColumn label="Order" filterText={(item) => String(item.sortOrder)}>
							{#snippet children({ row: item })}
								{item.sortOrder}
							{/snippet}
						</DataTableColumn>

						<DataTableColumn label="Title" firstData filterText={(item) => item.title}>
							{#snippet children({ row: item })}
								{item.title}
							{/snippet}
						</DataTableColumn>

						<DataTableColumn
							label="Description"
							filterText={(item) => item.description ?? ''}
						>
							{#snippet children({ row: item })}
								<span class="line-clamp-2 max-w-xs">{item.description ?? '—'}</span>
							{/snippet}
						</DataTableColumn>

						<DataTableColumn label="Image" filterText={(item) => item.imageUrl}>
							{#snippet children({ row: item })}
								<img
									src={item.imageUrl}
									alt=""
									class="h-10 w-16 rounded object-cover"
								/>
							{/snippet}
						</DataTableColumn>
					</DataTable>
				{/if}

				{#snippet pending()}
					<SettingsCardTitle icon={Images} title="Onboarding carousel" class="mb-4" />
					<LoadingCenter />
				{/snippet}

				{#snippet failed(error)}
					<div class="alert alert-error">
						<span>{error instanceof Error ? error.message : 'Failed to load slides'}</span>
					</div>
				{/snippet}
			</svelte:boundary>
		</div>
	</div>

	<div class="card bg-base-100 shadow-sm">
		<div class="card-body">
			<svelte:boundary>
				{@const announcements = await getAnnouncements()}

				<AnnouncementDialog bind:this={announcementDialog} />

				<div class="mb-4 flex items-start justify-between gap-4">
					<div>
						<SettingsCardTitle icon={Megaphone} title="Announcements" />
						<p class="text-sm text-base-content/70">
							Full-width banner above the navbar on onboarding pages.
							{#if isAdmin}
								Admins can add, edit, and remove entries. Only one can be active.
							{/if}
						</p>
					</div>
					{#if isAdmin}
						<button
							type="button"
							class="btn btn-primary btn-sm gap-2"
							onclick={() => announcementDialog?.open()}
						>
							<Plus class="h-4 w-4" />
							Add announcement
						</button>
					{/if}
				</div>

				{#if announcements.length === 0}
					<p class="text-sm text-base-content/60">No announcements yet.</p>
				{:else}
					<DataTable
						rows={announcements}
						rowKey={(item) => item.id}
						emptyMessage="No announcements yet."
					>
						{#snippet actions({ row: item })}
							{#if isAdmin}
								<IconActionButton
									label="Edit"
									variant="secondary"
									onclick={() => announcementDialog?.open(item)}
								>
									<Pencil class="h-4 w-4" />
								</IconActionButton>
								<IconActionButton
									label="Delete"
									variant="error"
									disabled={deleteLoading.isPending(item.id)}
									onclick={async () => {
										if (!confirm('Delete this announcement?')) return;
										await deleteLoading.run(item.id, async () => {
											await deleteAnnouncement(item.id);
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

						<DataTableColumn label="Type" filterText={(item) => item.type}>
							{#snippet children({ row: item })}
								<span class="badge badge-ghost capitalize">{item.type}</span>
							{/snippet}
						</DataTableColumn>

						<DataTableColumn label="Title" firstData filterText={(item) => item.title}>
							{#snippet children({ row: item })}
								{item.title}
							{/snippet}
						</DataTableColumn>

						<DataTableColumn label="Active" filterText={(item) => (item.isActive ? 'yes' : 'no')}>
							{#snippet children({ row: item })}
								{#if item.isActive}
									<span class="badge badge-success">Active</span>
								{:else}
									<span class="text-base-content/50">—</span>
								{/if}
							{/snippet}
						</DataTableColumn>

						<DataTableColumn
							label="Updated"
							filterText={(item) => item.updatedAt.toISOString()}
						>
							{#snippet children({ row: item })}
								{item.updatedAt.toLocaleString()}
							{/snippet}
						</DataTableColumn>
					</DataTable>
				{/if}

				{#snippet pending()}
					<SettingsCardTitle icon={Megaphone} title="Announcements" class="mb-4" />
					<LoadingCenter />
				{/snippet}

				{#snippet failed(error)}
					<div class="alert alert-error">
						<span>{error instanceof Error ? error.message : 'Failed to load announcements'}</span>
					</div>
				{/snippet}
			</svelte:boundary>
		</div>
	</div>

	<div class="card bg-base-100 shadow-sm">
		<div class="card-body">
			<svelte:boundary>
				{@const sounds = await getNotificationSounds()}

				<NotificationSoundDialog bind:this={notificationSoundDialog} />

				<div class="mb-4 flex items-start justify-between gap-4">
					<div>
						<SettingsCardTitle icon={Volume2} title="Sounds" />
						<p class="text-sm text-base-content/70">
							MP3, WAV, or other direct audio URLs played when new notifications arrive. One can be marked as the portal default.
						</p>
					</div>
					<button
						type="button"
						class="btn btn-primary btn-sm gap-2"
						onclick={() => notificationSoundDialog?.open()}
					>
						<Plus class="h-4 w-4" />
						Add sound
					</button>
				</div>

				{#if sounds.length === 0}
					<p class="text-sm text-base-content/60">No sounds yet.</p>
				{:else}
					<DataTable rows={sounds} rowKey={(item) => item.id} emptyMessage="No sounds yet.">
						{#snippet actions({ row: item })}
							<IconActionButton
								label="Edit"
								variant="secondary"
								onclick={() => notificationSoundDialog?.open(item)}
							>
								<Pencil class="h-4 w-4" />
							</IconActionButton>
							<IconActionButton
								label="Delete"
								variant="error"
								disabled={deleteLoading.isPending(item.id)}
								onclick={async () => {
									if (!confirm('Delete this sound?')) return;
									await deleteLoading.run(item.id, async () => {
										await deleteNotificationSound(item.id);
									});
								}}
							>
								{#if deleteLoading.isPending(item.id)}
									<LoadingSpinner size="sm" />
								{:else}
									<Trash2 class="h-4 w-4" />
								{/if}
							</IconActionButton>
						{/snippet}

						<DataTableColumn label="Name" firstData filterText={(item) => item.name}>
							{#snippet children({ row: item })}
								{item.name}
							{/snippet}
						</DataTableColumn>

						<DataTableColumn label="Audio" filterText={(item) => item.mp3Url}>
							{#snippet children({ row: item })}
								<a
									href={item.mp3Url}
									class="link link-primary inline-flex items-center gap-1"
									target="_blank"
									rel="noopener noreferrer"
								>
									Open audio
									<ExternalLink class="h-3.5 w-3.5" />
								</a>
							{/snippet}
						</DataTableColumn>

						<DataTableColumn label="Default" filterText={(item) => (item.isDefault ? 'yes' : 'no')}>
							{#snippet children({ row: item })}
								{#if item.isDefault}
									<span class="badge badge-success">Default</span>
								{:else}
									<span class="text-base-content/50">—</span>
								{/if}
							{/snippet}
						</DataTableColumn>
					</DataTable>
				{/if}

				{#snippet pending()}
					<SettingsCardTitle icon={Volume2} title="Sounds" class="mb-4" />
					<LoadingCenter />
				{/snippet}

				{#snippet failed(error)}
					<div class="alert alert-error">
						<span>{error instanceof Error ? error.message : 'Failed to load sounds'}</span>
					</div>
				{/snippet}
			</svelte:boundary>
		</div>
	</div>

	<div class="card bg-base-100 shadow-sm">
		<div class="card-body">
			<svelte:boundary>
				{@const portalNotifications = await getNotifications()}

				<NotificationDialog bind:this={notificationDialog} />

				<div class="mb-4 flex items-start justify-between gap-4">
					<div>
						<SettingsCardTitle icon={Bell} title="Notifications" />
						<p class="text-sm text-base-content/70">
							Bell dropdown on public pages. New items are pushed in real time via SSE.
						</p>
					</div>
					<button
						type="button"
						class="btn btn-primary btn-sm gap-2"
						onclick={() => notificationDialog?.open()}
					>
						<Plus class="h-4 w-4" />
						Add notification
					</button>
				</div>

				{#if portalNotifications.length === 0}
					<p class="text-sm text-base-content/60">No notifications yet.</p>
				{:else}
					<DataTable
						rows={portalNotifications}
						rowKey={(item) => item.id}
						emptyMessage="No notifications yet."
					>
						{#snippet actions({ row: item })}
							<IconActionButton
								label="Edit"
								variant="secondary"
								onclick={() => notificationDialog?.open(item)}
							>
								<Pencil class="h-4 w-4" />
							</IconActionButton>
							<IconActionButton
								label="Delete"
								variant="error"
								disabled={deleteLoading.isPending(item.id)}
								onclick={async () => {
									if (!confirm('Delete this notification?')) return;
									await deleteLoading.run(item.id, async () => {
										await deleteNotification(item.id);
									});
								}}
							>
								{#if deleteLoading.isPending(item.id)}
									<LoadingSpinner size="sm" />
								{:else}
									<Trash2 class="h-4 w-4" />
								{/if}
							</IconActionButton>
						{/snippet}

						<DataTableColumn label="Priority" filterText={(item) => item.priority}>
							{#snippet children({ row: item })}
								<span class="badge badge-ghost capitalize">{item.priority}</span>
							{/snippet}
						</DataTableColumn>

						<DataTableColumn label="Title" firstData filterText={(item) => item.title}>
							{#snippet children({ row: item })}
								{item.title}
							{/snippet}
						</DataTableColumn>

						<DataTableColumn
							label="Sound"
							filterText={(item) => item.sound?.name ?? 'Default'}
						>
							{#snippet children({ row: item })}
								{item.sound?.name ?? 'Portal default'}
							{/snippet}
						</DataTableColumn>

						<DataTableColumn
							label="Created"
							filterText={(item) => item.createdAt.toISOString()}
						>
							{#snippet children({ row: item })}
								{item.createdAt.toLocaleString()}
							{/snippet}
						</DataTableColumn>
					</DataTable>
				{/if}

				{#snippet pending()}
					<SettingsCardTitle icon={Bell} title="Notifications" class="mb-4" />
					<LoadingCenter />
				{/snippet}

				{#snippet failed(error)}
					<div class="alert alert-error">
						<span>{error instanceof Error ? error.message : 'Failed to load notifications'}</span>
					</div>
				{/snippet}
			</svelte:boundary>
		</div>
	</div>
</div>

<div class="mt-6 flex justify-end">
	<button type="button" class="btn btn-ghost gap-2" onclick={handleReset}>
		<RotateCcw class="h-4 w-4" />
		Reset device preferences
	</button>
</div>
