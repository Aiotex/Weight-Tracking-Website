/**
 * Height conversion utilities
 */

import type { LengthUnit } from "../types";

const CM_TO_INCH_RATIO = 2.54;
const FEET_TO_INCH_RATIO = 12;

/**
 * Convert height from inches to centimeters
 * @param heightIn Height in inches
 * @param decimals Optional number of decimal places to round to
 * @returns Height in centimeters
 */
const convertInToCm = (heightIn: number, decimals?: number): number => {
	const result = heightIn * CM_TO_INCH_RATIO;
	return decimals !== undefined ? parseFloat(result.toFixed(decimals)) : result;
};

/**
 * Convert height from centimeters to inches
 * @param heightCm Height in centimeters
 * @param decimals Optional number of decimal places to round to
 * @returns Height in inches
 */
const convertCmToIn = (heightCm: number, decimals?: number): number => {
	const result = heightCm / CM_TO_INCH_RATIO;
	return decimals !== undefined ? parseFloat(result.toFixed(decimals)) : result;
};

/**
 * Convert height from feet and inches to total inches
 * @param feet Feet component
 * @param inches Inches component
 * @returns Total height in inches
 */
const convertFeetInchesToInches = (feet: number, inches: number): number => {
	return feet * FEET_TO_INCH_RATIO + inches;
};

/**
 * Convert total inches to feet and inches
 * @param totalInches Total height in inches
 * @returns Object with feet and inches
 */
const convertInchesToFeetInches = (totalInches: number): { feet: number; inches: number } => {
	const feet = Math.floor(totalInches / FEET_TO_INCH_RATIO);
	const inches = totalInches % FEET_TO_INCH_RATIO;
	return { feet, inches };
};

/**
 * Convert height to centimeters based on the current unit
 * @param height Height value
 * @param isImperial Whether the height is in imperial units (inches/feet)
 * @param decimals Optional number of decimal places to round to
 * @returns Height in centimeters
 */
export const convertToCm = (height: number, isImperial: boolean, decimals?: number): number => {
	const result = isImperial ? convertInToCm(height) : height;
	return decimals !== undefined ? parseFloat(result.toFixed(decimals)) : result;
};

/**
 * Convert height from centimeters to the desired unit
 * @param heightCm Height in centimeters
 * @param isImperial Whether to convert to imperial units (inches)
 * @param decimals Optional number of decimal places to round to
 * @returns Height in the desired unit (cm or inches)
 */
export const convertFromCm = (heightCm: number, isImperial: boolean, decimals?: number): number => {
	const result = isImperial ? convertCmToIn(heightCm) : heightCm;
	return decimals !== undefined ? parseFloat(result.toFixed(decimals)) : result;
};

/**
 * Convert height from any unit to centimeters
 * @param height Height value
 * @param unit The unit of the height (cm, m, in, ft, etc.)
 * @param decimals Optional number of decimal places to round to
 * @returns Height in centimeters
 */
export const convertHeightToCm = (height: number, unit: LengthUnit, decimals?: number): number => {
	let result: number;

	switch (unit) {
		case "cm":
		case "mm":
			result = unit === "mm" ? height / 10 : height;
			break;
		case "m":
			result = height * 100; // 1 meter = 100 cm
			break;
		case "km":
			result = height * 100000; // 1 km = 100,000 cm
			break;
		case "in":
			result = convertInToCm(height);
			break;
		case "ft":
			result = convertInToCm(height * FEET_TO_INCH_RATIO);
			break;
		case "yd":
			result = convertInToCm(height * 36); // 1 yard = 36 inches
			break;
		case "mi":
			result = convertInToCm(height * 63360); // 1 mile = 63,360 inches
			break;
		default:
			throw new Error(`Unsupported height unit: ${unit}`);
	}

	return decimals !== undefined ? parseFloat(result.toFixed(decimals)) : result;
};

/**
 * Convert height from any unit to inches
 * @param height Height value
 * @param unit The unit of the height (cm, m, in, ft, etc.)
 * @param decimals Optional number of decimal places to round to
 * @returns Height in inches
 */
