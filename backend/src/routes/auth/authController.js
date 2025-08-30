import { Router } from 'express';
import verify from '../../middlewares/schemaValidationMiddleware.js';
import { registerUser, loginUser, refreshAccessToken, logoutUser } from './authService.js';
import { registerSchema, loginSchema } from './authSchemas.js';
import ms from 'ms';
const router = Router();

/**
 * @route     {POST} auth/register
 * @desc      Create a new user
 * @bodyparam firstName, lastName, email, password
 */
router.post('/register', verify(registerSchema), async (req, res) => {
	const { user, accessToken, refreshToken } = await registerUser(req.body);

	// set refresh token as HttpOnly cookie
	res.cookie('refreshToken', refreshToken, {
		httpOnly: true,
		secure: process.env.NODE_ENV === 'production',
		sameSite: 'strict',
		path: 'api/auth/token', // restricts cookie to only refresh endpoint
		maxAge: ms(process.env.REFRESH_TOKEN_EXPIRES_IN),
	});

	res.status(201).json({ ...user, accessToken });
});

/**
 * @route     {POST} auth/login
 * @desc      Authenticate user and return token
 * @bodyparam email, password
 */
router.post('/login', verify(loginSchema), async (req, res) => {
	const { user, accessToken, refreshToken } = await loginUser(req.body);

	// set refresh token as HttpOnly cookie
	res.cookie('refreshToken', refreshToken, {
		httpOnly: true,
		secure: process.env.NODE_ENV === 'production',
		sameSite: 'strict',
		path: 'api/auth/token', // restricts cookie to only refresh endpoint
		maxAge: ms(process.env.REFRESH_TOKEN_EXPIRES_IN),
	});

	res.status(200).json({ ...user, accessToken });
});

/**
 * @route     {GET} auth/token
 * @desc      Returns a new access token using a refresh token from HttpOnly cookie
 */
router.get('/token', async (req, res) => {
	const refreshToken = req.cookies?.refreshToken;
	const newAccessToken = await refreshAccessToken(refreshToken);
	res.status(200).json({ accessToken: newAccessToken });
});

/**
 * @route     {GET} auth/logout
 * @desc      Logs out user by clearing HttpOnly cookie
 */
router.get('/logout', async (req, res) => {
	await logoutUser(req.cookies.refreshToken);

	res.clearCookie('refreshToken', {
		httpOnly: true,
		secure: process.env.NODE_ENV === 'production',
		sameSite: 'strict',
	});
	res.sendStatus(204);
});

export default router;
