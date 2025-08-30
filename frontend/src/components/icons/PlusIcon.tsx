import React from "react";
import type { SVGProps } from "react";

const PlusIcon: React.FC<SVGProps<SVGSVGElement>> = (props) => (
	<svg xmlns="http://www.w3.org/2000/svg" width={22} height={22} viewBox="0 0 16 16" {...props}>
		<path fill="currentColor" d="M9 3a1 1 0 0 0-2 0v4H3a1 1 0 0 0 0 2h4v4a1 1 0 0 0 2 0V9h4a1 1 0 0 0 0-2H9z"></path>
	</svg>
);

export default PlusIcon;
