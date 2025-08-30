import type { Role, Gender, Unit } from "../constants";

export interface User {
	id: number;
	firstName: string;
	lastName: string;
	email: string;
	role: Role;
	avatarUrl: string;
	heightCm: number;
	dateOfBirth: string;
	gender: Gender;
	unitPreference: Unit;
	weekStartsOn: 0 | 1;
}

export interface Goal {
	targetWeightKg: number;
	targetDate: string;
	startWeightKg: number;
	startDate: string;
}

export interface WeightEntry {
	id: number;
	weightKg: number;
	date: string;
	notes: string;
}

export interface YearlyAverage {
	year: string; // "yyyy"
	average: number;
}

export interface MonthlyAverage {
	month: string; // "yyyy-mm"
	average: number;
}

export interface WeeklyAverage {
	week: string; // "yyyy-{week number}"
	average: number;
}

// response from endpoint weights/average/{period}
export type AverageEntry = YearlyAverage | MonthlyAverage | WeeklyAverage;
