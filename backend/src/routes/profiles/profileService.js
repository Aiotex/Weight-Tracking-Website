import HttpException from '../../utils/httpException.js';
import { gender, roles, units } from '../../constants.js';
import bcrypt from 'bcrypt';
import prisma from '../../prisma/prismaClient.js';
import path from 'path';
import fs from 'fs';
import { getImgPath, getImgFullPath } from '../../utils/fileUtils.js';

export const formatUserResponse = (user) => {
	const { id, firstName, lastName, email, role } = user;
	const { avatar, heightCm, dateOfBirth, gender, unitPreference, weekStartsOn } = user.profile;

	return {
		id,
		firstName,
		lastName,
		email,
		role,
		avatarUrl: avatar ? '/images/' + path.basename(avatar) : null, // add to umg utils class
		heightCm,
		dateOfBirth: dateOfBirth ? dateOfBirth.toISOString().split('T')[0] : null,
		gender,
		unitPreference,
		weekStartsOn,
	};
};

export const getProfile = async (id) => {
	const user = await prisma.user.findUnique({
		where: { id },
		include: { profile: true },
	});

	if (!user) {
		throw new HttpException(404, 'user not found');
	}

	return formatUserResponse(user);
};

export const updateProfile = async (id, updateData) => {
	const user = await prisma.user.findUnique({
		where: { id },
		include: { profile: true },
	});

	if (!user) {
		throw new HttpException(404, 'user not found');
	}

	const userDataUpdate = {};
	const profileDataUpdate = {};
	const { firstName, lastName, email, password, role, heightCm, dateOfBirth, gender, unitPreference, weekStartsOn } = updateData;

	/*
	 * user update data
	 */

	if (firstName !== undefined) userDataUpdate.firstName = firstName;
	if (lastName !== undefined) userDataUpdate.lastName = lastName;
	if (email !== undefined) userDataUpdate.email = email;
	if (role !== undefined) userDataUpdate.role = role;

	if (password !== undefined) {
		const passwordHash = await bcrypt.hash(password, 10);
		if (user.passwordHash === passwordHash) {
			throw new HttpException(400, { field: 'password', issue: 'New password must be different from the current password' });
		}
		userDataUpdate.passwordHash = passwordHash;
	}

	/*
	 * profile update data
	 */

	if (dateOfBirth !== undefined) profileDataUpdate.dateOfBirth = dateOfBirth ? new Date(dateOfBirth) : null;
	if (gender !== undefined) profileDataUpdate.gender = gender;
	if (unitPreference !== undefined) profileDataUpdate.unitPreference = unitPreference;
	if (heightCm !== undefined) profileDataUpdate.heightCm = heightCm;
	if (weekStartsOn !== undefined) profileDataUpdate.weekStartsOn = weekStartsOn;

	try {
		const user = formatUserResponse(
			await prisma.user.update({
				where: { id },
				include: { profile: true },
				data: {
					...userDataUpdate,
					profile: { update: profileDataUpdate },
				},
			})
		);

		return { ...user };
	} catch (err) {
		console.error('Error updating user:', err);
		throw new HttpException(500, 'Failed to update user');
	}
};

export const deleteProfile = async (id) => {
	try {
		await prisma.user.delete({ where: { id } });
	} catch (err) {
		throw new HttpException(500, 'Failed to delete user');
	}
};

// TODO: Add a utiliy function for image uploads
// TODO: lower resulutaion images for avatars
export const updateAvatar = async (userId, avatarFilename) => {
	const user = await prisma.user.findUnique({
		where: { id: userId },
		include: { profile: true },
	});

	if (!user) {
		throw new HttpException(404, 'User not found');
	}

	let oldAvatarFullPath;
	let newAvatarFullPath;

	try {
		// Prepare paths
		const newAvatarRelativePath = getImgPath(avatarFilename);
		newAvatarFullPath = getImgFullPath(avatarFilename);

		if (user?.profile?.avatar) {
			oldAvatarFullPath = getImgFullPath(user.profile.avatar);
		}

		// Save only the relative path in DB, but always use the full path for file ops
		const updatedUser = await prisma.user.update({
			where: { id: userId },
			include: { profile: true },
			data: {
				profile: {
					update: {
						avatar: newAvatarRelativePath,
					},
				},
			},
		});

		// Delete old avatar file if update was successful
		if (oldAvatarFullPath && fs.existsSync(oldAvatarFullPath)) {
			try {
				fs.unlinkSync(oldAvatarFullPath);
			} catch (err) {
				console.warn('Error deleting old avatar:', err);
			}
		}

		return formatUserResponse(updatedUser);
	} catch (err) {
		console.error('Error updating avatar:', err);

		// Delete new uploaded avatar file if DB update fails
		if (newAvatarFullPath && fs.existsSync(newAvatarFullPath)) {
			try {
				fs.unlinkSync(newAvatarFullPath);
			} catch (err) {
				console.warn('Failed to delete new avatar after DB error:', err);
			}
		}

		throw new HttpException(500, 'Failed to update avatar');
	}
};

export const deleteAvatar = async (userId) => {
	const user = await prisma.user.findUnique({
		where: { id: userId },
		include: { profile: true },
	});

	if (!user) {
		throw new HttpException(404, 'User not found');
	}

	if (!user?.profile?.avatar) {
		throw new HttpException(404, 'No avatar found for this user');
	}

	try {
		// Get avatar path before updating database
		const avatarFullPath = getImgFullPath(user.profile.avatar);

		// Update database to remove avatar
		const updatedUser = await prisma.user.update({
			where: { id: userId },
			include: { profile: true },
			data: {
				profile: {
					update: {
						avatar: null,
					},
				},
			},
		});

		// Delete avatar file if database update was successfull
		if (fs.existsSync(avatarFullPath)) {
			try {
				fs.unlinkSync(avatarFullPath);
			} catch (err) {
				console.warn('Error deleting avatar file:', err);
			}
		}

		return formatUserResponse(updatedUser);
	} catch (err) {
		console.error('Error deleting avatar:', err);
		throw new HttpException(500, 'Failed to delete avatar');
	}
};
