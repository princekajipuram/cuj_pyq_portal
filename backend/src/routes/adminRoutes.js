import express from 'express';
import { getStats, getUsers, deleteUser, updateUserRole } from '../controllers/adminController.js';
import { protect } from '../middleware/authMiddleware.js';
import authorize from '../middleware/roleMiddleware.js';

const router = express.Router();

// Enforce admin role across all subroutes
router.use(protect);
router.use(authorize('admin'));

router.get('/stats', getStats);
router.get('/users', getUsers);
router.route('/users/:id')
  .delete(deleteUser);
router.put('/users/:id/role', updateUserRole);

export default router;
