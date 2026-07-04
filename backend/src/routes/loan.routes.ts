import { Router } from "express";
import { applyLoan, getLoans } from "../controllers/loan.controller";


const router = Router();

router.post("/apply", applyLoan);
router.get("/", getLoans);

export default router;