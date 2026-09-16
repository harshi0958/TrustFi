import { Router } from "express";

import {
  registerAdmin,
  requestAdminOTP,
  verifyAdminOTP,
  getAdminDashboard,
  getAdminUsers,
} from "../controllers/admin.controller";

const router = Router();

router.post("/register", registerAdmin);

router.post("/request-otp", requestAdminOTP);

router.post("/verify-otp", verifyAdminOTP);

router.get("/dashboard", getAdminDashboard);

router.get("/users", getAdminUsers);

export default router;