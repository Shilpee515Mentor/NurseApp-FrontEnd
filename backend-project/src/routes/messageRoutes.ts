import express from 'express';
import { getConversation, sendMessage, getNurses } from '../controllers/messageController';
import { protect } from '../middleware/auth';

const router = express.Router();

// Get conversation messages
router.get('/conversation/:nurseId', protect, getConversation);

// Send a message
router.post('/send', protect, sendMessage);

// Get all nurses
router.get('/nurses', protect, getNurses);

export default router;
