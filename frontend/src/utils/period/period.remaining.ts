import type { Period } from "./period.types";

export function countRemainingPeriods(period: Period, end: Date, today?: Date): number {
	today = today || new Date();
	const periodTimeMs = period.daysRolling * (1000 * 3600 * 24);
	const remainingTimeMs = end.getTime() - today.getTime();
	const remainingPeriods = remainingTimeMs / periodTimeMs;

	console.log("Remaining periods:", {
		period,
		periodTimeMs,
		remainingTimeMs,
		remainingPeriods,
	});

	if (remainingPeriods <= 0) return 0;
	return remainingPeriods;
}
