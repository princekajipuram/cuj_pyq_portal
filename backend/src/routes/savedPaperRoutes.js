import express from 'express';
import { getSavedPapers, toggleSavePaper } from '../controllers/savedPaperController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect); // Secure all bookmark endpoints

router.route('/').get(getSavedPapers);
router.route('/:paperId').post(toggleSavePaper);

export default router;
