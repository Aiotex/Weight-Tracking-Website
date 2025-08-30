import React, { useState, useCallback, useEffect, useRef } from "react";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import useUserPreferences from "../hooks/useUserPreferences";
import { convertFromKg, convertToKg } from "../utils/weightUtils";
import { convertFromCm, convertToCm } from "../utils/heightUtils";
import { Input, Dropdown, ColorPicker } from "../components/inputs";
import { Button } from "../components/buttons";
import useAuth from "../hooks/useAuth";
import { TrashIcon } from "../components/icons";
import { GENDERS, UNITS, defaultThemeColors } from "../constants";
import type { Unit, Gender } from "../constants";
import { toast } from "react-toastify";
import type { WeightUnit, LengthUnit, User } from "../types";
import { formatDateForInput } from "../utils/dateUtils";
import { mapErrors } from "../utils/errorsUtils";

type SettingsTab = "Account" | "Preferences" | "Goals";

interface SettingSegmentWrapperProps {
	title: string;
	subtitle?: string;
	children?: React.ReactNode;
}

const SettingSegmentWrapper: React.FC<SettingSegmentWrapperProps> = ({ title, subtitle, children }) => (
	<div className="border-secondary mb-8 flex w-full justify-between gap-2 border-b-1 pb-12">
		<div className="flex w-1/3 flex-col gap-3">
			<h2 className="text-primary text-m">{title}</h2>
			{subtitle && <p className="text-grey text-s">{subtitle}</p>}
		</div>
		<div className="flex h-min w-2/3 flex-row items-end gap-6 xl:w-1/2">{children}</div>
	</div>
);

