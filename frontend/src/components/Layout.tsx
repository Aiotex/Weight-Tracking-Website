import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

export const AppLayout: React.FC = () => (
	<div className="flex h-screen items-center gap-8 overflow-hidden px-8 py-16">
		<div className="flex h-full w-56 min-w-56 items-center">
			<Sidebar></Sidebar>
			{/* TODO: add collapsable burger menu for mobile that apears above the content */}
			{/* TODO: add button for the add weight entry in the sidebar */}
			<div className="ml-8 h-[100%] w-[2px] rounded-full bg-[rgba(255,255,255,0.1)]"></div>
		</div>

		<div
			className="text-primary flex h-full w-full flex-col overflow-y-auto"
			style={{
				scrollbarWidth: "thin",
				scrollbarColor: "rgba(156, 163, 175, 0.3) transparent",
			}}
		>
			<Outlet />
		</div>
	</div>
);

export default AppLayout;
