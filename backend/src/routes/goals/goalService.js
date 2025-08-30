import HttpException from "../../utils/httpException.js"
import prisma from "../../prisma/prismaClient.js";

const formatGoalResponse = (goal) => {
	const { targetWeightKg, targetDate, startWeightKg, startDate } = goal;
	return {
		targetWeightKg,	
		targetDate: targetDate ? targetDate.toISOString().split("T")[0] : null,
		startWeightKg,
		startDate: startDate ? startDate.toISOString().split("T")[0] : null,
	};
};

const validateGoalExistence = async (userId, shouldExist = true) => {
	const goal = await prisma.goal.findUnique({ where: { userId }});

	if (shouldExist && !goal) {
		throw new HttpException(404, "Goal not found for this user");
	}

	if (!shouldExist && goal) {
		throw new HttpException(400, "Goal already exists for this user");
	}

	return goal;
};

export const getGoal = async (userId) => {
    return formatGoalResponse(
		await validateGoalExistence(userId, true)
	) 
}

export const createGoal = async (userId, goalData) => {
    await validateGoalExistence(userId, false);

	try {
		return formatGoalResponse(
			await prisma.goal.create({
				data: {
					user: { connect: { id: userId } },
					targetWeightKg: goalData.targetWeightKg,
					targetDate: new Date(goalData.targetDate),
					startWeightKg: goalData.startWeightKg,
					startDate: new Date(goalData.startDate),
				},
				select: {
					targetWeightKg: true,
					targetDate: true,
					startWeightKg: true,
					startDate: true,
				},
			})
		); 
	} catch (err) {
		throw new HttpException(500, "Failed to create goal");
	}
};

export const updateGoal = async (userId, updateData) => {
    await validateGoalExistence(userId, true);

	const { targetWeightKg, targetDate, startWeightKg, startDate } = updateData;
	const goalDataUpdate = {};

	if (targetWeightKg !== undefined) {
		goalDataUpdate.targetWeightKg = targetWeightKg;
	}
	if (targetDate !== undefined) {
		goalDataUpdate.targetDate = new Date(targetDate);
	}
	if (startWeightKg !== undefined) {
		goalDataUpdate.startWeightKg = startWeightKg;
	}
	if (startDate !== undefined) {
		goalDataUpdate.startDate = new Date(startDate);
	}

	try {
		return formatGoalResponse(
			await prisma.goal.update({
				where: { userId },
				data: { ...goalDataUpdate },
				select: {
					targetWeightKg: true,
					targetDate: true,
					startWeightKg: true,
					startDate: true,
				},
			})
		);	 
	} catch (err) {
		throw new HttpException(500, "Failed to update goal");
	}
};

export const deleteGoal = async (userId) => {
    await validateGoalExistence(userId, true);

    try {
        await prisma.goal.delete({ where: { userId } });
    } catch (err) {
        throw new HttpException(500, "Failed to delete goal");
    }
};

