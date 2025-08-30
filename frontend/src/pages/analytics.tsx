import React, { useState, useEffect, useCallback, useMemo } from "react";

import useAxiosPrivate from "../hooks/useAxiosPrivate";

import { createPeriod, getAvailablePeriods, getPeriodLabel, getDaysInRange } from "../utils/period";
import type { Period, PeriodKey, PeriodRange } from "../utils/period";
import { getAvailableAveragePeriods, getAveragePeriodLabel } from "../utils/averages";
import type { AveragePeriodKey } from "../utils/averages";
import { transformToGraphData } from "../utils/graphUtils";
import type { WeightEntry, AverageEntry } from "../types";

import { Dropdown, SegmentedControl } from "../components/inputs";
import type { SegmentedControlOption } from "../components/inputs/SegmentedControl";
import { CardWrapper } from "../components/cards";
import Graph from "../components/Graph";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import type { WeightUnit } from "../types";
import { UNITS } from "../constants";
import useUserPreferences from "../hooks/useUserPreferences";
import { convertFromKg } from "../utils/weightUtils";
import { formatDateForInput } from "../utils/dateUtils";
import { toast } from "react-toastify";
import type { DropdownOption } from "../components/inputs/Dropdown";
import { TrashIcon } from "../components/icons";
import EntryForm from "../components/EntryForm";

