import React, { useState, useEffect, useCallback } from "react";
import { Button } from "./buttons";
import { Input } from "./inputs";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import useUserPreferences from "../hooks/useUserPreferences";
import type { WeightEntry, WeightUnit } from "../types";
import { UNITS } from "../constants";
import { mapErrors } from "../utils/errorsUtils";
import { formatDateForInput } from "../utils/dateUtils";
import { convertToKg, convertFromKg } from "../utils/weightUtils";
import { toast } from "react-toastify";
import { CloseIcon } from "./icons";

interface NewEntryFormProps {
	isOpen: boolean;
	onClose: () => void;
	onSuccess?: () => void;
	editDate?: Date; // If provided, fetch and edit existing entry for this date
}

interface EntryFormData {
	weight?: string;
	date?: string;
	notes?: string;
}

const EntryForm: React.FC<NewEntryFormProps> = ({ isOpen, onClose, onSuccess, editDate }) => {
	const { preferences } = useUserPreferences();
	const axiosPrivate = useAxiosPrivate();

	const [formData, setFormData] = useState<EntryFormData>();
	const [errors, setErrors] = useState<Record<string, string>>({});
	const [isLoading, setIsLoading] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const isImperial = preferences.unit === UNITS.IMPERIAL.key;
	const weightUnit: WeightUnit = isImperial ? "lb" : "kg";
	const controller = new AbortController();

	// Fetch existing entry if provided
	const fetchExistingEntry = useCallback(async () => {
		try {
			setIsLoading(true);

			const editDateStr = editDate && formatDateForInput(editDate);
			const response = await axiosPrivate.get(`/weights/date/${editDateStr}`, { signal: controller.signal });
			const entry: WeightEntry = response.data;

			setFormData({
				weight: convertFromKg(entry.weightKg, isImperial, 1).toString(),
				date: entry.date,
				notes: entry.notes,
			});
		} catch (err) {
			console.error("Error fetching existing entry:", err);
			toast.error("Failed to fetch existing entry");
			// TODO: fix overview page rendering twice creating mutiple toasts
			// somthing with one of the state changes in the fetch data hook
		} finally {
			setIsLoading(false);
		}
	}, [editDate, axiosPrivate]);

	// Fetch latest weight entry
	const fetchLatestEntry = useCallback(async () => {
		const controller = new AbortController();
		try {
			setIsLoading(true);

			const response = await axiosPrivate.get("/weights/latest", { signal: controller.signal });
			const entry: WeightEntry = response.data;

			setFormData({
				weight: convertFromKg(entry.weightKg, isImperial, 1).toString(),
				date: formatDateForInput(new Date()),
				notes: undefined,
			});
		} catch (err) {
			console.error("Error fetching latest entry:", err);
			setFormData({
				weight: undefined,
				date: formatDateForInput(new Date()),
				notes: undefined,
			});
		} finally {
			setIsLoading(false);
		}
	}, [axiosPrivate]);

	// Reset form when modal opens/closes or editDate changes
	useEffect(() => {
		if (isOpen) {
			if (editDate) {
				fetchExistingEntry(); // Populate form with existing entry data
			} else {
				fetchLatestEntry(); // Populate only weight with latest entry for better ux
			}
			setErrors({});
		}
	}, [isOpen, editDate, fetchExistingEntry, fetchLatestEntry]);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));

		// Clear error when user starts typing
		if (errors[name]) {
			setErrors((prev) => {
				const { [name]: _, ...rest } = prev;
				return rest;
			});
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsSubmitting(true);

		const weight = formData?.weight && parseFloat(formData?.weight);
		const weightKg = weight ? convertToKg(weight, isImperial) : undefined;
		const date = formData?.date;
		const notes = formData?.notes;

		const payload = {
			...(weightKg && { weightKg }),
			...(date && { date }),
			...(notes && { notes }),
		};

		try {
			await axiosPrivate.post("/weights", payload);
			toast.success("Logged new weight entry");
			onSuccess?.();
			onClose();
		} catch (err: any) {
			console.error("Error saving entry:", err);
			setErrors(mapErrors(err.response?.data?.error?.details));
		} finally {
			setIsSubmitting(false);
		}
	};

	// Clean up and run the onClose callback
	const handleClose = () => {
		controller.abort(); // Abort any ongoing requests
		setIsSubmitting(false);
		onClose();
	};

	const handleBackdropClick = (e: React.MouseEvent) => {
		if (e.target === e.currentTarget) {
			handleClose();
		}
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(0,0,0,0.5)]" onClick={handleBackdropClick}>
			<form
				onSubmit={handleSubmit}
				className="text-s text-primary border-secondary bg-background absolute top-1/2 left-1/2 flex w-135 -translate-x-1/2 -translate-y-1/2 transform flex-col gap-10 rounded-4xl border px-12 py-18 shadow-lg"
			>
				{/* Header */}
				<div className="mb-6 flex items-center justify-between">
					<h2 className="text-primary text-xl">Weight Entry</h2>
					<button onClick={handleClose} className="text-primary cursor-pointer hover:text-[rgba(255,255,255,0.6)]">
						<CloseIcon width={32} height={32} />
					</button>
				</div>

				{isLoading ? ( // TODO: better styling for loading state
					<div className="flex items-center justify-center py-8">
						<div className="text-primary text-m">Loading...</div>
					</div>
				) : (
					<>
						{errors.general && <div className="text-red text-sm">{errors.general}</div>}

						<Input
							id="weight"
							label={`Weight (${weightUnit})`}
							type="number"
							step="0.1"
							min="0"
							placeholder={`Enter weight in ${weightUnit}`}
							prefix={weightUnit}
							value={formData?.weight}
							onChange={handleChange}
							errorMsg={errors.weightKg}
							required
						/>

						<Input id="date" label="Date" type="date" value={formData?.date} onChange={handleChange} errorMsg={errors.date} required />

						<Input
							id="notes"
							label="Notes (optional)"
							type="textarea"
							placeholder="Add any notes about this entry"
							value={formData?.notes}
							onChange={handleChange}
							errorMsg={errors.notes}
							maxLength={255}
							disabled={isSubmitting}
						/>

						{/* Action Buttons */}
						<div className="flex gap-3 pt-4">
							<Button type="submit" disabled={isSubmitting} className="flex-1">
								{isSubmitting ? "Saving..." : "Submit"}
							</Button>
							<Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting} className="flex-1">
								Cancel
							</Button>
						</div>
					</>
				)}
			</form>
		</div>
	);
};

export default EntryForm;
