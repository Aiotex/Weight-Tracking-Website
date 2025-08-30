import React, { useMemo } from "react";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler, TimeScale } from "chart.js";
import annotationPlugin from "chartjs-plugin-annotation";
import { Line } from "react-chartjs-2";
import { type Period } from "../utils/period";
import type { WeightUnit } from "../types";
import { convertFromKg } from "../utils/weightUtils";
import { getChartLabelFormat } from "../utils/graphUtils";
import type { GraphDataPoint } from "../utils/graphUtils";
import type { AveragePeriodKey } from "../utils/averages";
import "chartjs-adapter-date-fns";

// Custom plugin to draw vertical line on hover
const verticalLinePlugin = {
	id: "verticalLine",
	beforeDraw: (chart: any) => {
		if (chart.tooltip && chart.tooltip._active && chart.tooltip._active.length) {
			const ctx = chart.ctx;
			const activePoint = chart.tooltip._active[0];
			const x = activePoint.element.x;
			const y = activePoint.element.y;
			const bottomY = chart.scales.y.bottom;
			const primaryColor = chart.data.datasets[0].borderColor;
			const lineWidth = 2;

			ctx.save();
			ctx.beginPath();
			ctx.moveTo(x, y);
			ctx.lineTo(x, bottomY);
			ctx.lineWidth = lineWidth;
			ctx.strokeStyle = primaryColor;
			ctx.stroke();
			ctx.restore();
		}
	},
};

// Utility function to get computed color from a class
const getComputedColor = (className: string, property: "backgroundColor" | "color" = "backgroundColor") => {
	const tempDiv = document.createElement("div");
	tempDiv.className = className;
	tempDiv.style.position = "absolute";
	tempDiv.style.visibility = "hidden";
	document.body.appendChild(tempDiv);
	const color = getComputedStyle(tempDiv)[property];
	document.body.removeChild(tempDiv);
	return color;
};

// Register Chart.js components and custom plugin
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler, TimeScale, annotationPlugin, verticalLinePlugin);

interface GraphProps {
	weightData: GraphDataPoint[];
	period: Period;
	unit: WeightUnit;
	averagePeriod?: AveragePeriodKey;
	className?: string;
	width?: number | string;
	height?: number | string;
	callback?: (selectedDate: Date) => void;
}

