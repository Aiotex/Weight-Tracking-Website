import { PERIODS } from "./period.constants";
import type { PeriodKey, PeriodLabel } from "./period.types";

export function getPeriodLabel(period: PeriodKey, aligned: boolean): PeriodLabel {
	const config = PERIODS[period];
	if (!config) throw new Error(`Invalid period: ${period}`);

	return {
		short: aligned ? config.shortLabelAligned : config.shortLabelRolling,
		long: aligned ? config.longLabelAligned : config.longLabelRolling,
	};
}
