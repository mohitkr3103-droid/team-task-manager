import express from 'express';
import { register, login, getProfile, updateProfile, changePassword } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { registerValidator, loginValidator } from '../middleware/validators.js';

const router = express.Router();

router.post('/register', registerValidator, register);
router.post('/login', loginValidator, login);
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);

export default router;
