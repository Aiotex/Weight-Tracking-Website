import React from "react";

export interface RadioOption {
	value: string;
	label: string;
}

interface RadioInputProps {
	name: string;
	value?: string;
	options: RadioOption[];
	onChange?: (value: string) => void;
	className?: string;
	label?: string;
	error?: string;
	direction?: "horizontal" | "vertical";
}

export const RadioInput: React.FC<RadioInputProps> = ({ name, value = "", options, onChange, className = "", label, error, direction = "vertical" }) => {
	const handleChange = (selectedValue: string) => {
		if (onChange) {
			onChange(selectedValue);
		}
	};

	const containerClasses = `
		${direction === "horizontal" ? "flex flex-wrap gap-4" : "flex flex-col gap-4"}
		${className}
	`.trim();

	return (
		<div className="flex flex-col gap-1">
			{label && <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>}

			{/* TODO: Style checknox better */}
			<div className={containerClasses}>
				{options.map((option) => (
					<label key={option.value} className={`flex cursor-pointer items-center gap-2 ${direction === "horizontal" ? "flex-shrink-0" : ""} `}>
						<input
							type="radio"
							name={name}
							value={option.value}
							checked={value === option.value}
							onChange={() => handleChange(option.value)}
							className={`text-primary accent-primary h-4 w-4`}
						/>
						<span className={`text-s`}>{option.label}</span>
					</label>
				))}
			</div>

			{error && <span className="text-sm text-red-500 dark:text-red-400">{error}</span>}
		</div>
	);
};

export default RadioInput;