// TODO: I hate this page. research on how to make better input forms
const Settings: React.FC = () => {
	const { auth, setAuth } = useAuth();
	const { preferences, setPreferences } = useUserPreferences();
	const axiosPrivate = useAxiosPrivate();

	const defualtAvatarUrl = "../default-avatar.jpg"; // Default avatar URL

	const fileInputRef = useRef<HTMLInputElement>(null);
	const [activeTab, setActiveTab] = useState<SettingsTab>("Account");
	const [errors, setErrors] = useState<Record<string, string>>({});
	const [isSubmitting, setIsSubmitting] = useState(false);
	//const [isLoading, setIsLoading] = useState(false);
	const [selectedFile, setSelectedFile] = useState<File | null>(null);

	const [preview, setPreview] = useState<string | null>(auth?.user.avatarUrl || defualtAvatarUrl);
	const [formData, setFormData] = useState({
		// Profile data
		firstName: auth?.user.firstName || "",
		lastName: auth?.user.lastName || "",
		email: auth?.user.email || "",
		// Password data
		password: "",
		// Body metrics
		gender: auth?.user.gender || GENDERS.OTHER.key,
		dateOfBirth: auth?.user.dateOfBirth || "",
		height: auth?.user.heightCm && convertFromCm(auth?.user.heightCm, preferences.unit === UNITS.IMPERIAL.key, 1),
		// Weight goal
		targetWeight: "",
		startWeight: "",
		targetDate: "",
		startDate: "",
		// Preferences
		theme: preferences.theme,
		unitPreference: preferences.unit || UNITS.METRIC.key,
		weekStartsOn: preferences.weekStartsOn.toString(),
		alignToCalendar: preferences.alignToCalendar.toString(),
	});

	// Use formData.unitPreference for real-time updates, fallback to preferences.unit
	const currentUnit: Unit = (formData.unitPreference as Unit) || preferences.unit;
	const isImperial: boolean = currentUnit === UNITS.IMPERIAL.key;
	const lengthUnit: LengthUnit = isImperial ? "in" : "cm";
	const weightUnit: WeightUnit = isImperial ? "lb" : "kg";

	const tabs: SettingsTab[] = ["Account", "Preferences", "Goals"];

	const fetchWeightGoal = useCallback(async () => {
		try {
			//setIsLoading(true);

			const response = await axiosPrivate.get("/goals");
			const { targetWeightKg, targetDate, startWeightKg, startDate } = response.data;

			// Use current unit preference for conversion
			const currentIsImperial = formData.unitPreference === UNITS.IMPERIAL.key;
			const targetWeight = convertFromKg(targetWeightKg, currentIsImperial, 1).toString();
			const startWeight = convertFromKg(startWeightKg, currentIsImperial, 1).toString();

			setFormData((prev) => ({ ...prev, targetWeight, targetDate, startWeight, startDate }));
		} catch (error) {
			console.error("Error fetching weight goal data:", error);
		} finally {
			//setIsLoading(false);
		}
	}, [axiosPrivate, formData.unitPreference]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsSubmitting(true);
		setErrors({});

		const firstName = formData.firstName;
		const lastName = formData.lastName;
		const email = formData.email;
		const password = formData.password;
		const currentIsImperial = formData.unitPreference === UNITS.IMPERIAL.key;
		const heightCm = formData.height ? convertToCm(formData.height, currentIsImperial) : null;
		const dateOfBirth = formData.dateOfBirth ? formatDateForInput(formData.dateOfBirth) : null;
		const gender: Gender = formData.gender;
		const unitPreference: Unit = formData.unitPreference;
		const weekStartsOn = parseInt(formData.weekStartsOn, 10) as 0 | 1;

		const theme = formData.theme;
		const alignToCalendar = formData.alignToCalendar === "true" ? true : false;

		const targetWeightKg = formData.targetWeight ? convertToKg(parseFloat(formData.targetWeight), currentIsImperial) : null;
		const targetDate = formatDateForInput(formData.targetDate);
		const startWeightKg = formData.startWeight ? convertToKg(parseFloat(formData.startWeight), currentIsImperial) : null;
		const startDate = formatDateForInput(formData.startDate);

		console.log(heightCm, typeof heightCm, "Height in cm:", heightCm);

		try {
			// Upload image if one is selected
			if (selectedFile) {
				console.log("Uploading avatar image...");
				const formData = new FormData();
				formData.append("avatar", selectedFile);

				try {
					await axiosPrivate.post("/users/me/avatar", formData, {
						headers: {
							"Content-Type": "multipart/form-data",
						},
					});
				} catch (uploadError) {
					console.error("Error uploading avatar:", uploadError);
					toast.error("Failed to upload avatar image");
					// Continue with other updates even if avatar upload fails
				}
			} else if (!preview) {
				// if there is no preview and no selection delete the avater
				console.log("No file selected, deleting avatar");
				try {
					await axiosPrivate.delete("/users/me/avatar");
				} catch (err) {
					console.error("Error deleting avatar:", err);
					toast.error("Failed to delete avatar image");
				}
				setPreview(defualtAvatarUrl);
			}

			await axiosPrivate.patch("/users/me", {
				firstName,
				lastName,
				email,
				...(password && { password }),
				heightCm,
				dateOfBirth,
				gender,
				unitPreference,
				weekStartsOn,
			});

			await axiosPrivate.patch("/goals", {
				...(targetWeightKg !== null && { targetWeightKg }),
				...(targetDate && { targetDate }),
				...(startWeightKg !== null && { startWeightKg }),
				...(startDate && { startDate }),
			});

			const response: User = (await axiosPrivate.get("/users/me")).data;
			setAuth((prev) => (prev ? { ...prev, user: response } : null));
			setPreferences((prev) => ({ ...prev, theme, unit: unitPreference, weekStartsOn, alignToCalendar }));
			toast.success("Saved changes successfully");
		} catch (err: any) {
			console.error("Error updating personal info:", err);
			setErrors(mapErrors(err.response?.data?.error?.details));
			toast.error("Failed to update personal info");
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;

		console.log("Form data changed:", name, value);

		setFormData((prev) => ({ ...prev, [name]: value }));

		// Clear error when user starts typing
		if (errors[name]) {
			setErrors((prev) => {
				const { [name]: _, ...rest } = prev;
				return rest;
			});
		}
	};

	const handleEditImgClick = (e: React.MouseEvent<HTMLButtonElement>) => {
		e.preventDefault();
		fileInputRef.current?.click(); // trigger file picker
	};

	const handleDeleteImgClick = (e: React.MouseEvent<HTMLButtonElement>) => {
		e.preventDefault();
		setPreview(null);
		setSelectedFile(null);
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	};

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		setSelectedFile(file);
		setPreview(URL.createObjectURL(file));
	};

	const handleColorPickerChange = (color: string) => {
		setFormData((prev) => ({ ...prev, theme: color as any }));
		console.log("Theme changed to:", color);
	};

	const handleCancel = (e: React.MouseEvent<HTMLButtonElement>) => {
		e.preventDefault(); // Prevent form submission
		window.location.reload(); // Reload the page to reset to default values
	};

	useEffect(() => {
		fetchWeightGoal();
	}, [fetchWeightGoal]);

	// Handle unit conversion when unitPreference changes
	useEffect(() => {
		const newIsImperial = formData.unitPreference === UNITS.IMPERIAL.key;

		// Convert height when unit changes
		if (formData.height && auth?.user.heightCm) {
			const convertedHeight = convertFromCm(auth.user.heightCm, newIsImperial, 1);
			setFormData((prev) => ({
				...prev,
				height: convertedHeight,
			}));
		}

		// Convert weight goals when unit changes (if they exist)
		if (formData.targetWeight || formData.startWeight) {
			// We need to fetch the original values in kg and convert them
			fetchWeightGoal();
		}
	}, [formData.unitPreference, auth?.user.heightCm]);

	const renderTabContent = () => {
		switch (activeTab) {
			case "Account":
				return (
					<>
						<SettingSegmentWrapper title="Profile" subtitle="Edit your account details">
							<div className="flex w-full flex-col gap-6">
								<div className="flex gap-8">
									<Input
										id="firstName"
										value={formData.firstName}
										onChange={handleChange}
										errorMsg={errors.firstName}
										label="First Name"
										placeholder="Enter your first name"
										className="w-full"
									/>
									<Input
										id="lastName"
										value={formData.lastName}
										onChange={handleChange}
										errorMsg={errors.lastName}
										label="Last Name"
										placeholder="Enter your first name"
										className="w-full"
									/>
								</div>
								<Input
									id="email"
									value={formData.email}
									onChange={handleChange}
									errorMsg={errors.email}
									label="Email"
									placeholder="Enter your email address"
									className="w-full"
									required
								/>
							</div>
							<div className="flex h-40 w-30 min-w-30 flex-col items-center gap-4">
								<img
									src={preview ? preview : defualtAvatarUrl}
									alt="Avatar"
									className="aspect-square w-full rounded-full bg-white/10 object-cover"
									onError={(e) => {
										const target = e.currentTarget;
										if (target.src !== defualtAvatarUrl) {
											target.src = defualtAvatarUrl;
										}
									}}
								/>
								<input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden"></input>

								<div className="flex w-full items-center justify-center gap-2">
									<Button type="button" variant="outlineRound" onClick={handleEditImgClick}>
										Edit
									</Button>
									<Button type="button" variant="outlineRound" onClick={handleDeleteImgClick}>
										<TrashIcon width={15} height={15} />
									</Button>
								</div>
							</div>
						</SettingSegmentWrapper>
						{/* TODO: Add a password verify field */}
						<SettingSegmentWrapper title="Password" subtitle="Change your password">
							<Input
								id="password"
								value={formData.password}
								onChange={handleChange}
								errorMsg={errors.password}
								label="Password"
								type="password"
								placeholder="Enter your new password"
								className="w-1/2"
							/>
						</SettingSegmentWrapper>
						<SettingSegmentWrapper title="Body Metrics" subtitle="Add your body metrics to improve tracking accuracy">
							<Dropdown
								id="gender"
								label="Gender"
								input={true}
								value={formData.gender}
								onChange={handleChange}
								options={Object.values(GENDERS).map((gender) => ({
									key: gender.key,
									value: gender.label,
								}))}
								placeholder="Gender"
								className="w-full"
							/>
							<Input
								id="dateOfBirth"
								value={formData.dateOfBirth}
								onChange={handleChange}
								errorMsg={errors.dateOfBirth}
								label="Date of Birth"
								type="date"
								placeholder="Select your date of birth"
								className="w-full"
							/>
							<Input
								id="height"
								value={formData.height}
								onChange={handleChange}
								errorMsg={errors.heightCm}
								label={`Height (${lengthUnit})`}
								type="number"
								placeholder="Enter your height"
								className="w-full"
							/>
						</SettingSegmentWrapper>
					</>
				);
			case "Preferences":
				return (
					<>
						<SettingSegmentWrapper title="Theme" subtitle="Choose apreffered theme for the app">
							<ColorPicker value={formData.theme} onChange={handleColorPickerChange} predefinedColors={defaultThemeColors} />
						</SettingSegmentWrapper>
						<SettingSegmentWrapper title="Units" subtitle="Select your preferred units for weight and height">
							<Dropdown
								id="unitPreference"
								label="Unit"
								value={formData.unitPreference}
								input={true}
								onChange={handleChange}
								options={Object.values(UNITS).map((unit) => ({
									key: unit.key,
									value: unit.key === UNITS.METRIC.key ? "Metric (kg, cm)" : "Imperial (lb, ft)",
								}))}
								className="w-50"
							/>
						</SettingSegmentWrapper>
						<SettingSegmentWrapper title="Dates" subtitle="Set your preferences for week start and calendar alignment">
							<Dropdown
								id="weekStartsOn"
								label="Week Starts On"
								value={formData.weekStartsOn}
								input={true}
								onChange={handleChange}
								options={[
									{
										key: "0",
										value: "Sunday",
									},
									{
										key: "1",
										value: "Monday",
									},
								]}
								className="w-50"
							/>
							<Dropdown
								id="alignToCalendar"
								label="Align To Calender"
								value={formData.alignToCalendar}
								input={true}
								onChange={handleChange}
								options={[
									{
										key: "true",
										value: "True",
									},
									{
										key: "false",
										value: "False",
									},
								]}
								className="w-50"
							/>
						</SettingSegmentWrapper>
					</>
				);
			case "Goals":
				return (
					<>
						<SettingSegmentWrapper title="Weight Goal" subtitle="Set your weight goal to track progress">
							<div className="flex w-full flex-col gap-6">
								<Input
									id="startWeight"
									value={formData.startWeight}
									onChange={handleChange}
									errorMsg={errors.startWeightKg}
									label={`Starting Weight (${weightUnit})`}
									type="number"
									placeholder="Enter your starting weight"
									className="w-full"
									required
								/>
								<Input
									id="targetWeight"
									value={formData.targetWeight}
									onChange={handleChange}
									errorMsg={errors.targetWeightKg}
									label={`Target Weight (${weightUnit})`}
									type="number"
									placeholder="Enter your target weight"
									className="w-full"
									required
								/>
							</div>
							<div className="flex w-full flex-col gap-6">
								<Input
									id="startDate"
									value={formData.startDate}
									onChange={handleChange}
									errorMsg={errors.startDate}
									label="Starting Date"
									type="date"
									placeholder="Select your starting date"
									className="w-full"
									required
								/>
								<Input
									id="targetDate"
									value={formData.targetDate}
									onChange={handleChange}
									errorMsg={errors.targetDate}
									label="Target Date"
									type="date"
									placeholder="Select your target date"
									className="w-full"
									required
								/>
							</div>
						</SettingSegmentWrapper>
					</>
				);

			default:
				return (
					<div className="flex h-64 items-center justify-center">
						<p className="text-grey">Content for {activeTab} coming soon...</p>
					</div>
				);
		}
	};

	return (
		<>
			<div className="mb-6 flex flex-col gap-4">
				<h1 className="text-xl">Settings</h1>
				<p className="text-m">Manage your account settings and preferences</p>
			</div>

			{/* Custom Segmented Control */}
			<div className="mb-12 flex gap-2 rounded-lg">
				{tabs.map((tab) => (
					<Button key={tab} variant="rounded" onClick={() => setActiveTab(tab)} className={`${activeTab !== tab ? "text-primary bg-secondary/30" : ""}`}>
						{tab}
					</Button>
				))}
			</div>

			<form className="flex flex-col gap-6" onSubmit={handleSubmit}>
				{/* Content Area */}
				{renderTabContent()}

				{/* Action Buttons */}
				<div className="flex justify-end gap-4">
					<Button variant="outline" onClick={handleCancel}>
						Cancel
					</Button>
					<Button variant="success" disabled={isSubmitting}>
						{isSubmitting ? "Saving..." : "Save"}
					</Button>
				</div>
			</form>
		</>
	);
};

export default Settings;
