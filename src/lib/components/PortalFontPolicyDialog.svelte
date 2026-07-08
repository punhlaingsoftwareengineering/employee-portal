<script lang="ts">
	import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
	import {
		APP_FONTS,
		DEFAULT_PORTAL_FONT_POLICY,
		type AppFont,
		type PortalFontPolicy
	} from '$lib/constants/app-settings';
	import {
		appSettings,
		initPortalFontPolicyFromServer,
		updateAppSettings
	} from '$lib/app-settings.svelte';
	import {
		getPortalFontConfig,
		updatePortalFontConfig
	} from '$lib/remotes/portal-font-config.remote';

	let dialog = $state<HTMLDialogElement | null>(null);
	let allowedFonts = $state<AppFont[]>([]);
	let defaultFont = $state<AppFont>(DEFAULT_PORTAL_FONT_POLICY.defaultFont);
	let loading = $state(false);
	let saving = $state(false);
	let error = $state<string | null>(null);

	const defaultFontOptions = $derived(
		APP_FONTS.filter((option) => allowedFonts.includes(option.value))
	);

	function applyPolicy(policy: PortalFontPolicy) {
		allowedFonts = [...policy.allowedFonts];
		defaultFont = policy.defaultFont;
	}

	export async function open() {
		error = null;
		saving = false;
		loading = true;

		try {
			const policy = await getPortalFontConfig();
			applyPolicy(policy);
			error = null;
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to load font policy';
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
		allowedFonts = [];
		defaultFont = DEFAULT_PORTAL_FONT_POLICY.defaultFont;
	}

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();

		if (allowedFonts.length === 0) {
			error = 'Select at least one allowed font.';
			return;
		}

		saving = true;
		error = null;

		try {
			const nextPolicy = await updatePortalFontConfig({
				allowedFonts,
				defaultFont
			});
			initPortalFontPolicyFromServer(nextPolicy);
			if (!nextPolicy.allowedFonts.includes(appSettings.font)) {
				updateAppSettings({ font: nextPolicy.defaultFont });
			}
			close();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to save font policy';
		} finally {
			saving = false;
		}
	}

	function toggleAllowedFont(font: AppFont, checked: boolean) {
		if (checked) {
			allowedFonts = allowedFonts.includes(font) ? allowedFonts : [...allowedFonts, font];
			return;
		}

		allowedFonts = allowedFonts.filter((value) => value !== font);
		if (allowedFonts.length > 0 && !allowedFonts.includes(defaultFont)) {
			defaultFont = allowedFonts[0];
		}
	}

	function selectAllFonts() {
		allowedFonts = APP_FONTS.map((option) => option.value);
	}

	function clearAllFonts() {
		allowedFonts = [];
	}
</script>

<dialog bind:this={dialog} class="modal" onclose={resetForm}>
	<div class="modal-box modal-box-fit">
		<h3 class="text-lg font-bold">Font policy</h3>
		<p class="mt-1 text-sm text-base-content/70">
			Choose which fonts users can pick from the FAB font dialog.
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
							<td class="form-table-label align-top">Allowed fonts</td>
							<td class="form-table-field">
								<div class="mb-3 flex flex-wrap gap-2">
									<button type="button" class="btn btn-ghost btn-xs" onclick={selectAllFonts}>
										Select all
									</button>
									<button type="button" class="btn btn-ghost btn-xs" onclick={clearAllFonts}>
										Clear all
									</button>
								</div>
								<div class="flex max-h-64 flex-col gap-1 overflow-y-auto">
									{#each APP_FONTS as option (option.value)}
										<label
											class="label cursor-pointer justify-start gap-2 rounded-box border border-base-300 bg-base-200/50 px-2 py-1.5"
										>
											<input
												type="checkbox"
												class="checkbox checkbox-xs"
												checked={allowedFonts.includes(option.value)}
												onchange={(event) =>
													toggleAllowedFont(option.value, event.currentTarget.checked)}
											/>
											<span class="label-text text-xs">{option.label}</span>
										</label>
									{/each}
								</div>
							</td>
						</tr>
						<tr>
							<td class="form-table-label">Default font</td>
							<td class="form-table-field">
								<select
									class="select select-bordered w-full max-w-md"
									bind:value={defaultFont}
									disabled={allowedFonts.length === 0}
								>
									{#each defaultFontOptions as option (option.value)}
										<option value={option.value}>{option.label}</option>
									{/each}
								</select>
								<p class="mt-1 text-xs text-base-content/60">
									For new visitors and when a saved font is no longer allowed.
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
						disabled={saving || allowedFonts.length === 0}
					>
						{#if saving}
							<LoadingSpinner size="sm" />
						{:else}
							Save font policy
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
