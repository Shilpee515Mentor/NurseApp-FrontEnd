import { Router } from 'express';
import { protect, authorize } from '../middleware/auth';
import { UserRole } from '../types';
import {
  createRequest,
  getRequests,
  updateRequest,
  getNursePatients,
  updateRequestStatus,
} from '../controllers/requestController';
import { validateRequest, validateRequestStatus } from '../middleware/validation';

const router = Router();

router.use(protect);

// Routes accessible by all authenticated users
router.post('/', validateRequest, createRequest);
router.get('/', getRequests);

// Nurse-specific routes
router.get('/my-patients', authorize(UserRole.NURSE), getNursePatients);
router.patch('/:requestId/status', authorize(UserRole.NURSE), validateRequestStatus, updateRequestStatus);

// Routes for updating requests
router.patch('/:id', validateRequest, updateRequest);

export default router;