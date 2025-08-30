import React, { useState, useEffect, useCallback, useMemo } from "react";

import useAxiosPrivate from "../hooks/useAxiosPrivate";

import { createPeriod, getAvailablePeriods, getPeriodLabel, getDaysInRange, calculatePeriodGoal } from "../utils/period";
import type { Period, PeriodKey, PeriodRange } from "../utils/period";

import { Dropdown } from "../components/inputs";
import type { DropdownOption } from "../components/inputs/Dropdown";
import { SummaryCard, CardWrapper } from "../components/cards";
import Graph from "../components/Graph";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import type { Goal, WeightEntry, WeightUnit } from "../types";
import { UNITS } from "../constants";
import useUserPreferences from "../hooks/useUserPreferences";
import EntryForm from "../components/EntryForm";
import { formatDateForInput } from "../utils/dateUtils";
import { convertFromKg } from "../utils/weightUtils";
import { toast } from "react-toastify";
import { transformToGraphData } from "../utils/graphUtils";

const Overview: React.FC = React.memo(() => {
	const axiosPrivate = useAxiosPrivate();
	const { preferences } = useUserPreferences();
	// preferences.alignToCalendar = true; // TODO: Should always be true

	const [selectedPeriod, setSelectedPeriod] = useState<PeriodKey>(preferences.defaultSelectedPeriod);
	const [goal, setGoal] = useState<Goal | undefined>(undefined);
	const [weightEntries, setWeightEntries] = useState<WeightEntry[]>([]);
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

	const dropdownOptions: DropdownOption[] = useMemo(
		() =>
			getAvailablePeriods().map((key) => {
				return {
					key,
					value: getPeriodLabel(key, preferences.alignToCalendar).long,
				};
			}),
		[preferences.alignToCalendar],
	);

	const graphData = useMemo(() => transformToGraphData(weightEntries, "none", preferences.weekStartsOn), [weightEntries]);

	const goalProgress = useMemo(() => {
		if (!goal || !currentWeight) return null;

		const goalPercentage = parseFloat((((currentWeight - goal.startWeightKg) / (goal.targetWeightKg - goal.startWeightKg)) * 100).toFixed(1));
		const clampedPercentage = Math.max(0, Math.min(100, goalPercentage));

		return { goalPercentage, clampedPercentage };
	}, [goal, currentWeight]);

	// Summary card data
	const { targetWeight, periodfirstEntry, periodWeightGoal, periodWeightChange } = useMemo(() => {
		const targetWeight = goal?.targetWeightKg;
		const periodfirstEntry = weightEntries[0]?.weightKg; // TODO: should be the first entry before the period starts
		const periodWeightGoal = goal && periodfirstEntry ? calculatePeriodGoal(goal, period, periodfirstEntry) : undefined;
		const periodWeightChange = periodfirstEntry && currentWeight && Math.abs(currentWeight - periodfirstEntry);

		console.log("Period Summary Data:", {
			targetWeight,
			periodfirstEntry,
			periodWeightGoal,
			periodWeightChange,
		});

		return {
			targetWeight,
			periodfirstEntry,
			periodWeightGoal,
			periodWeightChange,
		};
	}, [goal, weightEntries, period]);

	// Fetch data from the API
	const fetchData = useCallback(async () => {
		let weightEntriesUrl = "/weights";

		if (period.range) {
			const startDateStr = formatDateForInput(period.range.start);
			const todayDateStr = formatDateForInput(period.range.today);
			weightEntriesUrl += `?start_date=${startDateStr}&end_date=${todayDateStr}`;
		}

		try {
			setLoading(true);

			const [goalResponse, weightsResponse, latestWeightResponse] = await Promise.all([
				axiosPrivate.get("/goals"),
				axiosPrivate.get(weightEntriesUrl),
				axiosPrivate.get("/weights/latest"),
			]);

			if (period.key === "all" || !period.range) {
				// For "all" period, we set the range to cover all data
				const range: PeriodRange = { start: new Date(weightsResponse.data[0].date), end: new Date(), today: new Date() };
				period.range = range;
				period.daysRolling = getDaysInRange(range);
			}

			setGoal(goalResponse.data);
			setWeightEntries(weightsResponse.data);
			setCurrentWeight(latestWeightResponse.data.weightKg);
		} catch (err) {
			console.error("Error fetching data:", err);
			toast.error("Failed to fetch data");
		} finally {
			setLoading(false);
		}
	}, [axiosPrivate, period]);

	const entryClickCallback = (selectedDate: Date) => {
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
			<EntryForm isOpen={popupOpen} editDate={editDate} onClose={() => setPopupOpen(false)} onSuccess={fetchData} />
			<div className="flex items-center justify-between">
				<h1 className="text-xl">Overview</h1>
				{loading ? (
					<Skeleton width={200} height={40} />
				) : (
					<Dropdown
						className="w-50"
						options={dropdownOptions}
						value={selectedPeriod}
						placeholder="Select time period"
						onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
							setSelectedPeriod(e?.target?.value as PeriodKey);
						}}
					/>
				)}
			</div>

			<div className="mt-12 flex h-screen flex-col gap-8">
				{/* This period summary */}
				<section>
					{loading ? <Skeleton width={200} height={14} className="mb-4" /> : <h2 className="text-m mb-4">{period.label.long} Summary</h2>}
					<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
						<SummaryCard
							title="Current Weight"
							initialValue={periodfirstEntry}
							currentValue={currentWeight}
							targetValue={targetWeight}
							unit={weightUnit}
							loading={loading}
						/>
						{/* TODO: measure success by the initial and target weight of the user goal */}

						<SummaryCard
							title={`This Period Goal`}
							initialValue={0}
							currentValue={periodWeightChange}
							targetValue={periodWeightGoal}
							unit={weightUnit}
							subtitle={periodWeightGoal ? "of your goal" : ""}
							percentageDiff={true}
							loading={loading}
						/>

						<SummaryCard
							title={`Number Of Entries`}
							initialValue={0}
							currentValue={weightEntries.length || 0}
							targetValue={period.daysRolling}
							subtitle={"consistency"}
							percentageDiff={true}
							loading={loading}
						/>
						{/* TODO: add more card / redesign */}
					</div>
				</section>

				{/* Weight graph */}
				<section className="flex h-full flex-col">
					{loading ? <Skeleton width={200} height={14} className="mb-4" /> : <h2 className="text-m mb-4">{period.label.long} Weight Graph</h2>}

					<CardWrapper className="h-full min-h-120 min-w-175" loading={loading}>
						<span>{period.label.long} Weight Graph</span>
						{currentWeight && currentWeight !== 0 && (
							<span className="flex gap-2 text-xl">
								<span>{convertFromKg(currentWeight, isImperial, 1)}</span>
								<span>{weightUnit}</span>
							</span>
						)}
						<span className="text-grey mb-8">
							{period?.range ? `${period.range.start.toLocaleDateString("en-GB")} - ${period.range.end.toLocaleDateString("en-GB")}` : period.label.long}
						</span>
						<Graph weightData={graphData} width="100%" height="100%" period={period} unit={weightUnit} callback={entryClickCallback} />
					</CardWrapper>
				</section>

				{/* Goal progress bar */}
				<section>
					{loading ? <Skeleton width={150} height={14} className="mb-4" /> : <h2 className="text-m mb-4">Goal Progress</h2>}

					{loading ? (
						<CardWrapper loading={loading} />
					) : goalProgress && currentWeight && goal ? (
						<CardWrapper className="gap-4">
							<div className="text-grey text-l flex items-center justify-between">
								<span className="flex items-center gap-1">
									<span className="text-primary">{convertFromKg(currentWeight, isImperial, 1)}</span>
									<span>/</span>
									<span>{convertFromKg(goal.targetWeightKg, isImperial, 1)}</span>
									<span className="ml-1">{weightUnit}</span>
								</span>
								<span className="text-primary font-semibold">{goalProgress.goalPercentage}%</span>
							</div>

							<div className="bg-secondary h-2 w-full overflow-hidden rounded-full">
								<div className="bg-primary h-full rounded-full" style={{ width: `${goalProgress.clampedPercentage}%` }}></div>
							</div>

							<div className="text-grey text-m flex items-center justify-between">
								<span>
									Start: {convertFromKg(goal.startWeightKg, isImperial, 1)} {weightUnit}
								</span>
								<span>
									Target: {convertFromKg(goal.targetWeightKg, isImperial, 1)} {weightUnit}
								</span>
							</div>
						</CardWrapper>
					) : (
						<CardWrapper className="flex items-center justify-center">
							<span className="text-grey">No goal set</span>
						</CardWrapper>
					)}
				</section>
			</div>
		</>
	);
});

export default Overview;
