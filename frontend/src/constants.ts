export type Role = "ADMIN" | "USER" | "DEMO";

export type Unit = "METRIC" | "IMPERIAL";

export type Gender = "MALE" | "FEMALE" | "OTHER";

interface RoleConfig {
	key: Role;
	label: string;
}

interface UnitConfig {
	key: Unit;
	label: string;
}

interface GenderConfig {
	key: Gender;
	label: string;
}

export const ROLES: Record<Role, RoleConfig> = {
	ADMIN: {
		key: "ADMIN",
		label: "Admin",
	},
	USER: {
		key: "USER",
		label: "User",
	},
	DEMO: {
		key: "DEMO",
		label: "Demo",
	},
};

export const UNITS: Record<Unit, UnitConfig> = {
	METRIC: {
		key: "METRIC",
		label: "Metric",
	},
	/*
      Length: Millimeter (mm), Centimeter (cm), Meter (m), Kilometer (km)
      Weight: Milligram (mg), Gram (g), Kilogram (kg), Tonne (t)
      Volume: Milliliter (mL), Liter (L)
      Temperature: Celsius (°C)
    */
	IMPERIAL: {
		key: "IMPERIAL",
		label: "Imperial",
	},
	/*
      Length: Inch (in), Foot (ft), Yard (yd), Mile (mi)
      Weight: Ounce (oz), Pound (lb), Stone (st), Ton (US)
      Volume: Fluid ounce (fl oz), Cup (cup), Pint (pt), Quart (qt), Gallon (gal)
      Temperature: Fahrenheit (°F)
    */
};

export const GENDERS: Record<Gender, GenderConfig> = {
	MALE: {
		key: "MALE",
		label: "Male",
	},
	FEMALE: {
		key: "FEMALE",
		label: "Female",
	},
	OTHER: {
		key: "OTHER",
		label: "Other",
	},
};

interface ColorOption {
	title: string;
	value: string;
}

export const defaultThemeColors: ColorOption[] = [
	{ title: "Red", value: "#ef4444" },
	{ title: "Orange", value: "#f97316" },
	{ title: "Yellow", value: "#eab308" },
	{ title: "Green", value: "#22c55e" },
	{ title: "Cyan", value: "#06b6d4" },
	{ title: "Blue", value: "#3b82f6" },
	{ title: "Violet", value: "#8b5cf6" },
	{ title: "Pink", value: "#ec4899" },
	{ title: "Gray", value: "#6b7280" },
	{ title: "Black", value: "#000000" },
];
