import { Router } from "express";
import {
  applyLoan,
  getLoans,
  approveLoan,
  rejectLoan,
  getLoanByEmail,
  calculateLoanRisk,
} from "../controllers/loan.controller";
import { requireAdmin } from "../middleware/requireAdmin";

const router = Router();

router.post("/apply", applyLoan);
router.post("/risk", calculateLoanRisk);
router.get("/:email", getLoanByEmail);
router.get("/", requireAdmin, getLoans);
router.patch("/approve/:id", requireAdmin, approveLoan);
router.patch("/reject/:id", requireAdmin, rejectLoan);

export default router;