const Graph: React.FC<GraphProps> = React.memo(({ weightData, period, unit, averagePeriod = "none", className = "", width = "100%", height = "100%", callback }) => {
	const colors = useMemo(
		() => ({
			primaryColor: getComputedColor("bg-primary"),
			textPrimaryColor: getComputedColor("text-primary", "color"),
			textGreyColor: getComputedColor("text-grey", "color"),
			backgroundColorValue: getComputedColor("bg-background"),
		}),
		[getComputedColor],
	);

	const displayHorizontalLine = // Check if we should display a horizontal line for single data points
		weightData.length === 1 &&
		((period.key === "month" && averagePeriod === "monthly") ||
			(period.key === "week" && averagePeriod === "weekly") ||
			(period.key === "year" && averagePeriod === "yearly"));

	const points = useMemo(() => {
		if (displayHorizontalLine) {
			// For horizontal lines, we'll use annotation plugin instead of data points
			return [];
		}

		return weightData.map((entry) => {
			const value = entry?.value ?? 0;
			const date = entry?.date ? new Date(entry.date) : new Date();

			return {
				x: date.setHours(0, 0, 0, 0),
				y: unit === "lb" ? convertFromKg(value, true, 1) : parseFloat(value.toFixed(1)),
				label: entry?.label,
				notes: entry?.notes,
				hidden: false,
			};
		});
	}, [weightData, unit, period, displayHorizontalLine]);

	const data = useMemo(() => {
		return {
			datasets: [
				{
					label: "Weight",
					data: points,
					borderColor: colors.primaryColor,
					backgroundColor: colors.primaryColor.replace("rgb", "rgba").replace(")", ", 0.1)"),
					fill: true,
					tension: 0,
					pointBackgroundColor: colors.primaryColor,
					pointBorderColor: colors.primaryColor,
					pointBorderWidth: 0,
					pointRadius: 4,
					pointHoverRadius: 4,
					pointHitRadius: 10,
					borderWidth: 2,
				},
			],
		};
	}, [points, colors.primaryColor, weightData.length, period.key, averagePeriod]);

	const horizontalGridLines = 4;

	const options = useMemo(
		() => ({
			responsive: true,
			maintainAspectRatio: false,
			animation: {
				duration: 500,
			},
			interaction: {
				mode: "index" as const,
				intersect: false,
			},
			onClick: (_event: any, activeElements: any) => {
				if (activeElements.length > 0) {
					const dataPoint = activeElements[0];
					const date = new Date(dataPoint.element.$context.parsed.x);
					const weight = dataPoint.element.$context.parsed.y;

					// Find the weight entry for additional data
					const weightEntry = weightData.find((w) => {
						const weightDate = new Date(w.date);
						return weightDate.getTime() === date.getTime();
					});

					callback?.(date);

					console.log("Clicked point:", {
						date: date.toLocaleDateString("en-US", {
							weekday: "short",
							year: "numeric",
							month: "short",
							day: "numeric",
						}),
						weight: `${weight}`,
						notes: weightEntry?.notes || "No notes",
						rawDate: date,
						dataIndex: dataPoint.index,
					});
				}
			},
			plugins: {
				legend: {
					display: false,
				},
				annotation: displayHorizontalLine
					? {
							annotations: {
								horizontalLine: {
									type: "line" as const,
									yMin: unit === "lb" ? convertFromKg(weightData[0]?.value ?? 0, true, 1) : parseFloat((weightData[0]?.value ?? 0).toFixed(1)),
									yMax: unit === "lb" ? convertFromKg(weightData[0]?.value ?? 0, true, 1) : parseFloat((weightData[0]?.value ?? 0).toFixed(1)),
									borderColor: colors.primaryColor,
									borderWidth: 3,
									label: {
										display: true,
										position: "start" as const,
										backgroundColor: colors.primaryColor,
										color: colors.backgroundColorValue,
										content: `Weight: ${weightData[0].value} ${unit} (avg)`,
										padding: 8,
										font: {
											size: 12,
											weight: "bold" as const,
											family: "Poppins",
										},
									},
								},
							},
						}
					: undefined,
				tooltip: {
					// filter: function (tooltipItem: any) {
					// 	// Hide tooltip for hidden points
					// 	const dataPoint = tooltipItem.dataset.data[tooltipItem.dataIndex];
					// 	return !(dataPoint == null);
					// },
					backgroundColor: colors.backgroundColorValue,
					titleColor: colors.textPrimaryColor,
					bodyColor: colors.textPrimaryColor,
					borderColor: colors.primaryColor,
					borderWidth: 2,
					cornerRadius: 8,
					padding: 12,
					displayColors: false,
					titleFont: {
						size: 14,
						weight: "bold" as const,
					},
					bodyFont: {
						size: 12,
					},
					position: "nearest" as const,
					yAlign: "bottom" as const,
					// Remove animation: { duration: 0 } to allow smooth transitions
					callbacks: {
						title: function (context: any) {
							const dataPoint = context[0].dataset.data[context[0].dataIndex];
							return dataPoint?.label;
						},
						label: function (context: any) {
							const suffix = averagePeriod !== "none" ? " (avg)" : "";
							return `Weight: ${context.parsed.y} ${unit}${suffix}`;
						},
						afterLabel: function (context: any) {
							const dataPoint = context.dataset.data[context.dataIndex];
							return dataPoint?.notes;
						},
					},
				},
			},
			scales: {
				x: {
					type: "time" as const,
					distribution: "linear",
					max: period.range && period.range.end.setHours(0, 0, 0, 0),
					min: period.range && period.range.start.setHours(0, 0, 0, 0),
					time: (() => {
						const chartFormat = getChartLabelFormat(period.key);
						return {
							unit: chartFormat.unit,
						};
					})(),
					grid: {
						display: false,
					},
					ticks: {
						display: true,
						color: colors.textPrimaryColor,
						font: {
							size: 14,
							weight: 600,
							family: "Poppins",
						},
						padding: 24,
						callback: function (value: any) {
							const date = new Date(value);

							// Fallback to period-based formatting
							switch (period.key) {
								case "week":
									return date.toLocaleDateString("en-US", { weekday: "short" });
								case "month": {
									const startTime = period.range ? period.range.start.getTime() : new Date().getTime();
									const endTime = period.range ? period.range.end.getTime() : new Date().getTime();
									const totalDuration = endTime - startTime;
									const step = totalDuration / 3;

									const labelTimes = [startTime, startTime + step, startTime + step * 2, endTime];
									const currentTime = date.getTime();

									const tolerance = 12 * 60 * 60 * 1000;
									const isLabelDate = labelTimes.some((labelTime) => Math.abs(currentTime - labelTime) <= tolerance);

									if (isLabelDate) {
										return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
									}
									return;
								}
								default:
									if (date.getDate() === 1) {
										return date.toLocaleDateString("en-US", { month: "short" });
									}
							}
						},
					},
				},
				y: {
					grid: {
						display: true,
						color: colors.textGreyColor,
						drawOnChartArea: true,
						drawTicks: false,
					},
					ticks: {
						display: true,
						color: colors.textPrimaryColor,
						font: {
							size: 14,
							weight: 600,
							family: "Poppins",
						},
						padding: 24,
						maxTicksLimit: horizontalGridLines,
					},
				},
			},
			elements: {
				point: {
					hoverBorderWidth: 3,
				},
			},
		}),
		[colors, period, unit, weightData, averagePeriod, points],
	);

	const containerStyle: React.CSSProperties = useMemo(
		() => ({
			width: typeof width === "string" ? width : `${width}px`,
			height: typeof height === "string" ? height : `${height}px`,
		}),
		[width, height],
	);

	if (weightData.length === 0) {
		return (
			<div className={`border-secondary flex h-full w-full items-center justify-center rounded-lg border ${className}`}>
				<p className="text-grey text-s">No data available</p>
			</div>
		);
	}

	return (
		<div className="relative cursor-pointer" style={containerStyle}>
			<Line data={data} options={options} redraw={true} />
		</div>
	);
});

export default Graph;
