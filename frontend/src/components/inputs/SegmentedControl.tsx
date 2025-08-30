import React from "react";

export interface SegmentedControlOption {
	key: string;
	value: string;
	disabled?: boolean;
}

interface SegmentedControlProps {
	options: SegmentedControlOption[];
	selectedKey: string;
	onChange: (key: string) => void;
	className?: string;
	disabled?: boolean;
}

const SegmentedControl: React.FC<SegmentedControlProps> = ({ options, selectedKey, onChange, className = "", disabled = false }) => {
	const handleOptionClick = (key: string, optionDisabled?: boolean) => {
		if (!disabled && !optionDisabled) {
			onChange(key);
		}
	};

	return (
		<div
			className={`border-secondary text-m inline-flex h-10 rounded-full border-1 bg-[rgba(255,255,255,0.03)] p-1 ${disabled ? "cursor-not-allowed opacity-50" : ""} ${className}`}
		>
			{options.map((option) => {
				const isSelected = option.key === selectedKey;
				const isOptionDisabled = disabled || option.disabled;

				return (
					<button
						key={option.key}
						type="button"
						onClick={() => handleOptionClick(option.key, option.disabled)}
						disabled={isOptionDisabled}
						className={`flex flex-grow-1 items-center justify-center rounded-full p-1 transition-all duration-150 ease-in-out ${
							isSelected ? "bg-primary text-background" : "text-primary hover:bg-primary hover:text-accent"
						} ${isOptionDisabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"} ${!isSelected && !isOptionDisabled ? "" : ""}`}
					>
						{option.value}
					</button>
				);
			})}
		</div>
	);
};

export default SegmentedControl;
