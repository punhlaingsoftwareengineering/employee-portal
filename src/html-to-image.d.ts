declare module 'html-to-image' {
	export function toPng(
		node: HTMLElement,
		options?: {
			width?: number;
			height?: number;
			pixelRatio?: number;
			cacheBust?: boolean;
			skipFonts?: boolean;
		}
	): Promise<string>;
}
