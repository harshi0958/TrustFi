import { Router } from "express";

import {
  createPaymentOrder,
  verifyPayment,
} from "../controllers/payment.controller";
import { requireCustomer } from "../middleware/requireCustomer";

const router = Router();

router.post(
  "/create-order",
  requireCustomer,
  createPaymentOrder
);

router.post(
  "/verify",
  requireCustomer,
  verifyPayment
);

export default router;