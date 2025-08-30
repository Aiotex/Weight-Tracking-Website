import { Router } from 'express';
import verify from '../../middlewares/schemaValidationMiddleware.js';
import requireAuth from '../../middlewares/isAuthenticatedMiddleware.js';
import {
	createWeightRecord,
	getWeightRecordsInRange,
	getWeightRecordByDate,
	getLatestWeightRecord,
	getEarliestWeightRecord,
	updateWeightRecordByDate,
	deleteWeightRecordByDate,
	getWeightAverages,
} from './weightRecordsService.js';
import { getRecordsInRangeSchema, getWeightAveragesSchema, createWeightSchema, updateWeightSchema } from './weightRecordsSchemas.js';

const router = Router();

/**
 * @route     {GET} weights/date/:date
 * @desc      Get weight record by date
 * @auth      required
 */
router.get('/date/:date', requireAuth, async (req, res) => {
	const record = await getWeightRecordByDate(req.user.id, req.params.date);
	res.status(200).json(record);
});

/**
 * @route     {GET} weights/latest
 * @desc      Get latest weight record for user
 * @auth      required
 */
router.get('/latest', requireAuth, async (req, res) => {
	const record = await getLatestWeightRecord(req.user.id);
	res.status(200).json(record);
});

/**
 * @route     {GET} weights/earliest
 * @desc      Get earliest weight record for user
 * @auth      required
 */
router.get('/earliest', requireAuth, async (req, res) => {
	const record = await getEarliestWeightRecord(req.user.id);
	res.status(200).json(record);
});

/**
 * @route     {POST} weights/
 * @desc      Create or edit a record with optional notes
 * @bodyparam weightKg, date, notes?
 * @auth      required
 */
router.post('/', requireAuth, verify(createWeightSchema), async (req, res) => {
	const record = await createWeightRecord(req.user.id, req.body);
	res.status(201).json(record);
});

// Not needed beacuse the POST route handles both creation and updates

// /**
//  * @route     {patch} weights/date/:date
//  * @desc      Update weight record by date
//  * @bodyparam weightKg?, notes?
//  * @auth      required
//  */
// router.patch('/date/:date', requireAuth, verify(updateWeightSchema), async (req, res) => {
// 	const record = await updateWeightRecordByDate(req.user.id, req.params.date, req.body);
// 	res.status(200).json(record);
// });

/**
 * @route     {DELETE} weights/date/:date
 * @desc      Delete weight record by date
 * @auth      required
 */
router.delete('/date/:date', requireAuth, async (req, res) => {
	await deleteWeightRecordByDate(req.user.id, req.params.date);
	res.status(204).send();
});

/**
 * @route     {GET} weights/
 * @desc      Get all weight records for user (optional date range)
 * @query     start_date?, end_date? (format: YYYY-MM-DD)
 * @auth      required
 */
router.get('/', requireAuth, verify(getRecordsInRangeSchema), async (req, res) => {
	const { start_date, end_date } = req.query;
	const records = await getWeightRecordsInRange(req.user.id, start_date, end_date);
	res.status(200).json(records);
});

/**
 * @route     {GET} weights/average/:group
 * @desc      Get weight averages by group (weekly, monthly, yearly)
 * @query     start_date?, end_date?
 * @auth      required
 */
router.get('/average/:group', requireAuth, verify(getWeightAveragesSchema), async (req, res) => {
	const { start_date, end_date, week_starts_on } = req.query;
	const averages = await getWeightAverages(req.user.id, req.params.group, start_date, end_date, week_starts_on);
	res.status(200).json(averages);
});

export default router;
