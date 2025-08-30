import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "../components/buttons";

const errorMessages: Record<number, { title: string; message: string }> = {
	400: {
		title: "Bad Request",
		message: "Something's off with your request. Check and try again.",
	},
	401: {
		title: "Unauthorized",
		message: "You must be logged in to access this page.",
	},
	403: {
		title: "Forbidden",
		message: "You don't have permission to access this.",
	},
	404: {
		title: "Not Found",
		message: "We couldn't find the page you're looking for.",
	},
	408: {
		title: "Request Timeout",
		message: "Request took too long. Try again.",
	},
	500: {
		title: "Server Error",
		message: "Something went wrong on our end.",
	},
};

type ErrorPageProps = {
	statusCode: number;
};

const ErrorPage: React.FC<ErrorPageProps> = ({ statusCode }) => {
	//TODO: change the redircet btn depanding on the error, and overall improve the degsign
	const navigate = useNavigate();
	const location = useLocation();
	const from = location.state?.from?.pathname || "/dashboard/overview";
	const error = errorMessages[statusCode] || errorMessages[500];

	const goBack = () => navigate(from, { replace: true });

	return (
		<div className="text-primary text-l absolute top-[20%] left-1/2 flex h-50 -translate-x-1/2 -translate-y-1/2 transform items-center gap-40">
			<div className="flex h-full flex-col justify-around">
				<div className="flex w-min items-center gap-4">
					<img
						src="logo.png"
						alt="Logo"
						className="fil h-10 w-10"
						style={{
							filter: "invert(82%) sepia(57%) saturate(3995%) hue-rotate(136deg) brightness(88%) contrast(85%)",
						}}
					/>
					<h1 className="text-xl">Placeholder</h1>
				</div>
				<div className="flex flex-col gap-4">
					<span className="flex h-min items-center gap-3">
						<span className="text-xl">{statusCode}</span>
						<span>{error.title}</span>
					</span>
					<p>{error.message}</p>
					<Button className="w-min" onClick={goBack} variant="primary">
						Go back
					</Button>
				</div>
			</div>
			<img src="broken-scale.png" alt="img" className="aspect-auto h-full" />
		</div>
	);
};

export default ErrorPage;
