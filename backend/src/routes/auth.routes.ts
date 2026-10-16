
import { Router } from "express";
import {
  registerUser,
  sendOTP,
  verifyOTP,
  getCurrentUser,
  logoutUser,
} from "../controllers/auth.controller";

const router = Router();

router.post("/register", registerUser);
router.post("/send-otp", sendOTP);
router.post("/verify-otp", verifyOTP);
router.get("/me", getCurrentUser);
router.post("/logout", logoutUser);

export default router;
