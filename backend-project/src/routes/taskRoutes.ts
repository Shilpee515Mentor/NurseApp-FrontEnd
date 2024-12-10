import express from 'express';
import { getNurseTasks, createTask, updateTaskStatus } from '../controllers/taskController';
import { protect } from '../middleware/auth';

const router = express.Router();

// Get tasks for a nurse
router.get('/nurse', protect, getNurseTasks);

// Create a new task
router.post('/', protect, createTask);

// Update task status
router.put('/:taskId/status', protect, updateTaskStatus);

export default router;
