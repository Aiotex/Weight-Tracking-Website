// TODO: remove this whole file

import type { Period } from "./period.types";

export function getChartLabels(period: Period): string[] {
	const key = period.key;
	const { start, end } = period.range ? period.range : { start: new Date(), end: new Date() };
	const labels: string[] = [];

	switch (key) {
		case "week": {
			// Daily labels for a week
			const current = new Date(start);
			while (current <= end) {
				labels.push(current.toLocaleDateString("en-US", { weekday: "short" }));
				current.setDate(current.getDate() + 1);
			}
			break;
		}
		case "month": {
			// Weekly labels for a month
			const current = new Date(start);

			while (current <= end) {
				labels.push(`Week ${Math.ceil(current.getDate() / 7)}`);
				current.setDate(current.getDate() + 7);
			}

			break;
		}
		case "quarter": {
			// Monthly labels for a quarter
			const current = new Date(start);
			while (current <= end) {
				labels.push(current.toLocaleDateString("en-US", { month: "short" }));
				current.setMonth(current.getMonth() + 1);
			}
			break;
		}
		case "halfyear": {
			// Monthly labels for half year
			const current = new Date(start);
			while (current <= end) {
				labels.push(current.toLocaleDateString("en-US", { month: "short" }));
				current.setMonth(current.getMonth() + 1);
			}
			break;
		}
		case "year": {
			// Monthly labels for a year
			const current = new Date(start);
			while (current <= end) {
				labels.push(current.toLocaleDateString("en-US", { month: "short" }));
				current.setMonth(current.getMonth() + 1);
			}
			break;
		}
	}

	return labels;
}
