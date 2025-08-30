export type PeriodKey = "week" | "month" | "quarter" | "halfyear" | "year" | "all";

export interface PeriodOptions {
	today?: Date;
	alignToCalendar?: boolean;
	weekStartsOn?: number; // 0 = Sunday, 1 = Monday
}

export interface PeriodRange {
	start: Date;
	end: Date;
	today: Date;
}

export interface PeriodLabel {
	short: string;
	long: string;
}

export interface Period {
	key: PeriodKey;
	label: PeriodLabel;
	range?: PeriodRange;
	daysRolling: number;
	calendarAligned: boolean;
}
