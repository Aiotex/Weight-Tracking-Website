import React, { useState } from "react";
import { Button, NavButton } from "./buttons";
import { DashboardIcon, AnalyticsIcon, SettingsIcon, LogoutIcon, PlusIcon } from "./icons";
import useLogout from "../hooks/useLogout";
import useAuth from "../hooks/useAuth";
import EntryForm from "./EntryForm";

export const Sidebar: React.FC = () => {
	const { auth } = useAuth();
	const logout = useLogout();
	const [popupOpen, setPopupOpen] = useState(false);

	return (
		<>
			<EntryForm isOpen={popupOpen} onClose={() => setPopupOpen(false)} />

			<nav className="text-primary flex h-full w-full flex-col items-center justify-between">
				<div className="flex flex-col items-center gap-2">
					<div className="mb-6 flex items-center gap-2">
						<img
							src="../logo.png"
							alt="Logo"
							className="fil h-5 w-5"
							style={{
								filter: "invert(82%) sepia(57%) saturate(3995%) hue-rotate(136deg) brightness(88%) contrast(85%)",
							}}
						/>
						<h1 className="text-m">Placeholder</h1>
					</div>

					<img
						src={auth?.user.avatarUrl ? auth?.user.avatarUrl : "../default-avatar.jpg"}
						alt="Default Avatar"
						className="h-20 w-20 rounded-full bg-white/10 object-cover"
						onError={(e) => {
							const target = e.currentTarget;
							if (target.src !== "../default-avatar.jpg") {
								target.src = "../default-avatar.jpg";
							}
						}}
					/>
					<h2 className="text-l">{`${auth?.user.firstName} ${auth?.user.lastName}`}</h2>
					<Button variant="outlineRound" to="/dashboard/settings">
						Edit
					</Button>
				</div>

				<div className="absolute top-1/2 flex w-40 -translate-y-1/2 flex-col items-center justify-center gap-1">
					<NavButton text="Overview" to="/dashboard/overview">
						<DashboardIcon />
					</NavButton>
					<NavButton text="Analytics" to="/dashboard/analytics">
						<AnalyticsIcon />
					</NavButton>
					<NavButton text="Settings" to="/dashboard/settings">
						<SettingsIcon />
					</NavButton>
					<NavButton text="Add Log" onClick={() => setPopupOpen(true)}>
						<PlusIcon />
					</NavButton>
				</div>

				<div className="h-min w-40">
					<NavButton text="Log out" to="/" onClick={async () => logout()}>
						<LogoutIcon />
					</NavButton>
				</div>
			</nav>
		</>
	);
};

export default Sidebar;
