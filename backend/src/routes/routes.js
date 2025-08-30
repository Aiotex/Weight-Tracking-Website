import { Router } from 'express'
import authRoutes from './auth/authController.js'
import profileRoutes from "./profiles/profileController.js";
import goalRoutes from "./goals/goalController.js";
import weightRecordRoutes from "./weightRecords/weightRecordsController.js";

const api = Router()
	.use("/auth", authRoutes)
	.use("/users", profileRoutes)
	.use("/goals", goalRoutes)
	.use("/weights", weightRecordRoutes);

export default Router().use('/api', api);