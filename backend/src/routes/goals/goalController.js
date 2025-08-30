import { Router } from "express";
import verify from "../../middlewares/schemaValidationMiddleware.js";
import requireAuth from "../../middlewares/isAuthenticatedMiddleware.js";
import { getGoal, createGoal, updateGoal, deleteGoal } from "./goalService.js";
import { updateGoalSchema, createGoalSchema } from "./goalSchemas.js";
const router = Router();


/**
 * @route {GET} goals/
 * @desc  Get user goal
 * @auth  requierd
 */
router.get("/", requireAuth, async (req, res) => {
    const goal = await getGoal(req.user.id);
    res.status(200).json(goal);
});

/**
 * @route     {POST} goals/
 * @desc      Create new goal
 * @bodyparam targetWeightKg, targetDate, startWeightKg, startDate
 * @auth      requierd
 */
router.post("/", requireAuth, verify(createGoalSchema), async (req, res) => {
	const goal = await createGoal(req.user.id, req.body);
	res.status(200).json(goal);
});

/**
 * @route     {PATCH} goals/
 * @desc      Create new goal
 * @bodyparam targetWeightKg, targetDate, startWeightKg, startDate
 * @auth      requierd
 */
router.patch("/", requireAuth, verify(updateGoalSchema), async (req, res) => {
	const goal = await updateGoal(req.user.id, req.body);
	res.status(200).json(goal);
});

/**
 * @route {DELETE} goals/
 * @desc  Delete goal
 * @auth  requierd
 */
router.delete("/", requireAuth, async (req, res) => {
    await deleteGoal(req.user.id);
	res.status(204).send();
});

export default router;