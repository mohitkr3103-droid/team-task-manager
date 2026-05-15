import express from 'express';
import { getProjects, getProject, createProject, updateProject, deleteProject, addMember, removeMember } from '../controllers/projectController.js';
import { protect, authorize } from '../middleware/auth.js';
import { createProjectValidator, updateProjectValidator, mongoIdValidator } from '../middleware/validators.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getProjects)
  .post(authorize('admin'), createProjectValidator, createProject);

router.route('/:id')
  .get(mongoIdValidator, getProject)
  .put(authorize('admin'), updateProjectValidator, updateProject)
  .delete(authorize('admin'), mongoIdValidator, deleteProject);

router.post('/:id/members', authorize('admin'), addMember);
router.delete('/:id/members/:userId', authorize('admin'), removeMember);

export default router;
