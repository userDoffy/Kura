// src/routes/chat.route.js
import express from 'express';
import { protectRoute } from '../middleware/auth.middleware.js';
import {  getChatList} from '../controllers/chat.controller.js';

const router = express.Router();

router.get("/getChatList", protectRoute, getChatList);
export default router;

