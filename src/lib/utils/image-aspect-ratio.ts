import {
	aspectHint,
	formatAspectRatio,
	type ImageAspectRatio
} from '$lib/constants/image-aspect';

export type ImageDimensions = { width: number; height: number };

export function isImageFile(file: File): boolean {
	if (file.type.startsWith('image/')) return true;
	return /\.(avif|bmp|gif|jpe?g|png|svg|webp)$/i.test(file.name);
}

export function isImageUrl(url: string): boolean {
	const trimmed = url.trim();
	if (!trimmed) return false;
	if (/^data:image\//i.test(trimmed)) return true;
	try {
		const path = new URL(trimmed).pathname;
		return /\.(avif|bmp|gif|jpe?g|png|svg|webp)$/i.test(path);
	} catch {
		return /\.(avif|bmp|gif|jpe?g|png|svg|webp)(\?|#|$)/i.test(trimmed);
	}
}

export function getImageDimensionsFromFile(file: File): Promise<ImageDimensions> {
	if (typeof createImageBitmap === 'function') {
		return createImageBitmap(file)
			.then((bitmap) => {
				const dims = { width: bitmap.width, height: bitmap.height };
				bitmap.close();
				return dims;
			})
			.catch(() => getImageDimensionsFromObjectUrl(file));
	}
	return getImageDimensionsFromObjectUrl(file);
}

function getImageDimensionsFromObjectUrl(file: File): Promise<ImageDimensions> {
	const objectUrl = URL.createObjectURL(file);
	return getImageDimensionsFromUrl(objectUrl).finally(() => URL.revokeObjectURL(objectUrl));
}

export function getImageDimensionsFromUrl(src: string): Promise<ImageDimensions> {
	return new Promise((resolve, reject) => {
		const img = new Image();
		img.onload = () => {
			if (!img.naturalWidth || !img.naturalHeight) {
				reject(new Error('Could not read image dimensions'));
				return;
			}
			resolve({ width: img.naturalWidth, height: img.naturalHeight });
		};
		img.onerror = () => reject(new Error('Could not load image to check aspect ratio'));
		img.src = src;
	});
}

export function matchesAspectRatio(
	dims: ImageDimensions,
	aspect: ImageAspectRatio
): boolean {
	const expected = aspect.width / aspect.height;
	const actual = dims.width / dims.height;
	const tolerance = aspect.tolerance ?? 0.05;
	return Math.abs(actual - expected) / expected <= tolerance;
}

export function aspectMismatchMessage(
	dims: ImageDimensions,
	aspect: ImageAspectRatio
): string {
	return (
		`Wrong aspect ratio. Required ${aspect.label} (${aspect.usage}). ` +
		`This image is ${formatAspectRatio(dims.width, dims.height)} ` +
		`(${dims.width}×${dims.height}px).`
	);
}

export async function assertImageFileAspect(
	file: File,
	aspect: ImageAspectRatio | null | undefined
): Promise<void> {
	if (!aspect) return;
	if (!isImageFile(file)) return;
	const dims = await getImageDimensionsFromFile(file);
	if (!matchesAspectRatio(dims, aspect)) {
		throw new Error(aspectMismatchMessage(dims, aspect));
	}
}

export async function assertImageUrlAspect(
	url: string,
	aspect: ImageAspectRatio | null | undefined,
	options?: { allowNonImage?: boolean }
): Promise<void> {
	if (!aspect) return;
	const trimmed = url.trim();
	if (!trimmed) return;
	try {
		const dims = await getImageDimensionsFromUrl(trimmed);
		if (!matchesAspectRatio(dims, aspect)) {
			throw new Error(aspectMismatchMessage(dims, aspect));
		}
	} catch (e) {
		const message = e instanceof Error ? e.message : 'Could not check image aspect ratio';
		if (options?.allowNonImage && /could not load/i.test(message)) {
			return;
		}
		throw e instanceof Error ? e : new Error(message);
	}
}

export { aspectHint };
