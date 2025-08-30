import { PERIODS } from "./period.constants";
import type { PeriodKey, PeriodOptions, PeriodRange } from "./period.types";

function startOfWeek(date: Date, weekStartsOn: number): Date {
	const day = date.getDay();
	const diff = day - weekStartsOn;
	const start = new Date(date);
	start.setDate(date.getDate() - (diff < 0 ? diff + 7 : diff));
	return start;
}

function endOfWeek(date: Date, weekStartsOn: number): Date {
	const start = startOfWeek(date, weekStartsOn);
	const end = new Date(start);
	end.setDate(start.getDate() + 6);
	return end;
}

function startOfMonth(date: Date): Date {
	const start = new Date(date.getFullYear(), date.getMonth(), 1);
	return start;
}

function endOfMonth(date: Date): Date {
	const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
	return end;
}

function startOfQuarter(date: Date): Date {
	const quarter = Math.floor(date.getMonth() / 3);
	const start = new Date(date.getFullYear(), quarter * 3, 1);
	return start;
}

function endOfQuarter(date: Date): Date {
	const quarter = Math.floor(date.getMonth() / 3);
	const end = new Date(date.getFullYear(), (quarter + 1) * 3, 0);
	return end;
}

function startOfHalfYear(date: Date): Date {
	const half = Math.floor(date.getMonth() / 6);
	const start = new Date(date.getFullYear(), half * 6, 1);
	return start;
}

function endOfHalfYear(date: Date): Date {
	const half = Math.floor(date.getMonth() / 6);
	const end = new Date(date.getFullYear(), (half + 1) * 6, 0);
	return end;
}

function startOfYear(date: Date): Date {
	const start = new Date(date.getFullYear(), 0, 1);
	return start;
}

function endOfYear(date: Date): Date {
	const end = new Date(date.getFullYear(), 11, 31);
	return end;
}

function subDays(date: Date, days: number): Date {
	const result = new Date(date);
	result.setDate(date.getDate() - days);
	return result;
}

export function getDaysInRange(range: PeriodRange): number {
	return Math.ceil((range.end.getTime() - range.start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
}

export function getPeriodRange(period: PeriodKey, opts: PeriodOptions = {}): PeriodRange | undefined {
	const { alignToCalendar = true, today = new Date(), weekStartsOn = 1 } = opts;
	const config = PERIODS[period];

	let start: Date;
	let end: Date;

	if (alignToCalendar) {
		switch (period) {
			case "week":
				start = startOfWeek(today, weekStartsOn);
				end = endOfWeek(today, weekStartsOn);
				break;
			case "month":
				start = startOfMonth(today);
				end = endOfMonth(today);
				break;
			case "quarter":
				start = startOfQuarter(today);
				end = endOfQuarter(today);
				break;
			case "halfyear":
				start = startOfHalfYear(today);
				end = endOfHalfYear(today);
				break;
			case "year":
				start = startOfYear(today);
				end = endOfYear(today);
				break;
			case "all":
				return undefined;
		}
	} else {
		start = subDays(today, config.daysRolling - 1);
		end = new Date(today);
	}

	start.setHours(23, 59, 59, 999);
	end.setHours(23, 59, 59, 999);

	return {
		start,
		end,
		today,
	};
}
