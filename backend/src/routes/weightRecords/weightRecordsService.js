import HttpException from '../../utils/httpException.js';
import prisma from '../../prisma/prismaClient.js';

const formatResponse = (weightRecord) => {
	const { id, weightKg, date, notes } = weightRecord;
	return {
		id,
		weightKg,
		date: date ? date.toISOString().split('T')[0] : null,
		notes,
	};
};

const validateRecordExistence = async (userId, date, shouldExist = true) => {
	const record = await prisma.weight_Record.findUnique({
		where: {
			userId_date: {
				userId,
				date: new Date(date),
			},
		},
		select: {
			id: true,
			weightKg: true,
			date: true,
			notes: true,
		},
	});

	if (shouldExist && !record) {
		throw new HttpException(404, 'Weight record not found for this user on this date');
	}

	if (!shouldExist && record) {
		throw new HttpException(400, 'Weight record already exists for this user on this date');
	}

	return record;
};

export const getWeightRecordByDate = async (userId, date) => {
	return formatResponse(await validateRecordExistence(userId, date, true));
};

export const getLatestWeightRecord = async (userId) => {
	const record = await prisma.weight_Record.findFirst({
		where: {
			userId,
		},
		select: {
			id: true,
			weightKg: true,
			date: true,
			notes: true,
		},
		orderBy: {
			date: 'desc',
		},
	});

	if (!record) {
		throw new HttpException(404, 'No weight records found for this user');
	}

	return formatResponse(record);
};

export const getEarliestWeightRecord = async (userId) => {
	const record = await prisma.weight_Record.findFirst({
		where: {
			userId,
		},
		select: {
			id: true,
			weightKg: true,
			date: true,
			notes: true,
		},
		orderBy: {
			date: 'asc',
		},
	});

	if (!record) {
		throw new HttpException(404, 'No weight records found for this user');
	}

	return formatResponse(record);
};

export const createWeightRecord = async (userId, weightRecordData) => {
	const { weightKg, date, notes } = weightRecordData;

	try {
		return formatResponse(
			await prisma.weight_Record.upsert({
				where: {
					userId_date: {
						userId,
						date: new Date(date),
					},
				},
				update: {
					weightKg,
					notes: notes !== undefined ? notes : null,
				},
				create: {
					user: { connect: { id: userId } },
					weightKg,
					date: new Date(date),
					notes: notes !== undefined ? notes : null,
				},
				select: {
					id: true,
					weightKg: true,
					date: true,
					notes: true,
				},
			})
		);
	} catch (err) {
		throw new HttpException(500, 'Failed to create weight record');
	}
};

export const updateWeightRecordByDate = async (userId, date, weightRecordData) => {
	const { weightKg, notes } = weightRecordData;
	await validateRecordExistence(userId, date, true);

	try {
		return formatResponse(
			await prisma.weight_Record.update({
				where: {
					userId_date: {
						userId,
						date: new Date(date),
					},
				},
				data: {
					...(weightKg !== undefined && { weightKg }),
					...(notes !== undefined && { notes }),
				},
				select: {
					id: true,
					weightKg: true,
					date: true,
					notes: true,
				},
			})
		);
	} catch (err) {
		throw new HttpException(500, 'Failed to update weight record');
	}
};

export const deleteWeightRecordByDate = async (userId, date) => {
	await validateRecordExistence(userId, date, true);

	try {
		return formatResponse(
			await prisma.weight_Record.delete({
				where: {
					userId_date: {
						userId,
						date: new Date(date),
					},
				},
			})
		);
	} catch (err) {
		throw new HttpException(500, 'Failed to delete weight record');
	}
};

export const getWeightRecordsInRange = async (userId, startDate, endDate) => {
	const dateRange = {};
	if (startDate) dateRange.gte = new Date(startDate);
	if (endDate) dateRange.lte = new Date(endDate);

	return await prisma.weight_Record.findMany({
		where: {
			userId,
			date: dateRange,
		},
		select: {
			id: true,
			weightKg: true,
			date: true,
			notes: true,
		},
		orderBy: {
			date: 'asc',
		},
	});
};

