import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "../components/buttons";
import { Input, Checkbox } from "../components/inputs";
import { TextDivider } from "../components/TextDivider";
import { GoogleIcon } from "../components/icons";
import useAuth from "../hooks/useAuth";
import useUserPreferences from "../hooks/useUserPreferences";
import { mapErrors } from "../utils/errorsUtils";

import { axiosClient } from "../api/axios";
import { UNITS } from "../constants";
const LOGIN_URL = "/auth/login";

const Login: React.FC = () => {
	const { setAuth, persist, setPersist } = useAuth();
	const { updatePreference } = useUserPreferences();

	const [formData, setFormData] = useState({
		email: "", //TODO: remove defuelt value
		password: "",
	});

	const [errors, setErrors] = useState<Record<string, string>>({});
	const [isSubmitting, setIsSubmitting] = useState(false);

	const navigate = useNavigate();
	const location = useLocation();

	const from = location.state?.from?.pathname || "/dashboard/overview";

	const togglePersist = () => {
		setPersist((prev) => !prev);
	};

	useEffect(() => {
		localStorage.setItem("persist", persist.toString());
		console.log(`Persist state changed: ${persist}`);
	}, [persist]);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));

		// Clear error when user starts typing
		if (errors[name]) {
			setErrors((prev) => {
				const { [name]: _, ...rest } = prev;
				return rest;
			});
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsSubmitting(true);
		setErrors({});

		const email = formData.email;
		const password = formData.password;

		const payload: Record<string, string> = {
			...(email && { email }),
			...(password && { password }),
		};

		try {
			const res = await axiosClient.post(LOGIN_URL, payload, {
				withCredentials: true,
			});
			const { accessToken, ...user } = res.data;
			setAuth({ user, accessToken });
			updatePreference("unit", user.unitPreference || UNITS.METRIC.key); // TODO: add other preferences, at least the week starts on preference
			navigate(from, { replace: true });
		} catch (err: any) {
			console.error("Error logging in:", err);
			if (!err?.response) {
				navigate("/503", { state: { from }, replace: true });
			}
			setErrors(mapErrors(err.response?.data?.error?.details));
			//TODO: handle email or password are incorrect error
		} finally {
			setIsSubmitting(false);
		}
	};

	// TODO: Implement oauth login

	return (
		<form
			onSubmit={handleSubmit}
			className="text-s text-primary border-secondary absolute top-1/2 left-1/2 flex w-135 -translate-x-1/2 -translate-y-1/2 transform flex-col gap-14 rounded-4xl border px-12 py-18 shadow-lg"
		>
			<div className="flex flex-col gap-6">
				<h1 className="text-xl">Sign In</h1>
				<p className="text-grey">Enter your log in details below to continue</p>
			</div>

			<div className="flex w-full flex-col gap-6">
				<Input id="email" label="Email" placeholder="Enter your email" errorMsg={errors.email} onChange={handleChange} value={formData.email} required />
				<div className="flex flex-col gap-3">
					<Input
						id="password"
						label="Password"
						type="password"
						placeholder="Enter your password"
						errorMsg={errors.password}
						onChange={handleChange}
						value={formData.password}
						required
					/>
					<div className="flex justify-between">
						<Checkbox id="remember-me" onChange={togglePersist} checked={persist} label="Remember me" />
						<Link className="text-highlight cursor-pointer hover:underline" to="/forgot-password">
							Forgot password
						</Link>
					</div>
				</div>
			</div>

			<div className="flex w-full flex-col gap-6">
				<Button disabled={isSubmitting}>{isSubmitting ? "Signing in..." : "Log In"}</Button>
				<TextDivider>Or continue</TextDivider>
				<Button variant="outline">
					<div className="position absolute top-1/2 left-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center gap-3">
						<GoogleIcon className="h-5 w-5" />
						<span>Log in with google</span>
					</div>
				</Button>
			</div>

			<div className="text-center">
				<span>Don't have an account? </span>
				<Link className="text-highlight cursor-pointer hover:underline" to="/register">
					Register here
				</Link>
			</div>
		</form>
	);
};

export default Login;
