/**
 * Maps API validation errors to a more usable format for form display
 * @param apiErrors Array of error objects from API response
 * @returns Record mapping field names to error messages
 */
export const mapErrors = (apiErrors: { field: string; issue: string }[]): Record<string, string> => {
	const errorMap: Record<string, string> = {};
	for (const err of apiErrors) {
		errorMap[err.field] = err.issue;
	}
	return errorMap;
};
