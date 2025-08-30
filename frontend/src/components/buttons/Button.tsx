import React from "react";
import { Link } from "react-router-dom";
import { twMerge } from "tailwind-merge";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
	to?: string;
	variant?: "primary" | "rounded" | "outline" | "outlineRound" | "success" | "danger";
	children?: React.ReactNode;
	className?: string;
};

const Button: React.FC<ButtonProps> = ({ to, variant = "primary", children, className, ...rest }) => {
	const globalClasses = twMerge(
		"relative px-6 h-12 rounded-lg text-m transition duration-150 ease-in-out whitespace-nowrap cursor-pointer disabled:cursor-default disabled:brightness-70",
	);
	const variantClasses = {
		primary: twMerge(globalClasses, "bg-primary text-accent hover:brightness-70"),
		rounded: twMerge(globalClasses, "bg-primary text-accent rounded-full hover:brightness-70"),
		outline: twMerge(globalClasses, "border border-white border-1 text-primary hover:brightness-70"),
		outlineRound: twMerge(
			"text-xs whitespace-nowrap text-primary cursor-pointer border border-white py-1 px-3 rounded-full transition duration-150 ease-in-out hover:brightness-70",
		),
		success: twMerge(globalClasses, "bg-green text-white hover:brightness-70"),
		danger: twMerge(globalClasses, "bg-danger text-white hover:brightness-70"),
	};

	className = twMerge(variantClasses[variant], className);

	return to ? (
		<Link to={to} className={className}>
			{children}
		</Link>
	) : (
		<button className={className} {...rest}>
			{children}
		</button>
	);
};

export default Button;
