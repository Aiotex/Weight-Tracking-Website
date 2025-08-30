import {
	randEmail,
	randFullName,
	randLines,
	randParagraph,
	randPassword,
	randPhrase,
	randWord,
	randFloat,
	randPastDate,
	randFutureDate,
	randRecentDate,
	randBetweenDate,
} from '@ngneat/falso';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { hashToken } from '../src/utils/jwtUtils.js';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

async function main() {
	// Clear existing data
	console.log('🗑️  Clearing existing data...');
	await prisma.refresh_Token.deleteMany();
	await prisma.weight_Record.deleteMany();
	await prisma.goal.deleteMany();
	await prisma.profile.deleteMany();
	await prisma.user.deleteMany();

	console.log('🌱 Starting seed...');

	// Create 3 users with comprehensive data
	const users = [
		{
			firstName: 'John',
			lastName: 'Doe',
			email: 'john.doe@example.com',
			password: 'password123',
			role: 'USER',
			profile: {
				heightCm: 175.5,
				dateOfBirth: new Date('1990-05-15'),
				gender: 'MALE',
				unitPreference: 'METRIC',
			},
			goal: {
				targetWeightKg: 75.0,
				targetDate: new Date('2025-12-31'),
				startWeightKg: 85.0,
				startDate: new Date('2025-01-01'),
			},
		},
		{
			firstName: 'Jane',
			lastName: 'Smith',
			email: 'jane.smith@example.com',
			password: 'securepass456',
			role: 'USER',
			profile: {
				heightCm: 165.0,
				dateOfBirth: new Date('1992-08-22'),
				gender: 'FEMALE',
				unitPreference: 'IMPERIAL',
			},
			goal: {
				targetWeightKg: 60.0,
				targetDate: new Date('2025-10-31'),
				startWeightKg: 70.0,
				startDate: new Date('2025-02-01'),
			},
		},
		{
			firstName: 'Alex',
			lastName: 'Johnson',
			email: 'alex.johnson@example.com',
			password: 'mypassword789',
			role: 'ADMIN',
			profile: {
				heightCm: 180.0,
				dateOfBirth: new Date('1988-12-10'),
				gender: 'OTHER',
				unitPreference: 'METRIC',
			},
			goal: {
				targetWeightKg: 80.0,
				targetDate: new Date('2025-09-30'),
				startWeightKg: 78.0,
				startDate: new Date('2025-03-01'),
			},
		},
	];

	for (let i = 0; i < users.length; i++) {
		const userData = users[i];
		console.log(`👤 Creating user ${i + 1}: ${userData.firstName} ${userData.lastName}`);

		// Hash password
		const passwordHash = await bcrypt.hash(userData.password, 10);

		// Create user
		const user = await prisma.user.create({
			data: {
				firstName: userData.firstName,
				lastName: userData.lastName,
				email: userData.email,
				passwordHash: passwordHash,
				role: userData.role,
			},
		});

		// Create profile
		await prisma.profile.create({
			data: {
				userId: user.id,
				heightCm: userData.profile.heightCm,
				dateOfBirth: userData.profile.dateOfBirth,
				gender: userData.profile.gender,
				unitPreference: userData.profile.unitPreference,
			},
		});

		// Create goal
		await prisma.goal.create({
			data: {
				userId: user.id,
				targetWeightKg: userData.goal.targetWeightKg,
				targetDate: userData.goal.targetDate,
				startWeightKg: userData.goal.startWeightKg,
				startDate: userData.goal.startDate,
			},
		});

		// Create weight records (simulate weekly weigh-ins)
		const startDate = new Date(userData.goal.startDate);
		const currentDate = new Date();
		const weightRecords = [];

		let recordDate = new Date(startDate);
		let currentWeight = userData.goal.startWeightKg;
		const weightDifference = userData.goal.targetWeightKg - userData.goal.startWeightKg;
		const daysUntilTarget = Math.ceil((userData.goal.targetDate - startDate) / (1000 * 60 * 60 * 24));
		const weeklyWeightChange = (weightDifference / daysUntilTarget) * 7;

		// Generate weight records up to current date
		while (recordDate <= currentDate) {
			// Add some random variation to make it realistic
			const variation = randFloat({ min: -0.5, max: 0.5 });
			const recordWeight = Math.round((currentWeight + variation) * 10) / 10;

			weightRecords.push({
				userId: user.id,
				weightKg: recordWeight,
				date: new Date(recordDate),
				notes: i % 3 === 0 ? randPhrase() : null, // Add notes to some records
			});

			// Move to next week and adjust weight
			recordDate.setDate(recordDate.getDate() + 7);
			currentWeight += weeklyWeightChange;
		}

		// Create weight records in batches
		for (const record of weightRecords) {
			await prisma.weight_Record.create({
				data: record,
			});
		}

		// Create refresh token
		const refreshToken = jwt.sign({ userId: user.id }, process.env.JWT_REFRESH_SECRET || 'refresh_secret', { expiresIn: '7d' });

		const tokenHash = hashToken(refreshToken);

		await prisma.refresh_Token.create({
			data: {
				userId: user.id,
				tokenHash: tokenHash,
				revoked: false,
			},
		});

		console.log(`✅ Created user ${userData.firstName} with ${weightRecords.length} weight records`);
	}

	console.log('🎉 Seed completed successfully!');

	// Print summary
	const userCount = await prisma.user.count();
	const profileCount = await prisma.profile.count();
	const goalCount = await prisma.goal.count();
	const weightRecordCount = await prisma.weight_Record.count();
	const refreshTokenCount = await prisma.refresh_Token.count();

	console.log('\n📊 Database Summary:');
	console.log(`Users: ${userCount}`);
	console.log(`Profiles: ${profileCount}`);
	console.log(`Goals: ${goalCount}`);
	console.log(`Weight Records: ${weightRecordCount}`);
	console.log(`Refresh Tokens: ${refreshTokenCount}`);
}

main()
	.then(async () => {
		await prisma.$disconnect();
	})
	.catch(async (e) => {
		console.error(e);
		await prisma.$disconnect();
		process.exit(1);
	});
