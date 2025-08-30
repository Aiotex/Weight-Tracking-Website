/**
 * Format date to ISO 8601 format (YYYY-MM-DD) without timezone conversion
 * Uses local date methods to avoid UTC conversion issues
 */
export const formatDateForInput = (date: Date | string): string => {
	date = typeof date === "string" ? new Date(date) : date;

	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");
	return `${year}-${month}-${day}`;
};
