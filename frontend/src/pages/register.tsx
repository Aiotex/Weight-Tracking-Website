import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "../components/buttons";
import { Input } from "../components/inputs";
import { TextDivider } from "../components/TextDivider";
import { GoogleIcon } from "../components/icons";
import useAuth from "../hooks/useAuth";

import { axiosClient } from "../api/axios";
const REGISTER_URL = "/auth/register";

const Register: React.FC = () => {
	const { setAuth } = useAuth();

	const [formData, setFormData] = useState({
		firstName: "fname", //TODO: remove default value
		lastName: "lname",
		email: "test@gmail.com",
		password: "password123",
	});

	const [errors, setErrors] = useState<Record<string, string>>({});
	const [isSubmitting, setIsSubmitting] = useState(false);

	const navigate = useNavigate();
	const location = useLocation();

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

	const mapErrors = (apiErrors: { field: string; issue: string }[]) => {
		// Map API errors to a more usable format
		const errorMap: Record<string, string> = {};
		for (const err of apiErrors) {
			errorMap[err.field] = err.issue;
		}
		return errorMap;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsSubmitting(true);

		const from = location.state?.from?.pathname || "/dashboard/overview";

		const firstName = formData.firstName;
		const lastName = formData.lastName;
		const email = formData.email;
		const password = formData.password;

		const payload: Record<string, string> = {
			...(firstName && { firstName }),
			...(lastName && { lastName }),
			...(email && { email }),
			...(password && { password }),
		};

		try {
			const res = await axiosClient.post(REGISTER_URL, payload, {
				withCredentials: true,
			});
			const { accessToken, ...user } = res.data;
			setAuth({ user, accessToken });
			navigate(from);
		} catch (err: any) {
			if (!err?.response) {
				navigate("/503", { state: { from }, replace: true });
			} else {
				setErrors(mapErrors(err.response?.data?.error?.details));
			}
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<form
			onSubmit={handleSubmit}
			className="text-s text-primary border-secondary absolute top-1/2 left-1/2 flex w-135 -translate-x-1/2 -translate-y-1/2 transform flex-col gap-14 rounded-4xl border px-12 py-18 shadow-lg"
		>
			<div className="flex flex-col gap-6">
				<h1 className="text-xl">Sign Up</h1>
				<p className="text-grey">Join now and make weight tracking effortless</p>
			</div>

			<div className="flex w-full flex-col gap-6">
				<div className="flex gap-6">
					<Input
						id="firstName"
						label="First Name"
						placeholder="First name"
						errorMsg={errors.firstName}
						onChange={handleChange}
						value={formData.firstName}
						className="w-full"
						required
					/>
					<Input
						id="lastName"
						label="Last Name"
						placeholder="Last name"
						errorMsg={errors.lastName}
						onChange={handleChange}
						value={formData.lastName}
						className="w-full"
						required
					/>
				</div>
				<Input id="email" label="Email" placeholder="Enter your email" errorMsg={errors.email} onChange={handleChange} value={formData.email} required />
				<Input
					id="password"
					label="Password"
					type="password"
					placeholder="Create your password"
					errorMsg={errors.password}
					onChange={handleChange}
					value={formData.password}
					required
				/>
			</div>

			<div className="flex w-full flex-col gap-6">
				<Button disabled={isSubmitting}>{isSubmitting ? "Signing in..." : "Register"}</Button>
				<TextDivider>Or continue</TextDivider>
				<Button variant="outline">
					<div className="position absolute top-1/2 left-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center gap-3">
						<GoogleIcon className="h-5 w-5" />
						<span>Log in with google</span>
					</div>
				</Button>
			</div>

			<div className="text-center">
				<span>Already have an account? </span>
				<Link className="text-highlight cursor-pointer hover:underline" to="/login">
					Log in here
				</Link>
			</div>
		</form>
	);
};

export default Register;
