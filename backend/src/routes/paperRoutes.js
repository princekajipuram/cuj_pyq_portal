import express from 'express';
import multer from 'multer';
import {
  getPapers,
  getPaperById,
  uploadPaper,
  deletePaper,
  getQuestions
} from '../controllers/paperController.js';
import { protect } from '../middleware/authMiddleware.js';
import authorize from '../middleware/roleMiddleware.js';

const router = express.Router();

// Multer in-memory storage config
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 15 * 1024 * 1024 // Limit files to 15MB
  },
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype === 'application/pdf' ||
      file.mimetype.startsWith('image/')
    ) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file format. Only PDF and Images (PNG, JPG, JPEG) are allowed.'), false);
    }
  }
});

// Questions list route
router.get('/questions', getQuestions);

// Papers routes
router
  .route('/')
  .get(getPapers)
  .post(protect, authorize('admin'), upload.single('file'), uploadPaper);

router
  .route('/:id')
  .get(getPaperById)
  .delete(protect, authorize('admin'), deletePaper);

export default router;
