import { createContext, useState, useEffect } from "react";
import React from "react";
import type { User } from "../types/api";

type Auth = {
	user: User;
	accessToken: string | null;
};

type AuthContextType = {
	auth: Auth | null;
	setAuth: React.Dispatch<React.SetStateAction<Auth | null>>;
	persist: boolean;
	setPersist: React.Dispatch<React.SetStateAction<boolean>>;
};

const AUTH_STORAGE_KEY = "auth";
const PERSIST_STORAGE_KEY = "persist";

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	/* TODO:
	 * move from the unsecure session storage to a state manager like redux (complicated)
	 * optionally, replace sessionStorage with a state to store the auth data
	 * and retrieve the user inside the useRefreshToken hook each render, causing more API calls
	 */
	const [auth, setAuth] = useState<Auth | null>(() => {
		const storedAuth = sessionStorage.getItem(AUTH_STORAGE_KEY);
		return storedAuth ? JSON.parse(storedAuth) : null;
	});

	const [persist, setPersist] = useState<boolean>(() => {
		const storedPersist = localStorage.getItem(PERSIST_STORAGE_KEY);
		return storedPersist ? JSON.parse(storedPersist) : false;
	});

	useEffect(() => {
		if (auth) {
			sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth));
		} else {
			sessionStorage.removeItem(AUTH_STORAGE_KEY);
		}
	}, [auth]);

	return <AuthContext.Provider value={{ auth, setAuth, persist, setPersist }}>{children}</AuthContext.Provider>;
};

export default AuthContext;
