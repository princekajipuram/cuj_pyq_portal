import express from 'express';
import { createReport, getReports, updateReportStatus } from '../controllers/reportController.js';
import { protect } from '../middleware/authMiddleware.js';
import authorize from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(protect); // All reports endpoints require login

router.post('/', createReport);
router.get('/', authorize('admin'), getReports);
router.put('/:id', authorize('admin'), updateReportStatus);

export default router;
