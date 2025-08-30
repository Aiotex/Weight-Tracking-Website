import { axiosClient } from "../api/axios";
import { useNavigate } from "react-router-dom";
import useAuth from "./useAuth";

const useLogout = () => {
	const { setAuth, setPersist } = useAuth();
	const navigate = useNavigate();

	const logout = async () => {
		setAuth(null);
		try {
			await axiosClient("auth/logout", {
				withCredentials: true,
			});
			setPersist(false);
			console.log("User logged out successfully");
			navigate("/", { replace: true });
		} catch (err) {
			console.error(err);
		}
	};

	return logout;
};

export default useLogout;
