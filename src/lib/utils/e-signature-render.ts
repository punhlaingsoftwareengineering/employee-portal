import {
	E_SIGNATURE_ASSETS,
	E_SIGNATURE_GIF_TIMING,
	E_SIGNATURE_PNG_SIZE
} from '$lib/constants/e-signature';

type GifEncModule = {
	GIFEncoder: () => {
		writeFrame(
			index: Uint8Array,
			width: number,
			height: number,
			opts?: { palette?: number[][]; delay?: number }
		): void;
		finish(): void;
		bytes(): Uint8Array;
	};
	quantize: (rgba: Uint8ClampedArray | Uint8Array, maxColors: number) => number[][];
	applyPalette: (rgba: Uint8ClampedArray | Uint8Array, palette: number[][]) => Uint8Array;
};

async function loadGifEnc(): Promise<GifEncModule> {
	const module = await import('gifenc');
	return (module.default ?? module) as GifEncModule;
}

function loadImage(src: string): Promise<HTMLImageElement> {
	return new Promise((resolve, reject) => {
		const image = new Image();
		image.crossOrigin = 'anonymous';
		image.onload = () => resolve(image);
		image.onerror = () => reject(new Error(`Failed to load image: ${src}`));
		image.src = src;
	});
}

function drawImageCover(
	ctx: CanvasRenderingContext2D,
	image: HTMLImageElement,
	width: number,
	height: number
) {
	const scale = Math.max(width / image.width, height / image.height);
	const drawWidth = image.width * scale;
	const drawHeight = image.height * scale;
	const x = (width - drawWidth) / 2;
	const y = (height - drawHeight) / 2;
	ctx.drawImage(image, x, y, drawWidth, drawHeight);
}

function imageToImageData(image: HTMLImageElement, width: number, height: number): ImageData {
	const canvas = document.createElement('canvas');
	canvas.width = width;
	canvas.height = height;
	const ctx = canvas.getContext('2d');
	if (!ctx) throw new Error('Canvas not supported');
	drawImageCover(ctx, image, width, height);
	return ctx.getImageData(0, 0, width, height);
}

function blobToImageData(blob: Blob, width: number, height: number): Promise<ImageData> {
	return new Promise((resolve, reject) => {
		const url = URL.createObjectURL(blob);
		const image = new Image();
		image.onload = () => {
			URL.revokeObjectURL(url);
			resolve(imageToImageData(image, width, height));
		};
		image.onerror = () => {
			URL.revokeObjectURL(url);
			reject(new Error('Failed to read image blob'));
		};
		image.src = url;
	});
}

/** Horizontal wipe from imgA to imgB (legacy create_fade_frames). */
function createWipeFrames(imgA: ImageData, imgB: ImageData, steps: number): ImageData[] {
	const { width, height } = imgA;
	const frames: ImageData[] = [];

	for (let step = 0; step <= steps; step++) {
		const frame = new ImageData(width, height);
		const wipeX = Math.floor((width * step) / steps);

		for (let y = 0; y < height; y++) {
			for (let x = 0; x < width; x++) {
				const index = (y * width + x) * 4;
				const source = x < wipeX ? imgB : imgA;
				frame.data[index] = source.data[index];
				frame.data[index + 1] = source.data[index + 1];
				frame.data[index + 2] = source.data[index + 2];
				frame.data[index + 3] = source.data[index + 3];
			}
		}

		frames.push(frame);
	}

	return frames;
}

export async function renderPngBlob(captureElement: HTMLElement): Promise<Blob> {
	const { toPng } = await import('html-to-image');
	const { width, height } = E_SIGNATURE_PNG_SIZE;
	const dataUrl = await toPng(captureElement, {
		width,
		height,
		pixelRatio: 1,
		cacheBust: true,
		skipFonts: true
	});

	const response = await fetch(dataUrl);
	return response.blob();
}

export async function renderGifBlob(signaturePngBlob: Blob): Promise<Blob> {
	const { GIFEncoder, quantize, applyPalette } = await loadGifEnc();
	const { width, height } = E_SIGNATURE_PNG_SIZE;
	const { frameDelay, fadeSteps, holdDelay } = E_SIGNATURE_GIF_TIMING;

	const [brandsImage, jciImage, signatureData] = await Promise.all([
		loadImage(E_SIGNATURE_ASSETS.frames.brands),
		loadImage(E_SIGNATURE_ASSETS.frames.jci),
		blobToImageData(signaturePngBlob, width, height)
	]);

	const brandsData = imageToImageData(brandsImage, width, height);
	const jciData = imageToImageData(jciImage, width, height);
	const slides = [brandsData, jciData, signatureData];

	const gif = GIFEncoder();

	const writeImageDataFrame = (imageData: ImageData, delay: number) => {
		const palette = quantize(imageData.data, 256);
		const index = applyPalette(imageData.data, palette);
		gif.writeFrame(index, imageData.width, imageData.height, { palette, delay });
	};

	for (let i = 0; i < slides.length; i++) {
		writeImageDataFrame(slides[i], frameDelay);
		writeImageDataFrame(slides[i], holdDelay);

		const next = slides[(i + 1) % slides.length];
		const wipeFrames = createWipeFrames(slides[i], next, fadeSteps);
		for (const frame of wipeFrames) {
			writeImageDataFrame(frame, frameDelay);
		}
	}

	gif.finish();
	const bytes = gif.bytes();
	return new Blob([new Uint8Array(bytes)], { type: 'image/gif' });
}

export function downloadBlob(blob: Blob, filename: string) {
	const url = URL.createObjectURL(blob);
	const anchor = document.createElement('a');
	anchor.href = url;
	anchor.download = filename;
	anchor.click();
	URL.revokeObjectURL(url);
}

export function blobToDataUrl(blob: Blob): Promise<string> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => resolve(reader.result as string);
		reader.onerror = () => reject(new Error('Failed to read blob'));
		reader.readAsDataURL(blob);
	});
}
