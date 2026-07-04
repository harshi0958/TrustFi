import { Router } from "express";

import {
  applyLoan,
  getLoans,
  approveLoan,
} from "../controllers/loan.controller";

const router = Router();

router.post("/apply", applyLoan);

router.get("/", getLoans);

router.patch("/approve/:id", approveLoan);

export default router;