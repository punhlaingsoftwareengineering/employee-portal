<script lang="ts">
	import { page } from '$app/state';
	import {
		CalendarDays,
		Eye,
		GripVertical,
		Pencil,
		Plus,
		Trash2
	} from '@lucide/svelte';
	import DailyPopupImageDialog from '$lib/components/DailyPopupImageDialog.svelte';
	import IconActionButton from '$lib/components/IconActionButton.svelte';
	import LoadingCenter from '$lib/components/LoadingCenter.svelte';
	import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
	import SettingsCardTitle from '$lib/components/SettingsCardTitle.svelte';
	import {
		DAILY_POPUP_WEEKDAYS,
		DEFAULT_DAILY_POPUP_CAROUSEL_INTERVAL_MS,
		DEFAULT_DAILY_POPUP_DISMISS_COOLDOWN_MINUTES,
		getYangonCalendarDate,
		getYangonWeekday
	} from '$lib/constants/daily-popup';
	import { permissionFlag } from '$lib/constants/permissions';
	import { withFormFeedback } from '$lib/form-feedback.svelte';
	import { createKeyedLoading } from '$lib/keyed-loading.svelte';
	import {
		deleteDailyPopupDateSchedule,
		deleteDailyPopupImage,
		ensureDailyPopupDateSchedule,
		ensureDailyPopupWeekdaySchedule,
		getDailyPopupConfig,
		getDailyPopupSchedules,
		previewDailyPopup,
		reorderDailyPopupImages,
		updateDailyPopupConfig,
		upsertDailyPopupDateSchedule,
		upsertDailyPopupWeekdaySchedule
	} from '$lib/remotes/daily-popup.remote';
	import type { DailyPopupImage } from '$lib/server/db/schema/daily-popup-image';
	import type { DailyPopupSchedule } from '$lib/server/db/schema/daily-popup-schedule';

	type ScheduleWithImages = DailyPopupSchedule & { images: DailyPopupImage[] };

	const permissions = $derived(page.data.permissions);
	const canCreate = $derived(permissionFlag(permissions, 'settingsDailyPopupCreate'));
	const canUpdate = $derived(permissionFlag(permissions, 'settingsDailyPopupUpdate'));
	const canDelete = $derived(permissionFlag(permissions, 'settingsDailyPopupDelete'));

	let imageDialog = $state<DailyPopupImageDialog | null>(null);
	let selectedWeekday = $state(getYangonWeekday());
	let newDate = $state(getYangonCalendarDate());
	let selectedDateScheduleId = $state<string | null>(null);
	let cooldownMinutes = $state(DEFAULT_DAILY_POPUP_DISMISS_COOLDOWN_MINUTES);
	let intervalMs = $state(DEFAULT_DAILY_POPUP_CAROUSEL_INTERVAL_MS);
	let configHydrated = $state(false);
	let configSaving = $state(false);
	let dragImageId = $state<string | null>(null);
	let previewBusy = $state(false);
	let previewNote = $state<string | null>(null);

	const deleteLoading = createKeyedLoading();

	function weekdaySchedule(schedules: ScheduleWithImages[], weekday: number) {
		return schedules.find((s) => s.kind === 'weekday' && s.weekday === weekday) ?? null;
	}

	function dateSchedules(schedules: ScheduleWithImages[]) {
		return schedules
			.filter((s) => s.kind === 'date')
			.sort((a, b) => (a.calendarDate ?? '').localeCompare(b.calendarDate ?? ''));
	}

	function selectedDateSchedule(schedules: ScheduleWithImages[]) {
		const dates = dateSchedules(schedules);
		if (selectedDateScheduleId) {
			return dates.find((s) => s.id === selectedDateScheduleId) ?? dates[0] ?? null;
		}
		return dates[0] ?? null;
	}

	async function ensureWeekday(weekday: number) {
		const schedule = await ensureDailyPopupWeekdaySchedule({ weekday });
		void getDailyPopupSchedules().refresh();
		return schedule;
	}

	async function toggleWeekdayEnabled(weekday: number, enabled: boolean) {
		await withFormFeedback({
			successMessage: enabled ? 'Weekday enabled' : 'Weekday disabled',
			action: async () => {
				await upsertDailyPopupWeekdaySchedule({ weekday, enabled });
				void getDailyPopupSchedules().refresh();
			}
		});
	}

	async function saveConfig() {
		configSaving = true;
		try {
			await withFormFeedback({
				successMessage: 'Daily popup settings saved',
				action: async () => {
					await updateDailyPopupConfig({
						dismissCooldownMinutes: cooldownMinutes,
						carouselIntervalMs: intervalMs
					});
					void getDailyPopupConfig().refresh();
				}
			});
		} finally {
			configSaving = false;
		}
	}

	async function addDateSchedule() {
		if (!/^\d{4}-\d{2}-\d{2}$/.test(newDate)) return;
		const schedule = await ensureDailyPopupDateSchedule({ calendarDate: newDate });
		selectedDateScheduleId = schedule.id;
		void getDailyPopupSchedules().refresh();
	}

	async function toggleDateEnabled(schedule: ScheduleWithImages, enabled: boolean) {
		if (!schedule.calendarDate) return;
		await withFormFeedback({
			successMessage: enabled ? 'Date enabled' : 'Date disabled',
			action: async () => {
				await upsertDailyPopupDateSchedule({
					calendarDate: schedule.calendarDate!,
					enabled
				});
				void getDailyPopupSchedules().refresh();
			}
		});
	}

	async function removeDateSchedule(schedule: ScheduleWithImages) {
		if (!confirm(`Delete all popup images for ${schedule.calendarDate}?`)) return;
		await deleteLoading.run(schedule.id, async () => {
			await deleteDailyPopupDateSchedule(schedule.id);
			if (selectedDateScheduleId === schedule.id) selectedDateScheduleId = null;
			void getDailyPopupSchedules().refresh();
		});
	}

	async function openAddForWeekday(weekday: number) {
		const schedule = await ensureWeekday(weekday);
		imageDialog?.open(schedule.id);
	}

	async function onReorder(scheduleId: string, images: DailyPopupImage[], fromId: string, toId: string) {
		if (!canUpdate || fromId === toId) return;
		const ids = images.map((img) => img.id);
		const from = ids.indexOf(fromId);
		const to = ids.indexOf(toId);
		if (from < 0 || to < 0) return;
		ids.splice(from, 1);
		ids.splice(to, 0, fromId);
		await reorderDailyPopupImages({ scheduleId, orderedIds: ids });
		void getDailyPopupSchedules().refresh();
	}

	async function runPreview(mode: 'today' | 'weekday' | 'date', schedules: ScheduleWithImages[]) {
		previewBusy = true;
		previewNote = null;
		try {
			const payload =
				mode === 'weekday'
					? await previewDailyPopup({ weekday: selectedWeekday })
					: mode === 'date'
						? await previewDailyPopup({
								calendarDate: selectedDateSchedule(schedules)?.calendarDate ?? newDate
							})
						: await previewDailyPopup({});
			previewNote = `Preview merge: ${payload.images.length} image(s) for ${payload.calendarDate} (weekday ${payload.weekday}). Open /onboarding?dailyPopup=1 to force-show on onboarding.`;
		} catch (err) {
			previewNote = err instanceof Error ? err.message : 'Preview failed';
		} finally {
			previewBusy = false;
		}
	}
