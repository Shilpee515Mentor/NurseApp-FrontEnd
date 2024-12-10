import express from 'express';
import { getConversation, sendMessage, getNurses, markMessageAsRead } from '../controllers/messageController';
import { protect } from '../middleware/auth';

const router = express.Router();

// Get conversation messages
router.get('/conversation/:nurseId', protect, getConversation);

// Send a message
router.post('/send', protect, sendMessage);

// Mark a message as read
router.put('/:messageId/read', protect, markMessageAsRead);

// Get all nurses
router.get('/nurses', protect, getNurses);

export default router;
