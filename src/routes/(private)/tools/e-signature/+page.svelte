<script lang="ts">
	import { tick } from 'svelte';
	import { ArrowLeft, PenLine } from '@lucide/svelte';
	import PrivatePageHeader from '$lib/components/PrivatePageHeader.svelte';
	import ESignatureDownloads from '$lib/components/e-signature/ESignatureDownloads.svelte';
	import ESignatureForm from '$lib/components/e-signature/ESignatureForm.svelte';
	import ESignaturePreview from '$lib/components/e-signature/ESignaturePreview.svelte';
	import {
		eSignatureDefaultFormData,
		type ESignatureFormData
	} from '$lib/schemas/e-signature';
	import {
		blobToDataUrl,
		renderGifBlob,
		renderPngBlob
	} from '$lib/utils/e-signature-render';

	type Step = 'form' | 'preview';

	let step = $state<Step>('form');
	let formData = $state<ESignatureFormData>(eSignatureDefaultFormData);
	let generated = $state(false);
	let generating = $state(false);
	let pngBlob = $state<Blob | null>(null);
	let gifBlob = $state<Blob | null>(null);
	let pngDataUrl = $state<string | null>(null);
	let gifDataUrl = $state<string | null>(null);
	let generateError = $state<string | null>(null);
	let captureElement = $state<HTMLDivElement | null>(null);

	function handleFormSubmit(data: ESignatureFormData) {
		formData = data;
		generated = false;
		generating = false;
		pngBlob = null;
		gifBlob = null;
		pngDataUrl = null;
		gifDataUrl = null;
		generateError = null;
		step = 'preview';
	}

	function handleEdit() {
		step = 'form';
	}

	async function handleGenerate() {
		generating = true;
		generateError = null;

		try {
			await tick();
			if (!captureElement) {
				throw new Error('Signature preview is not ready');
			}

			const png = await renderPngBlob(captureElement);
			const gif = await renderGifBlob(png);
			pngBlob = png;
			gifBlob = gif;
			[pngDataUrl, gifDataUrl] = await Promise.all([blobToDataUrl(png), blobToDataUrl(gif)]);
			generated = true;
		} catch (error) {
			generateError = error instanceof Error ? error.message : 'Failed to generate e-signature';
		} finally {
			generating = false;
		}
	}
</script>

<PrivatePageHeader title="E-Signature Generator" icon={PenLine} />

<div class="mb-4">
	<a href="/tools" class="btn btn-ghost btn-sm gap-2">
		<ArrowLeft class="h-4 w-4" />
		Back to tools
	</a>
</div>

<p class="mb-6 text-base-content/70">
	Enter your details to generate a Pun Hlaing Hospitals email footer as PNG and animated GIF.
</p>

{#if step === 'form'}
	{#key `${formData.employeeNo}-${formData.email}-${formData.name}`}
		<ESignatureForm initialData={formData} onSubmit={handleFormSubmit} />
	{/key}
{:else}
	<ESignaturePreview data={formData} onEdit={handleEdit} bind:captureElement />

	<div class="mt-6">
		<ESignatureDownloads
			{generated}
			{generating}
			{pngBlob}
			{gifBlob}
			{pngDataUrl}
			{gifDataUrl}
			onGenerate={handleGenerate}
		/>
	</div>

	{#if generateError}
		<div class="alert alert-error mt-4 max-w-2xl">
			<span>{generateError}</span>
		</div>
	{/if}
{/if}
