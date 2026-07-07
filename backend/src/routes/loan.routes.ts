import { Router } from "express";
import {
  applyLoan,
  getLoans,
  approveLoan,
  rejectLoan,
  getLoanByEmail,
} from "../controllers/loan.controller";

const router = Router();

router.post("/apply", applyLoan);
router.get("/", getLoans);
router.get("/:email", getLoanByEmail);
router.patch("/approve/:id", approveLoan);
router.patch("/reject/:id", rejectLoan);

export default router;