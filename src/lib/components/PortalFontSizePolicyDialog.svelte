<script lang="ts">
	import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
	import {
		APP_FONT_SIZES,
		DEFAULT_PORTAL_FONT_SIZE_POLICY,
		type AppFontSize,
		type PortalFontSizePolicy
	} from '$lib/constants/app-settings';
	import {
		appSettings,
		initPortalFontSizePolicyFromServer,
		updateAppSettings
	} from '$lib/app-settings.svelte';
	import {
		getPortalFontSizeConfig,
		updatePortalFontSizeConfig
	} from '$lib/remotes/portal-font-size-config.remote';
	import { withFormFeedback } from '$lib/form-feedback.svelte';

	let dialog = $state<HTMLDialogElement | null>(null);
	let allowedFontSizes = $state<AppFontSize[]>([]);
	let defaultFontSize = $state<AppFontSize>(DEFAULT_PORTAL_FONT_SIZE_POLICY.defaultFontSize);
	let loading = $state(false);
	let saving = $state(false);
	let error = $state<string | null>(null);

	const defaultFontSizeOptions = $derived(
		APP_FONT_SIZES.filter((option) => allowedFontSizes.includes(option.value))
	);

	function applyPolicy(policy: PortalFontSizePolicy) {
		allowedFontSizes = [...policy.allowedFontSizes];
		defaultFontSize = policy.defaultFontSize;
	}

	export async function open() {
		error = null;
		saving = false;
		loading = true;

		try {
			const policy = await getPortalFontSizeConfig();
			applyPolicy(policy);
			error = null;
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to load text size policy';
		} finally {
			loading = false;
			dialog?.showModal();
		}
	}

	function close() {
		dialog?.close();
		error = null;
		saving = false;
		loading = false;
	}

	function resetForm() {
		error = null;
		saving = false;
		loading = false;
		allowedFontSizes = [];
		defaultFontSize = DEFAULT_PORTAL_FONT_SIZE_POLICY.defaultFontSize;
	}

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();

		if (allowedFontSizes.length === 0) {
			error = 'Select at least one allowed text size.';
			return;
		}

		saving = true;
		error = null;

		try {
			await withFormFeedback({
				successMessage: 'Text size policy saved',
				action: async () => {
					const nextPolicy = await updatePortalFontSizeConfig({
						allowedFontSizes,
						defaultFontSize
					});
					initPortalFontSizePolicyFromServer(nextPolicy);
					if (!nextPolicy.allowedFontSizes.includes(appSettings.fontSize)) {
						updateAppSettings({ fontSize: nextPolicy.defaultFontSize });
					}
				}
			});
			close();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to save text size policy';
		} finally {
			saving = false;
		}
	}

	function toggleAllowedFontSize(size: AppFontSize, checked: boolean) {
		if (checked) {
			allowedFontSizes = allowedFontSizes.includes(size)
				? allowedFontSizes
				: [...allowedFontSizes, size];
			return;
		}

		allowedFontSizes = allowedFontSizes.filter((value) => value !== size);
		if (allowedFontSizes.length > 0 && !allowedFontSizes.includes(defaultFontSize)) {
			defaultFontSize = allowedFontSizes[0];
		}
	}

	function selectAllSizes() {
		allowedFontSizes = APP_FONT_SIZES.map((option) => option.value);
	}

	function clearAllSizes() {
		allowedFontSizes = [];
	}
</script>

<dialog bind:this={dialog} class="modal" onclose={resetForm}>
	<div class="modal-box modal-box-fit">
		<h3 class="text-lg font-bold">Text size policy</h3>
		<p class="mt-1 text-sm text-base-content/70">
			Choose which text sizes users can pick from the FAB font dialog.
		</p>

		{#if loading}
			<div class="flex justify-center py-12">
				<LoadingSpinner />
			</div>
		{:else}
			<form class="mt-6" onsubmit={handleSubmit}>
				<table class="form-table">
					<tbody>
						<tr>
							<td class="form-table-label form-table-label-required align-top">Allowed sizes</td>
							<td class="form-table-field">
								<div class="mb-3 flex flex-wrap gap-2">
									<button type="button" class="btn btn-ghost btn-xs" onclick={selectAllSizes}>
										Select all
									</button>
									<button type="button" class="btn btn-ghost btn-xs" onclick={clearAllSizes}>
										Clear all
									</button>
								</div>
								<div class="flex max-h-64 flex-col gap-1 overflow-y-auto">
									{#each APP_FONT_SIZES as option (option.value)}
										<label
											class="label cursor-pointer justify-start gap-2 rounded-box border border-base-300 bg-base-200/50 px-2 py-1.5"
										>
											<input
												type="checkbox"
												class="checkbox checkbox-xs"
												checked={allowedFontSizes.includes(option.value)}
												onchange={(event) =>
													toggleAllowedFontSize(option.value, event.currentTarget.checked)}
											/>
											<span class="label-text text-xs">{option.label}</span>
										</label>
									{/each}
								</div>
							</td>
						</tr>
						<tr>
							<td class="form-table-label">Default size</td>
							<td class="form-table-field">
								<select
									class="select select-bordered w-full max-w-md"
									bind:value={defaultFontSize}
									disabled={allowedFontSizes.length === 0}
								>
									{#each defaultFontSizeOptions as option (option.value)}
										<option value={option.value}>{option.label}</option>
									{/each}
								</select>
								<p class="mt-1 text-xs text-base-content/60">
									For new visitors and when a saved size is no longer allowed.
								</p>
							</td>
						</tr>
					</tbody>
				</table>

				{#if error}
					<div class="alert alert-error mt-4">
						<span>{error}</span>
					</div>
				{/if}

				<div class="modal-action">
					<button type="button" class="btn btn-ghost" onclick={close} disabled={saving}>
						Cancel
					</button>
					<button
						type="submit"
						class="btn btn-primary"
						disabled={saving || allowedFontSizes.length === 0}
					>
						{#if saving}
							<LoadingSpinner size="sm" />
						{:else}
							Save text size policy
						{/if}
					</button>
				</div>
			</form>
		{/if}
	</div>
	<form method="dialog" class="modal-backdrop">
		<button aria-label="Close dialog">close</button>
	</form>
</dialog>
