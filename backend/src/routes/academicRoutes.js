import express from 'express';
import {
  getDepartments,
  createDepartment,
  getBranches,
  createBranch,
  getSemesters,
  getSubjects,
  createSubject
} from '../controllers/academicController.js';
import { protect } from '../middleware/authMiddleware.js';
import authorize from '../middleware/roleMiddleware.js';

const router = express.Router();

// Public reads, Admin writes
router
  .route('/departments')
  .get(getDepartments)
  .post(protect, authorize('admin'), createDepartment);

router.get('/departments/:deptId/branches', getBranches);
router.post('/branches', protect, authorize('admin'), createBranch);

router.get('/semesters', getSemesters);

router.get('/branches/:branchId/subjects', getSubjects);
router.post('/subjects', protect, authorize('admin'), createSubject);

export default router;
