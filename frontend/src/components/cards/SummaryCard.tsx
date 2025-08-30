import React from "react";
import CardWrapper from "./CardWrapper";
import { GraphArrowIcon } from "../icons";
import { type WeightUnit } from "../../types";
import { convertFromKg } from "../../utils/weightUtils";

export type SummaryCardProps = {
	title: string;
	initialValue: number | undefined;
	currentValue: number | undefined;
	targetValue: number | undefined;
	unit?: WeightUnit;
	percentageDiff?: boolean;
	displayDiff?: boolean;
	subtitle?: string;
	className?: string;
	error?: string;
	loading?: boolean;
};

const SummaryCard: React.FC<SummaryCardProps> = ({
	title,
	initialValue,
	currentValue,
	targetValue,
	unit,
	percentageDiff,
	displayDiff = true,
	subtitle,
	className = "",
	error,
	loading = false,
}) => {
	let valueChange: number | undefined;
	let reverseColorLogic: boolean = false;

	if (unit === "lb") {
		// Assuming the values provided are all in kg
		initialValue = initialValue && convertFromKg(initialValue, true);
		currentValue = currentValue && convertFromKg(currentValue, true);
		targetValue = targetValue && convertFromKg(targetValue, true);
	}

	if ((initialValue || initialValue === 0) && (currentValue || currentValue === 0) && (targetValue || targetValue === 0)) {
		valueChange = currentValue - initialValue;
		reverseColorLogic = targetValue < initialValue;
	}

	const getChangeIcon = () => {
		if (!valueChange || valueChange === 0 || !displayDiff) return;

		if (valueChange > 0 || valueChange === 0) {
			return <GraphArrowIcon direction="increase" reverseColor={reverseColorLogic} />;
		} else {
			return <GraphArrowIcon direction="decrease" reverseColor={reverseColorLogic} />;
		}
	};

	const getChangeColor = () => {
		if (!valueChange || valueChange === 0 || !displayDiff) return "text-grey";

		if (valueChange > 0 || valueChange === 0) {
			return reverseColorLogic ? "text-red" : "text-green";
		} else {
			return reverseColorLogic ? "text-green" : "text-red";
		}
	};

	if (error) {
		return <div className="text-s text-grey">{error}</div>;
	}

	return (
		<CardWrapper className={className} loading={loading}>
			<h3 className="text-s">{title}</h3>

			<div className="text-l flex items-center">
				{currentValue || currentValue === 0 ? (
					<>
						<span>{parseFloat(currentValue.toFixed(1))}</span>
						{targetValue ? (
							<>
								<span className="text-grey mx-1">/</span>
								<span className="text-grey">{parseFloat(targetValue.toFixed(1))}</span>
								{unit && <span className="text-grey ml-1">{unit}</span>}
								<span className="ml-2">{getChangeIcon()}</span>
							</>
						) : (
							unit && <span className="ml-1">{unit}</span>
						)}
					</>
				) : (
					<span className="text-grey">No data available</span>
				)}
			</div>

			<span className={`text-s flex gap-1 ${getChangeColor()}`}>
				{(valueChange || valueChange === 0) && unit && displayDiff && (
					<>
						<span>{valueChange > 0 ? "+" : valueChange < 0 ? "-" : ""}</span>
						{percentageDiff && (currentValue || currentValue === 0) && (targetValue || targetValue === 0) ? (
							<>
								<span>{Math.abs(parseFloat(((currentValue / (targetValue || 1)) * 100).toFixed(1)))}</span>
								<span>%</span>
							</>
						) : (
							<>
								<span>{Math.abs(parseFloat(valueChange.toFixed(1)))}</span>
								<span>{unit}</span>
							</>
						)}
					</>
				)}

				{(valueChange || valueChange === 0) && !unit && displayDiff && (
					<>
						{percentageDiff && (currentValue || currentValue === 0) && (targetValue || targetValue === 0) ? (
							<>
								<span>{Math.abs(parseFloat(((currentValue / (targetValue || 1)) * 100).toFixed(1)))}</span>
								<span>%</span>
							</>
						) : (
							<>
								<span>{Math.abs(parseFloat(valueChange.toFixed(1)))}</span>
								<span>{valueChange > 0 ? "more" : valueChange < 0 ? "less" : ""}</span>
							</>
						)}
					</>
				)}

				{subtitle && <span className="text-grey">{subtitle}</span>}
			</span>
		</CardWrapper>
	);
};

export default SummaryCard;
