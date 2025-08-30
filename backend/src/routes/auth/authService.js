import HttpException from '../../utils/httpException.js';
import { generateAccessToken, generateRefreshToken, hashToken } from '../../utils/jwtUtils.js';
import { formatUserResponse } from '../profiles/profileService.js';
import { roles } from '../../constants.js';
import bcrypt from 'bcrypt';
import prisma from '../../prisma/prismaClient.js';
import jwt from 'jsonwebtoken';

export const registerUser = async (input, role) => {
	const { firstName, lastName, email, password } = input;

	// Check email uniqueness
	const existingUserByEmail = await prisma.user.findUnique({
		where: { email },
	});

	if (existingUserByEmail) {
		throw new HttpException(422, { field: 'email', issue: 'Email has already been taken' });
	}

	try {
		const hashedPassword = await bcrypt.hash(password, 10);
		const user = await prisma.user.create({
			data: {
				firstName,
				lastName,
				email,
				role: role || roles.USER,
				passwordHash: hashedPassword,
				profile: { create: {} },
			},
			include: { profile: true },
		});

		return {
			user: formatUserResponse(user),
			refreshToken: await generateRefreshToken(user.id),
			accessToken: generateAccessToken(user.id),
		};
	} catch (err) {
		console.error(err);
		throw new HttpException(500, 'Unable to create user');
	}
};

export const loginUser = async (input) => {
	const { email, password } = input;

	const user = await prisma.user.findUnique({
		where: { email },
		include: { profile: true },
	});

	if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
		throw new HttpException(401, 'email or password are incorrect');
	}

	return {
		user: formatUserResponse(user),
		refreshToken: await generateRefreshToken(user.id),
		accessToken: generateAccessToken(user.id),
	};
};

export const refreshAccessToken = async (refreshToken) => {
	if (!refreshToken) {
		throw new HttpException(401, 'Refresh token missing');
	}

	let decoded;

	try {
		decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET || 'superSecret');
	} catch (err) {
		throw new HttpException(401, 'Invalid refresh token');
	}

	const userId = decoded.user.id;

	// Check for a vaLid refresh token that exists and is not revoked
	const tokenRecord = await prisma.refresh_Token.findUnique({
		where: { userId },
	});

	if (!tokenRecord || tokenRecord.revoked || hashToken(refreshToken) != tokenRecord?.tokenHash) {
		throw new HttpException(403);
	}

	return generateAccessToken(userId);
};

export const logoutUser = async (refreshToken) => {
	if (!refreshToken) {
		throw new HttpException(401, 'Refresh token missing');
	}

	try {
		prisma.refresh_Token.delete({
			where: { tokenHash: hashToken(refreshToken) },
		});
	} catch (err) {
		throw new HttpException(401, 'Invalid refresh token');
	}
};
