import jwt from 'jsonwebtoken';
import { createHash } from 'crypto';
import HttpException from './httpException.js';
import prisma from '../prisma/prismaClient.js';
import { ACCESS_TOKEN_EXPIRES_IN, REFRESH_TOKEN_EXPIRES_IN } from '../constants.js';

export const hashToken = (token) => {
	return createHash('sha256').update(token).digest('hex');
};

export const getTokenFromHeaders = (req) => {
	const authHeader = req.headers.authorization;
	if (!authHeader) return null;

	const [scheme, token] = authHeader.split(' ');
	return scheme === 'Bearer' ? token : null;
};

export const generateAccessToken = (userId) => {
	return jwt.sign({ user: { id: userId } }, process.env.ACCESS_TOKEN_SECRET || 'superSecret', {
		expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || '15m',
	});
};

export const generateRefreshToken = async (userId) => {
	const rawToken = jwt.sign({ user: { id: userId } }, process.env.REFRESH_TOKEN_SECRET || 'superSecret', {
		expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '30d',
	});

	const tokenHash = hashToken(rawToken);

	try {
		await prisma.refresh_Token.upsert({
			where: { userId },
			update: { tokenHash, revoked: false },
			create: { userId, tokenHash, revoked: false },
		});

		return rawToken;
	} catch (err) {
		console.error(err);
		throw new HttpException(500, 'Unable to create or update refresh token');
	}
};
