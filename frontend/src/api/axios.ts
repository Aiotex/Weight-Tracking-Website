import axios from "axios";

const baseURL = import.meta.env.VITE_BACKEND_URL;

export const axiosClient = axios.create({
	baseURL,
	headers: {
		"Content-Type": "application/json",
	},
});

export const axiosPrivate = axios.create({
	baseURL,
	withCredentials: true,
	headers: {
		"Content-Type": "application/json",
	},
});

// TODO: cancel requests on unmount
