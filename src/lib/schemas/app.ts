import { z } from 'zod';
import { APP_DOWNLOAD_PLATFORMS } from '$lib/constants/app-download';

const optionalUrl = z.string().url().max(2048).optional();
const nullableUrl = z.string().url().max(2048).nullable().optional();
const downloadLinkUrl = z.string().url().max(2048);

const downloadUrlsSchema = z
	.object({
		windows: downloadLinkUrl.optional(),
		macos: downloadLinkUrl.optional(),
		android: downloadLinkUrl.optional(),
		linux: downloadLinkUrl.optional(),
		zip: downloadLinkUrl.optional()
	})
	.refine((urls) => APP_DOWNLOAD_PLATFORMS.some((platform) => Boolean(urls[platform])), {
		message: 'At least one download URL is required'
	});

export const createAppSchema = z.object({
	name: z.string().min(1).max(120),
	tagline: z.string().max(200).optional(),
	description: z.string().max(5000).optional(),
	iconUrl: nullableUrl,
	bannerUrl: nullableUrl,
	downloadUrls: downloadUrlsSchema,
	version: z.string().max(40).optional(),
	developer: z.string().max(120).optional(),
	category: z.string().max(80).optional(),
	screenshotUrls: z.array(z.string().url().max(2048)).max(8).optional(),
	isPublic: z.boolean().optional()
});

export const updateAppSchema = createAppSchema.partial().extend({
	id: z.string().uuid()
});

export type CreateAppInput = z.infer<typeof createAppSchema>;
export type UpdateAppInput = z.infer<typeof updateAppSchema>;

export type AppSummary = {
	id: string;
	name: string;
	tagline: string | null;
	description: string | null;
	iconUrl: string | null;
	bannerUrl: string | null;
	downloadUrl: string | null;
	downloadUrls: import('$lib/constants/app-download').AppDownloadUrls;
	version: string | null;
	developer: string | null;
	category: string | null;
	screenshotUrls: string[];
	isPublic: boolean;
};
