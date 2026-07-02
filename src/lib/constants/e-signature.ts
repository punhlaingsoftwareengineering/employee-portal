export const E_SIGNATURE_DEFAULT_WEB = 'www.punhlainghospitals.com';

export const E_SIGNATURE_COLORS = {
	background: '#ffffff',
	accent: '#f37021',
	text: '#ffffff'
} as const;

export const E_SIGNATURE_PNG_SIZE = { width: 866, height: 271 } as const;

/** Legacy index.php typography (estyle1–7; style.css not in repo). */
export const E_SIGNATURE_LEGACY = {
	nameSize: 28,
	bodySize: 11,
	nameSpacer: 37,
	nameSpacerShort: 20,
	contactsSpacer: 8,
	contactRowHeight: 30,
	iconSize: 25,
	logoSpacerHeight: 130
} as const;

export const E_SIGNATURE_ASSETS = {
	background: '/e-signature/background-dark.png',
	frames: {
		brands: '/e-signature/frames/brands.png',
		jci: '/e-signature/frames/jci.png'
	},
	icons: {
		mail: '/e-signature/icons/mail.png',
		phone: '/e-signature/icons/phone.png',
		location: '/e-signature/icons/location.png',
		web: '/e-signature/icons/web.png'
	}
} as const;

/** Legacy GIF_Creator.php timing (centiseconds for hold, per-frame for transitions). */
export const E_SIGNATURE_GIF_TIMING = {
	frameDelay: 6,
	fadeSteps: 3,
	holdDelay: 500
} as const;
