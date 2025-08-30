import { useLocation, Navigate, Outlet } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import React from "react";
import { type Role } from "../constants";

const RequireAuth: React.FC<{ allowedRoles?: Role[] }> = ({ allowedRoles }) => {
	const { auth } = useAuth();
	const location = useLocation();

	console.log(`auth state in RequireAuth: ${JSON.stringify(auth)}`);

	return allowedRoles?.includes(auth?.user.role as Role) ? (
		<Outlet />
	) : auth ? (
		<Navigate to="/401" state={{ from: location }} replace /> //TODO: create an unauthorized page
	) : (
		<Navigate to="/login" state={{ from: location }} replace />
	);
};

export default RequireAuth;
