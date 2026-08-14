/** Department rating scores (1 = worst, 5 = best). */
export const DEPARTMENT_RATING_SCORES = [1, 2, 3, 4, 5] as const;

export type DepartmentRatingScore = (typeof DEPARTMENT_RATING_SCORES)[number];

export const DEPARTMENT_RATING_LABELS: Record<DepartmentRatingScore, string> = {
	1: 'Angry',
	2: 'Frown',
	3: 'Meh',
	4: 'Smile',
	5: 'Laugh'
};

export const DEPARTMENT_RATING_OPTIONS = DEPARTMENT_RATING_SCORES.map((score) => ({
	score,
	label: DEPARTMENT_RATING_LABELS[score]
}));
