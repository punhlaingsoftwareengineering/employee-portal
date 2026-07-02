<script lang="ts">
	import { Check, Clapperboard, Image, Save } from '@lucide/svelte';
	import { E_SIGNATURE_ASSETS } from '$lib/constants/e-signature';
	import { downloadBlob } from '$lib/utils/e-signature-render';

	let {
		pngDataUrl = null,
		gifDataUrl = null,
		pngBlob = null,
		gifBlob = null,
		generated = false,
		generating = false,
		onGenerate
	}: {
		pngDataUrl?: string | null;
		gifDataUrl?: string | null;
		pngBlob?: Blob | null;
		gifBlob?: Blob | null;
		generated?: boolean;
		generating?: boolean;
		onGenerate: () => void | Promise<void>;
	} = $props();

	function savePng() {
		if (pngBlob) downloadBlob(pngBlob, 'e-signature.png');
	}

	function saveGif() {
		if (gifBlob) downloadBlob(gifBlob, 'e-signature.gif');
	}
</script>

<div class="flex flex-col gap-4">
	<button
		type="button"
		class="btn w-full max-w-2xl text-white"
		style:background="#E87722"
		disabled={generating || generated}
		onclick={onGenerate}
	>
		{#if generating}
			<span class="loading loading-spinner loading-sm"></span>
		{/if}
		<span class="block text-sm">E-Signature ရယူရန် ဤနေရာ ကိုနှိပ်ပါ</span>
		Click here to get E-Signature
	</button>

	{#if generated}
		<p class="flex items-center gap-2 text-sm text-success">
			<Check class="h-4 w-4" />
			E-Signature generated successfully!
		</p>
	{/if}

	<div class="grid max-w-4xl gap-4 md:grid-cols-2">
		<div class="card bg-base-100 shadow-sm">
			<div class="card-body gap-3">
				<h2 class="flex items-center gap-2 text-sm font-semibold">
					<Clapperboard class="h-4 w-4" />
					Animated GIF Version
				</h2>
				<div class="rounded-box bg-base-200 p-4">
					{#if gifDataUrl}
						<img src={gifDataUrl} alt="Animated e-signature GIF preview" class="mx-auto max-w-full" />
					{:else}
						<img
							src={E_SIGNATURE_ASSETS.frames.brands}
							alt="GIF preview placeholder"
							class="mx-auto max-w-full"
						/>
					{/if}
				</div>
				<button type="button" class="btn btn-success gap-2" disabled={!gifBlob} onclick={saveGif}>
					<Save class="h-4 w-4" />
					Save GIF
				</button>
			</div>
		</div>

		<div class="card bg-base-100 shadow-sm">
			<div class="card-body gap-3">
				<h2 class="flex items-center gap-2 text-sm font-semibold">
					<Image class="h-4 w-4" />
					PNG Version
				</h2>
				<div class="rounded-box bg-base-200 p-4">
					{#if pngDataUrl}
						<img src={pngDataUrl} alt="E-signature PNG preview" class="mx-auto max-w-full" />
					{:else}
						<p class="text-center text-sm text-base-content/50">Generate to preview PNG</p>
					{/if}
				</div>
				<button type="button" class="btn btn-primary gap-2" disabled={!pngBlob} onclick={savePng}>
					<Save class="h-4 w-4" />
					Save PNG
				</button>
			</div>
		</div>
	</div>
</div>
