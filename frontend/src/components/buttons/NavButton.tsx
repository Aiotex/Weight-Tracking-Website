import React from "react";
import { NavLink } from "react-router-dom";
import { twMerge } from "tailwind-merge";

type ButtonProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
	text: string;
	to?: string;
	onClick?: () => void;
	children?: React.ReactNode;
	className?: string;
};

// TODO: fix spacing issues caused bu inconsistent svg sizes
const NavButton: React.FC<ButtonProps> = ({ text, to, children, className, onClick, ...rest }) => {
	const baseClass = twMerge(
		"hover:bg-primary hover:text-accent relative flex h-10 w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2 whitespace-nowrap transition duration-150 ease-in-out",
		className,
	);

	return to ? (
		<NavLink className={({ isActive }) => `${isActive ? "bg-primary text-accent" : ""} ${baseClass}`} to={to} {...rest}>
			{children}
			<span className="text-m">{text}</span>
		</NavLink>
	) : (
		<button type="button" className={baseClass} onClick={onClick}>
			{children}
			<span className="text-m">{text}</span>
		</button>
	);
};

export default NavButton;
