import React, { useState, useRef } from "react";
import { ErrorIcon, EyeIcon, EyeIconOff, DateIcon } from "../icons";

type InputProps = React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> & {
	id: string;
	label: string;
	className?: string;
	type?: "text" | "password" | "textarea" | "number" | "date";
	required?: boolean;
	prefix?: string;
	errorMsg?: string;
	maxLength?: number; // For character counter
};

const Input: React.FC<InputProps> = ({ id, label, className, type = "text", required = false, prefix, errorMsg, maxLength, ...rest }) => {
	const inputRef = useRef<HTMLInputElement>(null);
	const [showPassword, setShowPassword] = useState(false);
	const inputType = type === "password" && showPassword ? "text" : type;
	const borderClass = errorMsg ? "border-red" : "border-secondary focus:border-highlight";

	// Get current value for character counter
	const currentValue = (rest.value as string) || (rest.defaultValue as string) || "";
	const currentLength = currentValue.length;

	const handleDateClick = () => {
		if (inputRef.current && type === "date") {
			inputRef.current.focus();
			inputRef.current.showPicker();
		}
	};

	/* TODO: Submit form on enter */

	return (
		<div className={`text-s flex flex-col gap-2 ${className}`}>
			<label className="text-primary flex gap-1 whitespace-nowrap" htmlFor={id}>
				{label}
				{required && <span className="text-red">*</span>}
			</label>

			<div className="relative">
				{type === "textarea" ? ( // TODO: Move this thing to its own file
					<>
						<textarea id={id} name={id} maxLength={maxLength} className={`h-40 w-full resize-none rounded-lg border p-4 outline-none ${borderClass}`} {...rest} />
						{maxLength && (
							<span className="text-grey text-s absolute right-4 bottom-4">
								{currentLength}/{maxLength}
							</span>
						)}
					</>
				) : (
					<>
						{prefix && (
							<div
								className={`text-primary border-secondary absolute top-0 left-0 flex h-12 w-12 items-center justify-center rounded-l-lg border-r bg-[rgba(255,255,255,0.08)]`}
							>
								{prefix}
							</div>
						)}
						{/* TODO: finish number input styling */}
						<input
							id={id}
							name={id}
							ref={inputRef}
							type={inputType}
							maxLength={maxLength}
							className={`h-12 w-full rounded-lg border outline-none ${prefix ? "pl-18" : "px-4"} ${borderClass} [&::-webkit-calendar-picker-indicator]:appearance-none [&::-webkit-calendar-picker-indicator]:opacity-0`}
							{...rest}
						/>
						{type === "date" && (
							<>
								{!errorMsg && <DateIcon className="text-grey pointer-events-none absolute top-[50%] right-4 z-10 -translate-y-1/2 transform" />}
								<div className="absolute inset-0 cursor-pointer" onClick={handleDateClick} />
							</>
						)}
						{type === "password" && !errorMsg && (
							<button
								type="button"
								className="text-grey absolute top-[50%] right-3 -translate-y-1/2 transform cursor-pointer"
								onClick={() => setShowPassword((prev) => !prev)}
							>
								{showPassword ? <EyeIconOff /> : <EyeIcon />}
							</button>
						)}
					</>
				)}
				{/* TODO: make invisible room for the err field, prevent text wrapping and add a tooltip if needed */}
				{errorMsg && <ErrorIcon className="text-red absolute top-[50%] right-3 -translate-y-1/2 transform" />}
			</div>
			{errorMsg && <span className="text-red">{errorMsg}</span>}
		</div>
	);
};

export default Input;
