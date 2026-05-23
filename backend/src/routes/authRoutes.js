import express from 'express';
import { body } from 'express-validator';
import { signup, login, getMe } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import validateResult from '../middleware/validate.js';

const router = express.Router();

router.post(
  '/signup',
  [
    body('name', 'Name is required and should not exceed 50 characters').not().isEmpty().isLength({ max: 50 }),
    body('email', 'Please include a valid email address').isEmail(),
    body('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 }),
    validateResult
  ],
  signup
);

router.post(
  '/login',
  [
    body('email', 'Please include a valid email address').isEmail(),
    body('password', 'Password is required').exists(),
    validateResult
  ],
  login
);

router.get('/me', protect, getMe);

export default router;
