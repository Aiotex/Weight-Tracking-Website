import { createContext, useState, useEffect } from "react";
import React from "react";
import { UNITS, type Unit } from "../constants";
import type { PeriodKey } from "../utils/period";

type UserPreferences = {
	unit: Unit;
	defaultSelectedPeriod: PeriodKey;
	alignToCalendar: boolean;
	weekStartsOn: 0 | 1; // 0 = Sunday, 1 = Monday
	theme: string;
};

type UserPreferencesContextType = {
	preferences: UserPreferences;
	setPreferences: React.Dispatch<React.SetStateAction<UserPreferences>>;
	updatePreference: <K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => void;
};

const USER_PREFERENCES_STORAGE_KEY = "userPreferences";

const defaultPreferences: UserPreferences = {
	unit: UNITS.METRIC.key,
	defaultSelectedPeriod: "week",
	alignToCalendar: true,
	weekStartsOn: 0,
	theme: "#3ab0b9",
};

const UserPreferencesContext = createContext<UserPreferencesContextType | null>(null);

export const UserPreferencesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const [preferences, setPreferences] = useState<UserPreferences>(() => {
		const storedPreferences = localStorage.getItem(USER_PREFERENCES_STORAGE_KEY);
		if (storedPreferences) {
			try {
				const parsed = JSON.parse(storedPreferences);
				return { ...defaultPreferences, ...parsed };
			} catch (error) {
				console.error("Failed to parse stored preferences:", error);
				return defaultPreferences;
			}
		}
		return defaultPreferences;
	});

	// Update individual preference
	const updatePreference = <K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => {
		setPreferences((prev) => ({
			...prev,
			[key]: value,
		}));
	};

	useEffect(() => {
		localStorage.setItem(USER_PREFERENCES_STORAGE_KEY, JSON.stringify(preferences));
	}, [preferences]);

	return <UserPreferencesContext.Provider value={{ preferences, setPreferences, updatePreference }}>{children}</UserPreferencesContext.Provider>;
};

export default UserPreferencesContext;
