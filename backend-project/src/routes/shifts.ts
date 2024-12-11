import express from 'express';
import { protect,authorize } from '../middleware/auth';
import {
  createShift,
  getNurseShifts,
  updateShift,
  deleteShift,
  getDepartmentShifts
} from '../controllers/shiftController';
import { UserRole } from '../types';

const router = express.Router();

// Protected routes - require authentication
router.use(protect);

// Routes for both nurses and admins
router.get('/nurse/:nurseId', getNurseShifts);

// Admin only routes
router.post('/', authorize(UserRole.ADMIN), createShift);
router.put('/:shiftId', authorize(UserRole.ADMIN), updateShift);
router.delete('/:shiftId', authorize(UserRole.ADMIN), deleteShift);
router.get('/department', authorize(UserRole.ADMIN), getDepartmentShifts);

export default router;
