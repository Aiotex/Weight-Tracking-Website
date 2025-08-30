import React from "react";
import type { SVGProps } from "react";

type GraphArrowIconType = SVGProps<SVGSVGElement> & {
	direction: "increase" | "decrease";
	reverseColor?: boolean; // When true, increase = red, decrease = green
};

const GraphArrowIcon: React.FC<GraphArrowIconType> = ({ direction, reverseColor = false, ...rest }) => {
	const getColorClass = () => {
		if (reverseColor) {
			// Reverse logic: increase = red (bad), decrease = green (good)
			return direction === "increase" ? "text-red" : "text-green";
		} else {
			// Normal logic: increase = green (good), decrease = red (bad)
			return direction === "increase" ? "text-green" : "text-red";
		}
	};

	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={18}
			height={18}
			className={`${getColorClass()} ${direction === "increase" ? "scale-y-[-1] transform" : ""}`}
			viewBox={`0 0 14 14`}
			{...rest}
		>
			<path
				fill="currentColor"
				fillRule="evenodd"
				d="M1.137 1.32a.625.625 0 0 0-1.024.717l4.028 5.752a.625.625 0 0 0 .87.153l2.6-1.821l2.845 4.064l-1.652 1.218a.5.5 0 0 0 .206.894l3.74.695a.5.5 0 0 0 .584-.41l.66-3.939a.5.5 0 0 0-.79-.485l-1.741 1.284l-3.187-4.55a.625.625 0 0 0-.871-.154L4.806 6.56z"
				clipRule="evenodd"
			></path>
		</svg>
	);
};

export default GraphArrowIcon;
