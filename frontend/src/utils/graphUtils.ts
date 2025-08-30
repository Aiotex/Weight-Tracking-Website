import type { AveragePeriodKey } from "./averages";
import type { WeightEntry, AverageEntry, YearlyAverage, MonthlyAverage, WeeklyAverage } from "../types";
import type { PeriodKey } from "./period";

// Unified graph data point interface
export interface GraphDataPoint {
	value: number;
	date: Date;
	notes?: string;
	label?: string; // Custom label for averages
	hidden?: boolean; // Flag to hide this point in the graph
}

/**
 * Determines if data is average data based on the average period
 */
const isAverageData = (data: any[], averagePeriod: AveragePeriodKey): data is AverageEntry[] => {
	if (averagePeriod === "none" || data.length === 0) {
		return false;
	}

	const firstItem = data[0];

	// Check if it has the average property and the appropriate time property
	const hasAverage = "average" in firstItem;
	const hasTimeProperty =
		(averagePeriod === "yearly" && "year" in firstItem) || (averagePeriod === "monthly" && "month" in firstItem) || (averagePeriod === "weekly" && "week" in firstItem);

	console.log("isAverageData check:", {
		averagePeriod,
		hasAverage,
		hasTimeProperty,
		firstItem,
		result: hasAverage && hasTimeProperty,
	});

	return hasAverage && hasTimeProperty;
};

/**
 * Transforms weight entries to graph data points
 */
const transformWeightEntries = (entries: WeightEntry[]): GraphDataPoint[] => {
	return entries.map((entry) => {
		const date = new Date(entry.date);
		const label = date.toLocaleDateString("en-US", {
			weekday: "short",
			month: "short",
			day: "numeric",
		});

		return {
			value: entry.weightKg,
			date,
			notes: entry.notes,
			label,
		};
	});
};

/**
 * Transforms average data to graph data points with appropriate date parsing and labels
 */
const transformAverageData = (data: AverageEntry[], averagePeriod: AveragePeriodKey, weekStartsOn: number = 0): GraphDataPoint[] => {
	console.log("transformAverageData input:", { data, averagePeriod }); // Debug log

	return data.map((item, index) => {
		console.log(`Processing item ${index}:`, item); // Debug log

		let date: Date;
		let label: string;

		if (averagePeriod === "yearly") {
			const yearData = item as YearlyAverage;
			date = new Date(parseInt(yearData.year), 0, 1); // January 1st of the year
			label = yearData.year;
		} else if (averagePeriod === "monthly") {
			const monthData = item as MonthlyAverage;
			const [year, month] = monthData.month.split("-").map(Number);
			date = new Date(year, month - 1, 1); // First day of the month
			label = `${date.toLocaleString("default", { month: "long", year: "numeric" })}`;
		} else if (averagePeriod === "weekly") {
			const weekData = item as WeeklyAverage;
			const [year, weekNum] = weekData.week.split("-").map(Number);
			date = getDateFromYearAndWeek(year, weekNum, weekStartsOn);
			const startStr = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
			label = `${year} Week ${weekNum} (${startStr})`;
		} else {
			date = new Date();
			label = "Unknown";
		}

		return {
			value: item.average,
			date,
			label,
		};
	});
};

/**
 * Calculate the date from an ISO 8601 week and year
 */
const getDateFromYearAndWeek = (year: number, week: number, weekStartsOn: number = 0): Date => {
	const simple = new Date(year, 0, 1 + (week - 1) * 7);
	const dayOfWeek = simple.getDay();
	const isoWeekStart = simple;

	// Get the Monday past, and add a week if the day was
	// Friday, Saturday or Sunday.
	isoWeekStart.setDate(simple.getDate() - dayOfWeek + weekStartsOn);
	if (dayOfWeek > 4) {
		isoWeekStart.setDate(isoWeekStart.getDate() + 7);
	}

	// The latest possible ISO week starts on December 28 of the current year.
	if (isoWeekStart.getFullYear() > year || (isoWeekStart.getFullYear() == year && isoWeekStart.getMonth() == 11 && isoWeekStart.getDate() > 28)) {
		throw new RangeError(`${year} has no ISO week ${week}`);
	}

	return isoWeekStart;
};

/**
 * Main transformation function that handles both weight entries and average data
 */
export const transformToGraphData = (data: WeightEntry[] | AverageEntry[], averagePeriod: AveragePeriodKey, weekStartsOn: number = 0): GraphDataPoint[] => {
	console.log("transformToGraphData called with:", { data, averagePeriod, weekStartsOn });

	if (isAverageData(data, averagePeriod)) {
		console.log("Using transformAverageData");
		return transformAverageData(data, averagePeriod, weekStartsOn);
	} else {
		console.log("Using transformWeightEntries");
		return transformWeightEntries(data as WeightEntry[]);
	}
};

/**
 * Get the appropriate label format for Chart.js based on the average period
 */
export const getChartLabelFormat = (periodKey?: PeriodKey) => {
	switch (periodKey) {
		case "week":
			return {
				unit: "day" as const,
			};
		case "month":
			return {
				unit: "day" as const,
			};
		default:
			return {
				unit: "month" as const,
			};
	}
};

/**
 * Get custom tooltip formatter for different average periods
 */
export const getTooltipFormatter = (averagePeriod: AveragePeriodKey) => {
	return (tooltipItems: any[]) => {
		const item = tooltipItems[0];
		const dataPoint = item.parsed;
		const rawData = item.dataset.data[item.dataIndex] as GraphDataPoint;

		switch (averagePeriod) {
			case "yearly":
				return [`${dataPoint.y.toFixed(1)}kg (Yearly Average)`, rawData.label || ""];
			case "monthly":
				return [`${dataPoint.y.toFixed(1)}kg (Monthly Average)`, rawData.label || ""];
			case "weekly":
				return [`${dataPoint.y.toFixed(1)}kg (Weekly Average)`, rawData.label || ""];
			case "none":
			default:
				return [`${dataPoint.y.toFixed(1)}kg`, rawData.notes || ""];
		}
	};
};
