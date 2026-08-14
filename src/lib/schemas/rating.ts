import { z } from 'zod';
import { DEPARTMENT_RATING_SCORES } from '$lib/constants/rating';

export const departmentRatingScoreSchema = z.union([
	z.literal(1),
	z.literal(2),
	z.literal(3),
	z.literal(4),
	z.literal(5)
]);

export const saveDepartmentRatingSchema = z.object({
	departmentId: z.string().uuid(),
	score: departmentRatingScoreSchema
});

export type SaveDepartmentRatingInput = z.infer<typeof saveDepartmentRatingSchema>;

/** Runtime check that Zod literals match constants. */
void DEPARTMENT_RATING_SCORES;