export const getWeightAverages = async (userId, group, startDate, endDate, weekStartsOn) => {
	/**
	 * the function groups the users weight entries by week, month, or year using real calendar boundaries
	 * (weeks start on Sunday, months on the 1st).
	 * it also ensures there is enough data to make the grouping meaningful
	 * so a weekly average, for example, is not calculated from fewer than seven entries.
	 */

	// Week starts on (0 = Sunday, 1 = Monday)
	const weekStart = weekStartsOn !== undefined ? parseInt(weekStartsOn) : 0; // Default to Sunday

	startDate = startDate ? new Date(startDate) : new Date(0);
	endDate = endDate ? new Date(endDate) : new Date();

	const groupByMap = {
		weekly: async () => {
			// Use EXTRACT/DATE_PART for clearer week boundaries
			// PostgreSQL equivalent of SQL Server's DATEPART()

			if (weekStart === 0) {
				// Sunday start: Use EXTRACT for precise week calculation
				// Add 1 day so Sunday becomes Monday for ISO week calculation
				return await prisma.$queryRaw`
					SELECT 
						CONCAT(
							EXTRACT(YEAR FROM date + INTERVAL '1 day'),
							'-',
							LPAD(EXTRACT(WEEK FROM date + INTERVAL '1 day')::TEXT, 2, '0')
						) AS week,
						ROUND(AVG("weightKg")::numeric, 1)::INT AS average
					FROM "Weight_Record"
					WHERE 
						"userId" = ${userId}
						AND date >= ${startDate}
						AND date <= ${endDate}
					GROUP BY 
						EXTRACT(YEAR FROM date + INTERVAL '1 day'),
						EXTRACT(WEEK FROM date + INTERVAL '1 day')
					ORDER BY 
						EXTRACT(YEAR FROM date + INTERVAL '1 day'),
						EXTRACT(WEEK FROM date + INTERVAL '1 day')
				`;
			} else {
				// Monday start:
				return await prisma.$queryRaw`
					SELECT 
						CONCAT(
							EXTRACT(YEAR FROM date),
							'-',
							LPAD(EXTRACT(WEEK FROM date)::TEXT, 2, '0')
						) AS week,
						ROUND(AVG("weightKg")::numeric, 1)::INT AS average
					FROM "Weight_Record"
					WHERE 
						"userId" = ${userId}
						AND date >= ${startDate}
						AND date <= ${endDate}
					GROUP BY 
						EXTRACT(YEAR FROM date),
						EXTRACT(WEEK FROM date)
					ORDER BY 
						EXTRACT(YEAR FROM date),
						EXTRACT(WEEK FROM date)
				`;
			}
		},
		monthly: async () =>
			await prisma.$queryRaw`
			SELECT 
				TO_CHAR(date, 'YYYY-MM') AS month,
				ROUND(AVG("weightKg")::numeric, 1)::INT AS average
			FROM "Weight_Record"
			WHERE 
				"userId" = ${userId}
				AND date >= ${startDate}
				AND date <= ${endDate}
			GROUP BY TO_CHAR(date, 'YYYY-MM')
			ORDER BY TO_CHAR(date, 'YYYY-MM')
		`,
		yearly: async () =>
			await prisma.$queryRaw`
			SELECT 
				TO_CHAR(date, 'YYYY') AS year,
				ROUND(AVG("weightKg")::numeric, 1)::INT AS average
			FROM "Weight_Record"
			WHERE 
				"userId" = ${userId}
				AND date >= ${startDate}
				AND date <= ${endDate}
			GROUP BY TO_CHAR(date, 'YYYY')
			ORDER BY TO_CHAR(date, 'YYYY')
		`,
	};

	const results = await groupByMap[group]();

	// Convert the average from string to number
	return results.map((result) => ({
		...result,
		average: parseFloat(result.average),
	}));
};