</script>

<div class="card card-span-2 bg-base-100 shadow-sm">
	<div class="card-body gap-6">
		<svelte:boundary>
			{@const config = await getDailyPopupConfig()}
			{@const schedules = (await getDailyPopupSchedules()) as ScheduleWithImages[]}

			{#if !configHydrated}
				{@const _hydrate = (() => {
					cooldownMinutes = config.dismissCooldownMinutes;
					intervalMs = config.carouselIntervalMs;
					configHydrated = true;
					return null;
				})()}
			{/if}

			<div class="flex flex-wrap items-start justify-between gap-3">
				<div class="min-w-0">
					<SettingsCardTitle icon={CalendarDays} title="Daily popup" />
					<p class="text-sm text-base-content/70">
						Onboarding launch images by weekday and calendar date (Asia/Yangon). Calendar images
						show first, then weekday images. Multiple images rotate as a carousel.
					</p>
				</div>
			</div>

			<div class="grid gap-4 md:grid-cols-2">
				<label class="form-control w-full max-w-xs">
					<span class="label-text">Dismiss cooldown (minutes)</span>
					<input
						type="number"
						class="input input-bordered"
						min="1"
						max="1440"
						bind:value={cooldownMinutes}
						disabled={!canUpdate}
					/>
				</label>
				<label class="form-control w-full max-w-xs">
					<span class="label-text">Carousel interval (ms)</span>
					<input
						type="number"
						class="input input-bordered"
						min="2000"
						max="60000"
						step="500"
						bind:value={intervalMs}
						disabled={!canUpdate}
					/>
				</label>
			</div>
			{#if canUpdate}
				<div>
					<button type="button" class="btn btn-primary btn-sm" disabled={configSaving} onclick={saveConfig}>
						{#if configSaving}<LoadingSpinner size="sm" />{/if}
						Save timing
					</button>
				</div>
			{/if}

			<div class="divider my-0"></div>

			<div>
				<h4 class="mb-2 font-semibold">Weekdays</h4>
				<div class="tabs tabs-boxed mb-4 flex-wrap">
					{#each DAILY_POPUP_WEEKDAYS as day (day.value)}
						<button
							type="button"
							class="tab"
							class:tab-active={selectedWeekday === day.value}
							onclick={() => (selectedWeekday = day.value)}
						>
							{day.short}
						</button>
					{/each}
				</div>

				{#each DAILY_POPUP_WEEKDAYS as day (day.value)}
					{#if selectedWeekday === day.value}
						{@const schedule = weekdaySchedule(schedules, day.value)}
						<div class="mb-3 flex flex-wrap items-center gap-3">
							<label class="label cursor-pointer gap-2">
								<span class="label-text">{day.label} enabled</span>
								<input
									type="checkbox"
									class="toggle toggle-primary"
									checked={schedule?.enabled ?? false}
									disabled={!canUpdate}
									onchange={(e) =>
										toggleWeekdayEnabled(day.value, (e.currentTarget as HTMLInputElement).checked)}
								/>
							</label>
							{#if canCreate}
								<IconActionButton label="Add image" onclick={() => openAddForWeekday(day.value)}>
									<Plus class="h-4 w-4" />
								</IconActionButton>
							{/if}
						</div>

						{#if !schedule || schedule.images.length === 0}
							<p class="text-sm text-base-content/60">No images for {day.label}.</p>
						{:else}
							<ul class="space-y-2">
								{#each schedule.images as image (image.id)}
									<li
										class="flex items-center gap-3 rounded-lg border border-base-300 bg-base-200/40 p-2"
										draggable={canUpdate}
										ondragstart={() => (dragImageId = image.id)}
										ondragover={(e) => e.preventDefault()}
										ondrop={() => {
											if (dragImageId) {
												void onReorder(schedule.id, schedule.images, dragImageId, image.id);
												dragImageId = null;
											}
										}}
									>
										{#if canUpdate}
											<span class="cursor-grab text-base-content/50" aria-hidden="true">
												<GripVertical class="h-4 w-4" />
											</span>
										{/if}
										<img src={image.imageUrl} alt="" class="h-12 w-20 rounded object-cover" />
										<div class="min-w-0 flex-1 text-sm">
											<p class="truncate font-medium">Order {image.sortOrder}</p>
											{#if image.linkUrl}
												<p class="truncate text-xs text-base-content/60">{image.linkUrl}</p>
											{/if}
										</div>
										{#if canUpdate}
											<IconActionButton
												label="Edit"
												variant="secondary"
												onclick={() => imageDialog?.open(schedule.id, image)}
											>
												<Pencil class="h-4 w-4" />
											</IconActionButton>
										{/if}
										{#if canDelete}
											<IconActionButton
												label="Delete"
												variant="error"
												disabled={deleteLoading.isPending(image.id)}
												onclick={async () => {
													if (!confirm('Hard-delete this image from Drive and the popup?')) return;
													await deleteLoading.run(image.id, async () => {
														await deleteDailyPopupImage(image.id);
													});
												}}
											>
												{#if deleteLoading.isPending(image.id)}
													<LoadingSpinner size="sm" />
												{:else}
													<Trash2 class="h-4 w-4" />
												{/if}
											</IconActionButton>
										{/if}
									</li>
								{/each}
							</ul>
						{/if}
					{/if}
				{/each}
			</div>

			<div class="divider my-0"></div>

			<div>
				<h4 class="mb-2 font-semibold">Calendar dates</h4>
				{#if canCreate}
					<div class="mb-4 flex flex-wrap items-end gap-2">
						<label class="form-control">
							<span class="label-text">Add date</span>
							<input type="date" class="input input-bordered" bind:value={newDate} />
						</label>
						<button type="button" class="btn btn-sm" onclick={addDateSchedule}>Add / open</button>
					</div>
				{/if}

				{#if dateSchedules(schedules).length === 0}
					<p class="text-sm text-base-content/60">No calendar-date schedules yet.</p>
				{:else}
					<div class="mb-3 flex flex-wrap gap-2">
						{#each dateSchedules(schedules) as schedule (schedule.id)}
							<button
								type="button"
								class="btn btn-sm"
								class:btn-primary={(selectedDateSchedule(schedules)?.id ?? null) === schedule.id}
								onclick={() => (selectedDateScheduleId = schedule.id)}
							>
								{schedule.calendarDate}
								{#if !schedule.enabled}
									<span class="opacity-60">(off)</span>
								{/if}
							</button>
						{/each}
					</div>

					{#if selectedDateSchedule(schedules)}
						{@const schedule = selectedDateSchedule(schedules)!}
						<div class="mb-3 flex flex-wrap items-center gap-3">
							<label class="label cursor-pointer gap-2">
								<span class="label-text">Enabled</span>
								<input
									type="checkbox"
									class="toggle toggle-primary"
									checked={schedule.enabled}
									disabled={!canUpdate}
									onchange={(e) =>
										toggleDateEnabled(schedule, (e.currentTarget as HTMLInputElement).checked)}
								/>
							</label>
							{#if canCreate}
								<IconActionButton
									label="Add image"
									onclick={() => imageDialog?.open(schedule.id)}
								>
									<Plus class="h-4 w-4" />
								</IconActionButton>
							{/if}
							{#if canDelete}
								<IconActionButton
									label="Delete date"
									variant="error"
									disabled={deleteLoading.isPending(schedule.id)}
									onclick={() => removeDateSchedule(schedule)}
								>
									{#if deleteLoading.isPending(schedule.id)}
										<LoadingSpinner size="sm" />
									{:else}
										<Trash2 class="h-4 w-4" />
									{/if}
								</IconActionButton>
							{/if}
						</div>

						{#if schedule.images.length === 0}
							<p class="text-sm text-base-content/60">No images for this date.</p>
						{:else}
							<ul class="space-y-2">
								{#each schedule.images as image (image.id)}
									<li
										class="flex items-center gap-3 rounded-lg border border-base-300 bg-base-200/40 p-2"
										draggable={canUpdate}
										ondragstart={() => (dragImageId = image.id)}
										ondragover={(e) => e.preventDefault()}
										ondrop={() => {
											if (dragImageId) {
												void onReorder(schedule.id, schedule.images, dragImageId, image.id);
												dragImageId = null;
											}
										}}
									>
										{#if canUpdate}
											<span class="cursor-grab text-base-content/50" aria-hidden="true">
												<GripVertical class="h-4 w-4" />
											</span>
										{/if}
										<img src={image.imageUrl} alt="" class="h-12 w-20 rounded object-cover" />
										<div class="min-w-0 flex-1 text-sm">
											<p class="truncate font-medium">Order {image.sortOrder}</p>
											{#if image.linkUrl}
												<p class="truncate text-xs text-base-content/60">{image.linkUrl}</p>
											{/if}
										</div>
										{#if canUpdate}
											<IconActionButton
												label="Edit"
												variant="secondary"
												onclick={() => imageDialog?.open(schedule.id, image)}
											>
												<Pencil class="h-4 w-4" />
											</IconActionButton>
										{/if}
										{#if canDelete}
											<IconActionButton
												label="Delete"
												variant="error"
												disabled={deleteLoading.isPending(image.id)}
												onclick={async () => {
													if (!confirm('Hard-delete this image from Drive and the popup?')) return;
													await deleteLoading.run(image.id, async () => {
														await deleteDailyPopupImage(image.id);
													});
												}}
											>
												{#if deleteLoading.isPending(image.id)}
													<LoadingSpinner size="sm" />
												{:else}
													<Trash2 class="h-4 w-4" />
												{/if}
											</IconActionButton>
										{/if}
									</li>
								{/each}
							</ul>
						{/if}
					{/if}
				{/if}
			</div>

			{#if canUpdate}
				<div class="divider my-0"></div>
				<div class="flex flex-wrap gap-2">
					<button
						type="button"
						class="btn btn-outline btn-sm"
						disabled={previewBusy}
						onclick={() => runPreview('today', schedules)}
					>
						<Eye class="h-4 w-4" />
						Preview today (Yangon)
					</button>
					<button
						type="button"
						class="btn btn-outline btn-sm"
						disabled={previewBusy}
						onclick={() => runPreview('weekday', schedules)}
					>
						Preview selected weekday
					</button>
					<button
						type="button"
						class="btn btn-outline btn-sm"
						disabled={previewBusy}
						onclick={() => runPreview('date', schedules)}
					>
						Preview selected date
					</button>
				</div>
				{#if previewNote}
					<p class="text-sm text-base-content/70">{previewNote}</p>
				{/if}
			{/if}

			<DailyPopupImageDialog bind:this={imageDialog} />

			{#snippet pending()}
				<SettingsCardTitle icon={CalendarDays} title="Daily popup" class="mb-4" />
				<LoadingCenter />
			{/snippet}

			{#snippet failed(loadError)}
				<div class="alert alert-error">
					<span>
						{loadError instanceof Error ? loadError.message : 'Failed to load daily popup settings'}
					</span>
				</div>
			{/snippet}
		</svelte:boundary>
	</div>
</div>
