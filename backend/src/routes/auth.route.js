import express from 'express';
import { signup, login, logout, sendVerificationCode } from '../controllers/auth.controller.js';
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

// Public routes
router.post("/send-verification", sendVerificationCode); // Send code before signup
router.post("/signup", signup); // Complete signup with verification
router.post("/login", login);

// Protected routes
router.post("/logout", protectRoute, logout); // For existing users (optional)

router.get("/user", protectRoute, (req, res) => {
  res.status(200).json({ success: true, user: req.user });
});

export default router;