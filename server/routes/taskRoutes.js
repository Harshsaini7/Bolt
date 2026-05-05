import express from 'express';
import { updateTask, deleteTask, getDashboard } from '../controllers/taskController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Dashboard
router.get('/dashboard', protect, getDashboard);

// Task operations (by taskId, not nested under project)
router
  .route('/:taskId')
  .put(protect, updateTask)
  .delete(protect, deleteTask);

export default router;
