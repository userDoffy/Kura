import express from 'express';
import { protectRoute } from "../middleware/auth.middleware.js";
import { adminLogin,logout, getUsers,getMessages} from "../controllers/admin.controller.js";

const router = express.Router();

router.post("/login",adminLogin);
router.post("/logout",logout);
router.get("/getUsers",protectRoute,getUsers);
router.get("/getMessages",protectRoute,getMessages);

export default router;