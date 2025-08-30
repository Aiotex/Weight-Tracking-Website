import { getPeriodRange, getDaysInRange } from "./period.range";
import { getPeriodLabel } from "./period.label";
import type { PeriodKey, Period, PeriodOptions } from "./period.types";

export function createPeriod(period: PeriodKey, options: PeriodOptions = {}): Period {
	const calendarAligned = options.alignToCalendar ?? true;

	const label = getPeriodLabel(period, calendarAligned);
	const range = getPeriodRange(period, options);
	const daysRolling = range ? getDaysInRange(range) : 0;

	return {
		key: period,
		range: range,
		label,
		daysRolling,
		calendarAligned,
	};
}
