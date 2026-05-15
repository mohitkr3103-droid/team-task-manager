import express from 'express';
import { getTasks, getTask, createTask, updateTask, deleteTask, addComment, getDashboardStats } from '../controllers/taskController.js';
import { protect, authorize } from '../middleware/auth.js';
import { createTaskValidator, updateTaskValidator, addCommentValidator, mongoIdValidator } from '../middleware/validators.js';

const router = express.Router();

router.use(protect);

router.get('/dashboard-stats', getDashboardStats);

router.route('/')
  .get(getTasks)
  .post(authorize('admin'), createTaskValidator, createTask);

router.route('/:id')
  .get(mongoIdValidator, getTask)
  .put(updateTaskValidator, updateTask)
  .delete(authorize('admin'), mongoIdValidator, deleteTask);

router.post('/:id/comments', addCommentValidator, addComment);

export default router;
