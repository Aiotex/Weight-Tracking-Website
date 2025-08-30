import React, { useState } from "react";

interface ColorOption {
	title: string;
	value: string;
}

interface ColorPickerProps {
	value?: string;
	onChange: (color: string) => void;
	predefinedColors?: ColorOption[];
	showCustom?: boolean;
	className?: string;
}

const ColorPicker: React.FC<ColorPickerProps> = ({ value = "#3b82f6", onChange, predefinedColors, showCustom = true, className = "" }) => {
	const [customColor, setCustomColor] = useState(value);

	const handleColorSelect = (color: string) => {
		onChange(color);
		setCustomColor(color);
	};

	const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newColor = e.target.value;
		setCustomColor(newColor);
		onChange(newColor);
	};

	const isValidHex = (color: string) => {
		return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
	};

	return (
		<div className={`flex flex-col gap-4 ${className}`}>
			{/* Predefined Colors Row */}

			{predefinedColors && predefinedColors.length > 0 && (
				<div className="flex flex-wrap gap-2">
					{predefinedColors.map((colorOption) => (
						<button
							key={colorOption.value}
							type="button"
							onClick={() => handleColorSelect(colorOption.value)}
							className={`h-8 w-8 cursor-pointer rounded-full outline-3 transition-all hover:scale-110 ${value === colorOption.value ? "outline-primary" : "outline-none"}`}
							style={{ backgroundColor: colorOption.value }}
							title={colorOption.title}
						/>
					))}
				</div>
			)}

			{/* Custom Color Section */}
			{showCustom && (
				<div className="flex items-center gap-3">
					<span className="text-s">Custom</span>
					<div className="flex items-center gap-3">
						{/* Hex Input */}
						<input
							type="text"
							value={customColor}
							onChange={handleCustomColorChange}
							placeholder="#000000"
							className={`text-primary bg-background focus:border-highlight h-10 w-24 rounded-lg border px-3 text-xs outline-none ${
								!isValidHex(customColor) && customColor !== "" ? "border-red" : ""
							}`}
							maxLength={7}
						/>

						{/* Color Preview Circle with Native Picker */}
						<div className="relative">
							<input
								type="color"
								value={isValidHex(customColor) ? customColor : "#000000"}
								onChange={handleCustomColorChange}
								className="absolute inset-0 h-8 w-8 cursor-pointer opacity-0"
								title="Open color picker"
							/>
							<div
								className="border-secondary hover:border-highlight h-8 w-8 cursor-pointer rounded-full border-2 transition-all hover:scale-110"
								style={{ backgroundColor: isValidHex(customColor) ? customColor : "#000000" }}
							/>
						</div>
					</div>

					{/* Validation Error */}
					{!isValidHex(customColor) && customColor !== "" && <span className="text-red text-xs">Invalid hex color format</span>}
				</div>
			)}
		</div>
	);
};

export default ColorPicker;
