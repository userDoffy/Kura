// src/routes/chat.route.js
import express from 'express';
import { protectRoute } from '../middleware/auth.middleware.js';
import { 
  getMessages, 
  sendMessage, 
  markAsRead, 
  getChatList, 
  deleteMessage,
  getUnreadCounts,
} from '../controllers/chat.controller.js';

const router = express.Router();

// router.get('/health', protectRoute, getChatHealth);
// router.get('/stats', protectRoute, getChatStats);

router.get('/unread-counts', protectRoute, getUnreadCounts);
router.get('/', protectRoute, getChatList);
router.get('/:receiverId', protectRoute, getMessages);
router.post('/send', protectRoute, sendMessage);
router.patch('/read/:chatId', protectRoute, markAsRead);
router.delete('/message/:messageId', protectRoute, deleteMessage);

export default router;

