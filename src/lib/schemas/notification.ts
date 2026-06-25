import { z } from 'zod';
import { NOTIFICATION_PRIORITIES } from '$lib/constants/notification';

const notificationFieldsSchema = z.object({
	title: z.string().min(1).max(200),
	body: z.string().max(500).optional(),
	linkUrl: z.string().url().max(2048).optional(),
	priority: z.enum(NOTIFICATION_PRIORITIES).optional(),
	iconName: z.string().max(64).optional(),
	imageUrl: z.string().url().max(2048).optional(),
	soundId: z.string().uuid().optional()
});

function rejectIconAndImageTogether(
	data: { iconName?: string; imageUrl?: string },
	ctx: z.RefinementCtx
) {
	if (data.iconName?.trim() && data.imageUrl?.trim()) {
		ctx.addIssue({
			code: 'custom',
			message: 'Use either an icon name or an image URL, not both',
			path: ['iconName']
		});
	}
}

export const createNotificationSchema = notificationFieldsSchema.superRefine(
	rejectIconAndImageTogether
);

export const updateNotificationSchema = notificationFieldsSchema
	.partial()
	.superRefine(rejectIconAndImageTogether);

export type CreateNotificationInput = z.infer<typeof createNotificationSchema>;
export type UpdateNotificationInput = z.infer<typeof updateNotificationSchema>;

export type PublicNotification = {
	id: string;
	title: string;
	body: string | null;
	linkUrl: string | null;
	priority: (typeof NOTIFICATION_PRIORITIES)[number];
	iconName: string | null;
	imageUrl: string | null;
	soundMp3Url: string | null;
	createdAt: string;
};
