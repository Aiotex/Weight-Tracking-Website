import { errorStatusMessages } from "../constants.js";
import HttpException from "../utils/httpException.js";

const errorHandler = (err, req, res, next) => {
	const status = err.statusCode || 500;
	const details = err.details || [];

	// Print normal code errors in the console for debugging
	if (!(err instanceof HttpException)) {
		console.error(err);
		err.message = errorStatusMessages[500];
	}

	// Normalize the details field to array for a consistent API response format
	const errorResponse = {
		error: {
			message: err.message,
			details: Array.isArray(details) ? details : [details],
			timestamp: new Date().toISOString(),
			path: req.originalUrl,
		},
	};

	res.status(status).json(errorResponse);
};

export default errorHandler;
