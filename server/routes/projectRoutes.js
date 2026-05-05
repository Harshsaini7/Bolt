import express from 'express';
import {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
} from '../controllers/projectController.js';
import { createTask, getTasks } from '../controllers/taskController.js';
import { protect } from '../middleware/auth.js';
import { requireProjectMember, requireProjectAdmin } from '../middleware/rbac.js';

const router = express.Router();

// Project CRUD
router
  .route('/')
  .post(protect, createProject)
  .get(protect, getProjects);

router
  .route('/:id')
  .get(protect, requireProjectMember, getProject)
  .put(protect, requireProjectAdmin, updateProject)
  .delete(protect, requireProjectAdmin, deleteProject);

// Member management
router
  .route('/:id/members')
  .post(protect, requireProjectAdmin, addMember);

router
  .route('/:id/members/:userId')
  .delete(protect, requireProjectAdmin, removeMember);

// Tasks within a project
router
  .route('/:id/tasks')
  .post(protect, requireProjectAdmin, createTask)
  .get(protect, requireProjectMember, getTasks);

export default router;
