import React, { type ReactNode } from "react";
import { twMerge } from "tailwind-merge";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

interface CardWrapperProps {
	children?: ReactNode;
	loading?: boolean;
	className?: string;
}

const CardWrapper: React.FC<CardWrapperProps> = ({ children, loading = false, className = "" }) => {
	return loading ? (
		<div className={twMerge("min-h-30 w-full rounded-lg", className)}>
			<Skeleton width="100%" height={className.includes("h-") ? "100%" : 120} />
		</div>
	) : (
		<div className={twMerge("text-primary border-secondary flex min-h-30 w-full flex-col gap-3 rounded-lg border-1 bg-[rgba(255,255,255,0.03)] p-6", className)}>
			{children}
		</div>
	);
};

export default CardWrapper;
