import React, { useState, useRef, useEffect } from "react";
import { twMerge } from "tailwind-merge";

export interface DropdownOption {
	key: string;
	value: string;
	disabled?: boolean;
}

type DropdownProps = {
	options: DropdownOption[];
	input?: boolean;
	required?: boolean;
	value?: string;
	placeholder?: string;
	className?: string;
	disabled?: boolean;
	id?: string;
	label?: string;
	onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
	onBlur?: () => void;
	onFocus?: () => void;
} & React.InputHTMLAttributes<HTMLInputElement>;

// TODO: Alot of spagety code here, needs refactoring
// use an input with consistent styling and behavior across the app
// utilize the state above the component to manage the selected option
// using the value and on change props to handle the selected option

const Dropdown: React.FC<DropdownProps> = ({
	options,
	input = false,
	required = false,
	value,
	placeholder = "Select an option",
	className,
	disabled = false,
	id,
	label,
	onChange,
	onBlur,
	onFocus,
	...rest
}) => {
	const [isOpen, setIsOpen] = useState(false);
	const [selectedOption, setSelectedOption] = useState<DropdownOption | null>(options.find((option) => option.key === value) || null);
	const dropdownRef = useRef<HTMLDivElement>(null);

	// Close dropdown when clicking outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
				setIsOpen(false);
				onBlur?.();
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, [onBlur]);

	// Update selected option when value prop changes
	useEffect(() => {
		const newSelectedOption = options.find((option) => option.key === value) || null;
		setSelectedOption(newSelectedOption);
	}, [value, options]);

	const handleToggle = () => {
		if (disabled) return;

		if (!isOpen) {
			onFocus?.();
		}

		setIsOpen(!isOpen);
	};

	const handleOptionSelect = (option: DropdownOption) => {
		if (option.disabled) return;

		setSelectedOption(option);
		setIsOpen(false);

		// If in input mode, create a synthetic event for form compatibility
		if (input && id && onChange) {
			const syntheticEvent = {
				target: {
					name: id,
					value: option.key,
				},
			} as React.ChangeEvent<HTMLInputElement>;

			// Call the form-style onChange
			(onChange as React.ChangeEventHandler<HTMLInputElement>)(syntheticEvent);
		} else {
			onChange?.({ target: { value: option.key } } as React.ChangeEvent<HTMLInputElement>);
		}

		onBlur?.();
	};

	const baseStyles = "h-12 w-full rounded-lg px-4 py-2 text-left outline-0 transition duration-150 ease-in-out hover:brightness-70";
	const dropdownStyles = baseStyles + " bg-primary text-accent";
	const inputStyles = baseStyles + " text-primary text-s border-secondary border-1";

	// className = twMerge(input ? inputClasses : dropdownClasses, className);

	return (
		<div ref={dropdownRef} className={twMerge("text-accent text-m relative inline-block w-full", className)}>
			{/* Label */}
			{label && input && (
				<label className="text-primary text-s mb-2 flex gap-1 whitespace-nowrap" htmlFor={id}>
					{label}
					{required && <span className="text-red">*</span>}
				</label>
			)}

			{/* Hidden input for form submission */}
			{id && input && <input type="hidden" id={id} name={id} value={selectedOption?.key || ""} readOnly {...rest} />}

			{/* Dropdown Button */}
			<button
				type="button"
				onClick={handleToggle}
				disabled={disabled}
				className={`${input ? inputStyles : dropdownStyles} ${disabled ? "cursor-not-allowed brightness-70" : "cursor-pointer"}`}
				aria-haspopup="listbox"
				aria-expanded={isOpen}
			>
				<div className="flex items-center justify-between">
					<span>{selectedOption ? selectedOption.value : placeholder}</span>
					<svg className={`h-4 w-4 transition-transform duration-150 ${isOpen ? "rotate-180 transform" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
					</svg>
				</div>
			</button>

			{/* Dropdown Menu */}
			{isOpen && (
				<div className={`bg-accent absolute z-50 mt-1 w-full overflow-hidden rounded-lg text-white shadow-lg ${input ? "text-s" : "text-m"}`}>
					<ul role="listbox">
						{options.map((option, index) => (
							<li
								key={option.key}
								onClick={() => handleOptionSelect(option)}
								className={`flex h-10 cursor-pointer items-center px-4 transition duration-150 ease-in-out ${
									option.disabled ? "cursor-not-allowed brightness-70" : input ? "hover:text-accent hover:bg-white" : "hover:text-accent hover:bg-primary"
								} ${selectedOption?.key === option.key ? (input ? "text-accent bg-white" : "text-accent bg-primary") : ""} ${index === 0 ? "rounded-t-md" : ""} ${index === options.length - 1 ? "rounded-b-md" : ""}`}
								role="option"
								aria-selected={selectedOption?.key === option.key}
							>
								{option.value}
							</li>
						))}
					</ul>
				</div>
			)}
		</div>
	);
};

export default Dropdown;
