import React from "react";

type DividerProps = {
	children?: React.ReactNode;
	className?: string;
};

export const TextDivider: React.FC<DividerProps> = ({
	children,
	className,
}) => (
	<div
		className={`text-secondary text-s flex items-center gap-4 ${className}`}
	>
		<div className="border-secondary flex-grow border-t"></div>
		<span>{children}</span>
		<div className="border-secondary flex-grow border-t"></div>
	</div>
);
