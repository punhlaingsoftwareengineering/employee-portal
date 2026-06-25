import { z } from 'zod';
import { isNotificationSoundUrl } from '$lib/constants/notification';

const notificationSoundUrlSchema = z
	.string()
	.trim()
	.url()
	.max(2048)
	.refine(isNotificationSoundUrl, 'Must be a valid http or https URL');

export const createNotificationSoundSchema = z.object({
	name: z.string().min(1).max(120),
	mp3Url: notificationSoundUrlSchema,
	isDefault: z.boolean().optional()
});

export const updateNotificationSoundSchema = createNotificationSoundSchema.partial();

export type CreateNotificationSoundInput = z.infer<typeof createNotificationSoundSchema>;
export type UpdateNotificationSoundInput = z.infer<typeof updateNotificationSoundSchema>;
