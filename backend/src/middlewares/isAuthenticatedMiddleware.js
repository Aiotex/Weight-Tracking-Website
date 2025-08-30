import jwt from 'jsonwebtoken';
import HttpException from '../utils/httpException.js';
import { getTokenFromHeaders } from '../utils/jwtUtils.js';

const requireAuth = (req, res, next) => {
	const token = getTokenFromHeaders(req);
	if (!token) throw new HttpException(401, 'No token provided');

	try {
		const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET || 'superSecret');
		req.user = decoded.user;
		next();
	} catch (err) {
		throw new HttpException(403, 'Invalid token');
	}
};

export default requireAuth;
