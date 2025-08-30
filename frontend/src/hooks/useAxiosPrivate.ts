import { axiosPrivate } from "../api/axios";
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import useRefreshToken from "./useRefreshToken";
import useAuth from "./useAuth";

const useAxiosPrivate = () => {
	const { auth } = useAuth();
	const refresh = useRefreshToken();
	const navigate = useNavigate();
	const location = useLocation();

	useEffect(() => {
		const requestIntercept = axiosPrivate.interceptors.request.use(
			(config) => {
				if (!config.headers["Authorization"]) {
					config.headers["Authorization"] = `Bearer ${auth?.accessToken}`;
				}
				return config;
			},
			(error) => Promise.reject(error),
		);

		const responseIntercept = axiosPrivate.interceptors.response.use(
			(response) => response,
			async (error) => {
				// Connection error
				if (!error.response) {
					navigate("/503", { state: { from: location.pathname }, replace: true });
					return Promise.reject(error);
				}

				const prevRequest = error?.config;
				const status = error?.response?.status;

				switch (status) {
					case 403:
						if (!prevRequest?.sent) {
							try {
								prevRequest.sent = true;
								const newAccessToken = await refresh();
								prevRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
								return axiosPrivate(prevRequest);
							} catch (err) {
								// Refresh error / expired refresh token
								navigate("/login", { state: { from: location.pathname }, replace: true });
							}
						}
						break;

					case 401:
						// Unauthorized
						navigate("/401", { state: { from: location.pathname }, replace: true });
						break;

					case 500:
						// Server error
						navigate("/500", { state: { from: location.pathname }, replace: true });
						break;
				}

				return Promise.reject(error);
			},
		);

		return () => {
			axiosPrivate.interceptors.request.eject(requestIntercept);
			axiosPrivate.interceptors.response.eject(responseIntercept);
		};
	}, [auth, refresh, navigate, location]);

	return axiosPrivate;
};

export default useAxiosPrivate;
