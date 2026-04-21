// routes/tasksRoute.js
import express from 'express';
import tasksController from '../controllers/dashboardController.js';
import protect from '../Middleware/authMiddleware.js';

const router = express.Router();

router.get('/stats', protect, (req, res) => tasksController.getTaskStats(req, res));

export default router;