const Analytics: React.FC = () => {
	const { preferences } = useUserPreferences();
	// preferences.alignToCalendar = true; // TODO: Should always be true
	// preferences.weekStartsOn = 0; // TODO: Should always be 0

	const axiosPrivate = useAxiosPrivate();

	const [selectedPeriod, setSelectedPeriod] = useState<PeriodKey>(preferences.defaultSelectedPeriod);
	const [selectedAveragePeriod, setSelectedAveragePeriod] = useState<AveragePeriodKey>("none");
	const [rawData, setRawData] = useState<WeightEntry[] | AverageEntry[]>([]);
	const [currentWeight, setCurrentWeight] = useState<number | undefined>(undefined);
	const [loading, setLoading] = useState<boolean>(true);
	const [popupOpen, setPopupOpen] = useState<boolean>(false);
	const [editDate, setEditDate] = useState<Date | undefined>(undefined);

	const isImperial = preferences.unit === UNITS.IMPERIAL.key;
	const weightUnit: WeightUnit = isImperial ? "lb" : "kg";

	const period: Period = useMemo(
		() =>
			createPeriod(selectedPeriod, {
				today: new Date(),
				alignToCalendar: preferences.alignToCalendar,
				weekStartsOn: preferences.weekStartsOn,
			}),
		[selectedPeriod, preferences.alignToCalendar, preferences.weekStartsOn],
	);

	const segmentedControlOptions: SegmentedControlOption[] = useMemo(
		() =>
			getAvailablePeriods().map((key) => {
				return { key, value: getPeriodLabel(key, preferences.alignToCalendar).short };
			}),
		[preferences.alignToCalendar],
	);

	const dropdownOptions: DropdownOption[] = useMemo(
		() =>
			getAvailableAveragePeriods().map((key) => {
				return { key, value: getAveragePeriodLabel(key) };
			}),
		[],
	);

	const graphData = useMemo(() => {
		return transformToGraphData(rawData, selectedAveragePeriod, preferences.weekStartsOn);
	}, [rawData, selectedAveragePeriod, preferences.weekStartsOn]);

	// Fetch data from the API
	const fetchData = useCallback(async () => {
		let weightEntriesUrl = "/weights";

		if (selectedAveragePeriod !== "none") {
			weightEntriesUrl += "/average";
		}

		try {
			setLoading(true);

			if (period.key === "all" || !period.range) {
				// For "all" period, we set the range to cover all data
				const earliestWeightResponse = await axiosPrivate.get("/weights/earliest");
				const earliestDate = earliestWeightResponse ? earliestWeightResponse.data.date : new Date();
				const range: PeriodRange = { start: new Date(earliestDate), end: new Date(), today: new Date() };
				period.range = range;
				period.daysRolling = getDaysInRange(range);
			}

			const startDateStr = formatDateForInput(period.range.start);
			const todayDateStr = formatDateForInput(period.range.today);

			if (selectedAveragePeriod === "none") {
				weightEntriesUrl += `/?start_date=${startDateStr}&end_date=${todayDateStr}`;
			} else {
				weightEntriesUrl += `/${selectedAveragePeriod}?start_date=${startDateStr}&end_date=${todayDateStr}&week_starts_on=${preferences.weekStartsOn}`;
			}

			const [weightsResponse, latestWeightResponse] = await Promise.all([axiosPrivate.get(weightEntriesUrl), axiosPrivate.get("/weights/latest")]);

			setRawData(weightsResponse.data);
			setCurrentWeight(latestWeightResponse.data.weightKg);
		} catch (err) {
			console.error("Error fetching data:", err);
			toast.error("Failed to fetch data");
		} finally {
			setLoading(false);
		}
	}, [axiosPrivate, period, selectedAveragePeriod]);

	const handleRowClick = (selectedDate: Date) => {
		if (popupOpen) {
			setPopupOpen(false);
			setEditDate(undefined);
		} else {
			setEditDate(selectedDate);
			setPopupOpen(true);
		}
	};

	useEffect(() => {
		fetchData();
	}, [fetchData]);

	return (
		<>
			<h1 className="text-xl">Analytics</h1>

			<EntryForm isOpen={popupOpen} editDate={editDate} onClose={() => setPopupOpen(false)} onSuccess={fetchData} />

			<div className="mt-12 flex h-screen flex-col gap-8">
				{/* Weight graph and segmented control */}
				{loading ? (
					<Skeleton width={"100%"} borderRadius={9999} height={40} />
				) : (
					<SegmentedControl options={segmentedControlOptions} selectedKey={selectedPeriod} onChange={(key) => setSelectedPeriod(key as PeriodKey)} />
				)}

				<div className="flex flex-col gap-4">
					<CardWrapper className="h-full min-h-120 min-w-175" loading={loading}>
						<div className="mb-8 flex items-center justify-between">
							<div className="flex flex-col gap-3">
								<span>{period.label.long} Weight Graph</span>
								{currentWeight && currentWeight !== 0 && (
									<span className="flex gap-2 text-xl">
										<span>{convertFromKg(currentWeight, isImperial, 1)}</span>
										<span>{weightUnit}</span>
									</span>
								)}
								<span className="text-grey">
									{period?.range ? `${period.range.start.toLocaleDateString("en-GB")} - ${period.range.end.toLocaleDateString("en-GB")}` : period.label.long}
								</span>
							</div>
							<Dropdown
								options={dropdownOptions}
								value={selectedAveragePeriod}
								className="w-50"
								onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
									setSelectedAveragePeriod(e?.target?.value as AveragePeriodKey);
								}}
							/>
						</div>

						<Graph weightData={graphData} width="100%" height="100%" period={period} unit={weightUnit} averagePeriod={selectedAveragePeriod} />
					</CardWrapper>

					{/* Entries data table */}
					{loading ? <Skeleton width={200} height={14} className="mt-4" /> : <h2 className="text-m mt-4">History</h2>}
					<CardWrapper className="relative h-100 min-h-100 min-w-175 overflow-auto" loading={loading}>
						{rawData.length === 0 ? (
							<div className="text-grey text-s absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">No weight entries available for this period</div>
						) : selectedAveragePeriod !== "none" ? (
							<div className="text-grey text-s absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">Entry details not available for average data</div>
						) : (
							<div className="flex flex-col gap-4">
								<div className="text-m flex items-center justify-between">
									<span className="text-m">Weight Entries</span>
									<span className="text-s text-grey">{rawData.length} Entries</span>
								</div>

								<div className="overflow-auto">
									<table className="w-full border-collapse">
										<thead>
											<tr className="bg-primary text-accent text-s h-10">
												<th className="rounded-tl-lg px-3 py-2 text-left">Date</th>
												<th className="px-3 py-2 text-left">Weight ({weightUnit})</th>
												<th className="px-3 py-2 text-left">Notes</th>
												<th className="w-16 rounded-tr-lg px-3 py-2 text-center">Actions</th>
											</tr>
										</thead>
										<tbody>
											{(rawData as WeightEntry[])
												.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
												.map((entry, index) => (
													<tr
														key={entry.id || index}
														className="border-secondary hover:bg-secondary/20 text-s h-12 cursor-pointer border-b transition-colors duration-100"
														title="Click to edit"
														onClick={() => handleRowClick(new Date(entry.date))}
													>
														<td className="px-3">{new Date(entry.date).toLocaleDateString("en-GB")}</td>
														<td className="px-3">{convertFromKg(entry.weightKg, isImperial, 1)}</td>
														<td className="max-w-xs truncate px-3">
															{entry.notes ? <span>{entry.notes}</span> : <span className="text-grey italic">No notes</span>}
														</td>
														<td className="px-3 text-center">
															<button
																onClick={async (e) => {
																	e.stopPropagation();

																	try {
																		setLoading(true);
																		const strDate = formatDateForInput(new Date(entry.date));
																		await axiosPrivate.delete(`/weights/date/${strDate}`);
																		toast.success(`Entry deleted successfully`);
																		fetchData();
																	} catch (error) {
																		console.error("Error deleting entry:", error);
																		toast.error("Failed to delete entry");
																	} finally {
																		setLoading(false);
																	}
																	console.log("Delete entry:", entry);
																}}
																className="text-grey hover:text-primary hover:bg-red cursor-pointer rounded p-1 transition duration-150"
																title="Delete entry"
															>
																<TrashIcon width={18} height={18} />
															</button>
														</td>
													</tr>
												))}
										</tbody>
									</table>
								</div>
							</div>
						)}
					</CardWrapper>
				</div>
			</div>
		</>
	);
};

export default Analytics;
