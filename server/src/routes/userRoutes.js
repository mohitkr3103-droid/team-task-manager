import express from 'express';
import { getUsers, getUser, updateUser, deleteUser } from '../controllers/userController.js';
import { protect, authorize } from '../middleware/auth.js';
import { mongoIdValidator } from '../middleware/validators.js';

const router = express.Router();

router.use(protect);

router.get('/', getUsers);

router.route('/:id')
  .get(mongoIdValidator, getUser)
  .put(mongoIdValidator, updateUser)
  .delete(authorize('admin'), mongoIdValidator, deleteUser);

export default router;
