declare module 'gifenc' {
	const gifenc: {
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
		applyPalette: (
			rgba: Uint8ClampedArray | Uint8Array,
			palette: number[][]
		) => Uint8Array;
	};

	export default gifenc;
	export = gifenc;
}
