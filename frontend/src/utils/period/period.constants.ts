import type { PeriodKey } from "./period.types";

export type PeriodConfig = {
	key: PeriodKey;
	shortLabelAligned: string;
	shortLabelRolling: string;
	longLabelAligned: string;
	longLabelRolling: string;
	daysRolling: number;
};

export const PERIODS: Record<PeriodKey, PeriodConfig> = {
	week: {
		key: "week",
		shortLabelAligned: "1W",
		shortLabelRolling: "7d",
		longLabelAligned: "This Week",
		longLabelRolling: "Last 7 Days",
		daysRolling: 7,
	},
	month: {
		key: "month",
		shortLabelAligned: "1M",
		shortLabelRolling: "30d",
		longLabelAligned: "This Month",
		longLabelRolling: "Last 30 Days",
		daysRolling: 30,
	},
	quarter: {
		key: "quarter",
		shortLabelAligned: "Q",
		shortLabelRolling: "90d",
		longLabelAligned: "This Quarter",
		longLabelRolling: "Last 90 Days",
		daysRolling: 90,
	},
	halfyear: {
		key: "halfyear",
		shortLabelAligned: "H",
		shortLabelRolling: "180d",
		longLabelAligned: "This Half Year",
		longLabelRolling: "Last 180 Days",
		daysRolling: 180,
	},
	year: {
		key: "year",
		shortLabelAligned: "1Y",
		shortLabelRolling: "365d",
		longLabelAligned: "This Year",
		longLabelRolling: "Last 365 Days",
		daysRolling: 365,
	},
	all: {
		key: "all",
		shortLabelAligned: "All",
		shortLabelRolling: "All",
		longLabelAligned: "All Time",
		longLabelRolling: "All Time",
		daysRolling: 0,
	},
};

export function getAvailablePeriods() {
	return Object.keys(PERIODS) as PeriodKey[];
}
