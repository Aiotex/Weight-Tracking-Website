import type { Period } from "./period.types";
import type { Goal } from "../../types/api";
import { countRemainingPeriods } from "./period.remaining";

/**
 * Calculates how much weight needs to be lost/gained per period to reach the goal
 * @param goal The user's weight goal
 * @param period The period to calculate for
 * @param startingWeightAtPeriod Optional starting weight for the period (if different from goal start weight)
 * @returns The weight change needed per period, or undefined if goal is not achievable
 */
export function calculatePeriodGoal(goal: Goal, period: Period, startingWeightAtPeriod?: number): number | undefined {
	// TODO: handle the goal being in the past
	const targetDate = new Date(goal.targetDate);
	const startWeight = startingWeightAtPeriod || goal.startWeightKg; // Use period starting weight if available
	const targetWeight = goal.targetWeightKg;
	const remainingPeriods = Math.ceil(countRemainingPeriods(period, targetDate));

	console.log("targetDate:", targetDate, "startWeight:", startWeight, "targetWeight:", targetWeight, "remainingPeriods:", remainingPeriods);

	if (remainingPeriods <= 0) return;

	const totalWeightChange = Math.abs(targetWeight - startWeight);
	const periodGoal = totalWeightChange / remainingPeriods;
	return periodGoal;
}
