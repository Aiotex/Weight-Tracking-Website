import { axiosClient } from "../api/axios";
import useAuth from "./useAuth";

const useRefreshToken = () => {
	const { auth, setAuth } = useAuth();

	const refresh = async () => {
		try {
			const response = await axiosClient.get("/auth/token", {
				withCredentials: true,
			});
			const newAccessToken = response.data.accessToken;

			// if we dont have existing auth, meaning the user has opened a new tab
			// we need to fetch the user data too
			if (!auth?.accessToken) {
				const userResponse = await axiosClient.get("/users/me", {
					headers: {
						Authorization: `Bearer ${newAccessToken}`,
					},
				});
				setAuth({
					accessToken: newAccessToken,
					user: userResponse.data,
				});
			} else {
				// if we have existing auth, just update the token
				setAuth(
					(prev) =>
						prev && {
							...prev,
							accessToken: newAccessToken,
						},
				);
			}

			return newAccessToken;
		} catch (err) {
			console.error("Failed to refresh token:", err);
			return null;
		}
	};

	return refresh;
};

export default useRefreshToken;
