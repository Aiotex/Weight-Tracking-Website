import { Router } from 'express';
import verify from '../../middlewares/schemaValidationMiddleware.js';
import requireAuth from '../../middlewares/isAuthenticatedMiddleware.js';
import { getProfile, updateProfile, deleteProfile, updateAvatar, deleteAvatar } from './profileService.js';
import { updateUserSchema } from './profileSchemas.js';
import upload from '../../middlewares/fileUploadMiddleware.js';
const router = Router();

/**
 * @route {GET} users/me
 * @desc  Get user profile info
 * @auth  requierd
 */
router.get('/me', requireAuth, async (req, res, next) => {
	try {
		const user = await getProfile(req.user.id);
		res.status(200).json(user);
	} catch (err) {
		next(err);
	}
});

/**
 * @route     {PATCH} users/me
 * @desc      Update profile (excluding avatar)
 * @bodyparam firstName, lastName, email, password, heightCm, dateOfBirth, gender, unitPreference, weekStartsOn
 * @auth      required
 */
router.patch('/me', requireAuth, verify(updateUserSchema), async (req, res, next) => {
	const user = await updateProfile(req.user.id, req.body);
	res.status(200).json(user);
});

/**
 * @route     {POST} users/me/avatar
 * @desc      Upload or change avatar
 * @bodyparam avatar (file)
 * @auth      required
 */
router.post('/me/avatar', requireAuth, upload.single('avatar'), async (req, res, next) => {
	if (!req.file) {
		return res.status(400).json({ message: 'No image file provided' });
	}

	const user = await updateAvatar(req.user.id, req.file.filename);
	res.status(200).json(user);
});

/**
 * @route {DELETE} users/me/avatar
 * @desc  Delete avatar
 * @auth  required
 */
router.delete('/me/avatar', requireAuth, async (req, res, next) => {
	const user = await deleteAvatar(req.user.id);
	res.status(200).json(user);
});

/**
 * @route {DELETE} users/me
 * @desc  Delete profile
 * @auth  requierd
 */
router.delete('/me', requireAuth, async (req, res, next) => {
	try {
		await deleteProfile(req.user.id);
		res.status(204).send();
	} catch (err) {
		next(err);
	}
});

export default router;
