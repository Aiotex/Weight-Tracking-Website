/**
 * Weight conversion utilities
 */

import type { WeightUnit } from "../types";

const LB_TO_KG_RATIO = 2.20462;

/**
 * Convert weight from pounds to kilograms
 * @param weightLb Weight in pounds
 * @param decimals Optional number of decimal places to round to
 * @returns Weight in kilograms
 */
const convertLbToKg = (weightLb: number, decimals?: number): number => {
	const result = weightLb / LB_TO_KG_RATIO;
	return decimals !== undefined ? parseFloat(result.toFixed(decimals)) : result;
};

/**
 * Convert weight from kilograms to pounds
 * @param weightKg Weight in kilograms
 * @param decimals Optional number of decimal places to round to
 * @returns Weight in pounds
 */
const convertKgToLb = (weightKg: number, decimals?: number): number => {
	const result = weightKg * LB_TO_KG_RATIO;
	return decimals !== undefined ? parseFloat(result.toFixed(decimals)) : result;
};

/**
 * Convert weight to kilograms based on the current unit
 * @param weight Weight value
 * @param isImperial Whether the weight is in imperial units (pounds)
 * @param decimals Optional number of decimal places to round to
 * @returns Weight in kilograms
 */
export const convertToKg = (weight: number, isImperial: boolean, decimals?: number): number => {
	const result = isImperial ? convertLbToKg(weight) : weight;
	return decimals !== undefined ? parseFloat(result.toFixed(decimals)) : result;
};

/**
 * Convert weight from kilograms to the desired unit
 * @param weightKg Weight in kilograms
 * @param isImperial Whether to convert to imperial units (pounds)
 * @param decimals Optional number of decimal places to round to
 * @returns Weight in the desired unit
 */
export const convertFromKg = (weightKg: number, isImperial: boolean, decimals?: number): number => {
	const result = isImperial ? convertKgToLb(weightKg) : weightKg;
	return decimals !== undefined ? result && parseFloat(result.toFixed(decimals)) : result;
};

/**
 * Convert weight from any unit to kilograms
 * @param weight Weight value
 * @param unit The unit of the weight (kg, lb, etc.)
 * @param decimals Optional number of decimal places to round to
 * @returns Weight in kilograms
 */
export const convertWeightToKg = (weight: number, unit: WeightUnit, decimals?: number): number => {
	let result: number;

	switch (unit) {
		case "kg":
		case "g":
			result = unit === "g" ? weight / 1000 : weight;
			break;
		case "lb":
		case "oz":
			result = unit === "oz" ? convertLbToKg(weight / 16) : convertLbToKg(weight);
			break;
		case "st":
			result = convertLbToKg(weight * 14); // 1 stone = 14 pounds
			break;
		case "ton":
			result = convertLbToKg(weight * 2000); // 1 US ton = 2000 pounds
			break;
		case "mg":
			result = weight / 1000000; // 1 kg = 1,000,000 mg
			break;
		case "t":
			result = weight * 1000; // 1 tonne = 1000 kg
			break;
		default:
			throw new Error(`Unsupported weight unit: ${unit}`);
	}

	return decimals !== undefined ? parseFloat(result.toFixed(decimals)) : result;
};

/**
 * Convert weight from any unit to pounds
 * @param weight Weight value
 * @param unit The unit of the weight (kg, lb, etc.)
 * @param decimals Optional number of decimal places to round to
 * @returns Weight in pounds
 */
export const convertWeightToLb = (weight: number, unit: WeightUnit, decimals?: number): number => {
	let result: number;

	switch (unit) {
		case "lb":
		case "oz":
			result = unit === "oz" ? weight / 16 : weight;
			break;
		case "st":
			result = weight * 14; // 1 stone = 14 pounds
			break;
		case "ton":
			result = weight * 2000; // 1 US ton = 2000 pounds
			break;
		case "kg":
		case "g":
			const weightInKg = unit === "g" ? weight / 1000 : weight;
			result = convertKgToLb(weightInKg);
			break;
		case "mg":
			result = convertKgToLb(weight / 1000000); // Convert mg to kg, then to lb
			break;
		case "t":
			result = convertKgToLb(weight * 1000); // Convert tonne to kg, then to lb
			break;
		default:
			throw new Error(`Unsupported weight unit: ${unit}`);
	}

	return decimals !== undefined ? parseFloat(result.toFixed(decimals)) : result;
};
