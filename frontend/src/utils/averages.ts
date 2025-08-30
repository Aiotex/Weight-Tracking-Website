export type AveragePeriodKey = "none" | "weekly" | "monthly" | "yearly";

export type AveragePeriodConfig = {
	key: AveragePeriodKey;
	label: string;
};

export const averagePeriods: Record<AveragePeriodKey, AveragePeriodConfig> = {
	none: { key: "none", label: "Show All Data" },
	weekly: { key: "weekly", label: "Weekly Average" },
	monthly: { key: "monthly", label: "Monthly Average" },
	yearly: { key: "yearly", label: "Yearly Average" },
};

/**
 * Get all available average period keys
 * @returns Array of available average period keys
 */
export const getAvailableAveragePeriods = (): AveragePeriodKey[] => {
	return Object.keys(averagePeriods) as AveragePeriodKey[];
};

/**
 * Get the label for a specific average period
 * @param key - The average period key
 * @returns The label for the period
 */
export const getAveragePeriodLabel = (key: AveragePeriodKey): string => {
	return averagePeriods[key]?.label || key;
};