export const convertHeightToIn = (height: number, unit: LengthUnit, decimals?: number): number => {
	let result: number;

	switch (unit) {
		case "in":
			result = height;
			break;
		case "ft":
			result = height * FEET_TO_INCH_RATIO;
			break;
		case "yd":
			result = height * 36; // 1 yard = 36 inches
			break;
		case "mi":
			result = height * 63360; // 1 mile = 63,360 inches
			break;
		case "cm":
		case "mm":
			const heightInCm = unit === "mm" ? height / 10 : height;
			result = convertCmToIn(heightInCm);
			break;
		case "m":
			result = convertCmToIn(height * 100); // Convert m to cm, then to inches
			break;
		case "km":
			result = convertCmToIn(height * 100000); // Convert km to cm, then to inches
			break;
		default:
			throw new Error(`Unsupported height unit: ${unit}`);
	}

	return decimals !== undefined ? parseFloat(result.toFixed(decimals)) : result;
};

/**
 * Format height for display in imperial format (feet and inches)
 * @param heightCm Height in centimeters
 * @param format Format style ('short' for 5'8" or 'long' for 5 feet 8 inches)
 * @returns Formatted height string
 */
export const formatImperialHeight = (heightCm: number, format: "short" | "long" = "short"): string => {
	const totalInches = convertCmToIn(heightCm);
	const { feet, inches } = convertInchesToFeetInches(totalInches);
	const roundedInches = Math.round(inches);

	if (format === "short") {
		return `${feet}'${roundedInches}"`;
	} else {
		const feetText = feet === 1 ? "foot" : "feet";
		const inchText = roundedInches === 1 ? "inch" : "inches";

		if (roundedInches === 0) {
			return `${feet} ${feetText}`;
		} else if (feet === 0) {
			return `${roundedInches} ${inchText}`;
		} else {
			return `${feet} ${feetText} ${roundedInches} ${inchText}`;
		}
	}
};

/**
 * Format height for display in metric format
 * @param heightCm Height in centimeters
 * @param format Format style ('cm' for 173 cm or 'm' for 1.73 m)
 * @returns Formatted height string
 */
export const formatMetricHeight = (heightCm: number, format: "cm" | "m" = "cm"): string => {
	if (format === "m") {
		const meters = (heightCm / 100).toFixed(2);
		return `${meters} m`;
	} else {
		return `${Math.round(heightCm)} cm`;
	}
};

/**
 * Parse imperial height string (e.g., "5'8"", "5 feet 8 inches") to centimeters
 * @param heightStr Height string in imperial format
 * @returns Height in centimeters or null if parsing fails
 */
export const parseImperialHeight = (heightStr: string): number | null => {
	// Remove extra spaces and convert to lowercase
	const normalized = heightStr.trim().toLowerCase();

	// Pattern for formats like "5'8"", "5' 8"", "5'8", etc.
	const shortPattern = /^(\d+)'?\s*(\d+)?"?$/;

	// Pattern for formats like "5 feet 8 inches", "5 ft 8 in", etc.
	const longPattern = /^(\d+)\s*(?:feet?|ft)\s*(?:(\d+)\s*(?:inches?|in)?)?$/;

	let feet = 0;
	let inches = 0;

	const shortMatch = normalized.match(shortPattern);
	if (shortMatch) {
		feet = parseInt(shortMatch[1]);
		inches = parseInt(shortMatch[2] || "0");
	} else {
		const longMatch = normalized.match(longPattern);
		if (longMatch) {
			feet = parseInt(longMatch[1]);
			inches = parseInt(longMatch[2] || "0");
		} else {
			return null; // Unable to parse
		}
	}

	const totalInches = convertFeetInchesToInches(feet, inches);
	return convertInToCm(totalInches);
};

/**
 * Get height unit display name
 * @param unit The length unit
 * @param isImperial Whether using imperial system
 * @returns Display name for the unit
 */
export const getHeightUnitDisplay = (isImperial: boolean): string => {
	return isImperial ? "ft/in" : "cm";
};
