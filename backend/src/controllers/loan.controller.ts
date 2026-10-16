import { Request, Response } from "express";
import prisma from "../lib/prisma";
import { calculateRisk } from "../services/risk.service";

export const applyLoan = async (req: Request, res: Response) => {
  console.log("BODY:", req.body);

  try {
    const {
      fullName,
      email,
      phone,
      monthlyIncome,
      loanType,
      loanAmount,
      loanMonths,
      purpose,
      creditScore,
      occupation,
      documentsVerified,
      bankVerified,

      // Fraud Detection
      fraudRisk,
      fraudFlags,

      // Property Loan
      propertyType,
      propertyValue,
      propertyAddress,
      ownershipStatus,

      // Gold Loan
      goldWeight,
      goldPurity,
      goldValue,
      goldOwnership,
    } = req.body;

    /* ---------------- VALIDATION ---------------- */

    if (
      !fullName ||
      !email ||
      !phone ||
      monthlyIncome === undefined ||
      !loanType ||
      loanAmount === undefined ||
      !loanMonths ||
      !purpose ||
      !occupation ||
      documentsVerified === undefined ||
      bankVerified === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing required loan application fields.",
      });
    }

    /* ---------------- LOAN TYPE VALIDATION ---------------- */

    const allowedLoanTypes = [
      "PERSONAL",
      "PROPERTY",
      "GOLD",
    ];

    if (!allowedLoanTypes.includes(loanType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid loan type.",
        allowedLoanTypes,
      });
    }

    /* ---------------- CREDIT / RISK / FRAUD ---------------- */

    const score = calculateRisk({
      monthlyIncome: Number(monthlyIncome),
      loanAmount: Number(loanAmount),
      loanMonths: Number(loanMonths),
      creditScore: Number(creditScore || 0),

      occupation: String(occupation),
      documentsVerified: Boolean(documentsVerified),
      bankVerified: Boolean(bankVerified),

      fraudRisk:
        fraudRisk !== undefined
          ? Number(fraudRisk)
          : undefined,

      fraudFlags:
        Array.isArray(fraudFlags)
          ? fraudFlags
          : [],
    });

    /* ---------------- CREATE LOAN ---------------- */

    const loan = await prisma.loanApplication.create({
      data: {
        fullName,
        email,
        phone,

        monthlyIncome: Number(monthlyIncome),

        loanType,

        loanAmount: Number(loanAmount),
        loanMonths: Number(loanMonths),
        purpose,

        // =========================
        // PROPERTY LOAN DETAILS
        // =========================

        propertyType:
          loanType === "PROPERTY"
            ? propertyType || null
            : null,

        propertyValue:
          loanType === "PROPERTY"
            ? Number(propertyValue || 0)
            : null,

        propertyAddress:
          loanType === "PROPERTY"
            ? propertyAddress || null
            : null,

        ownershipStatus:
          loanType === "PROPERTY"
            ? ownershipStatus || null
            : null,

        // =========================
        // GOLD LOAN DETAILS
        // =========================

        goldWeight:
          loanType === "GOLD"
            ? Number(goldWeight || 0)
            : null,

        goldPurity:
          loanType === "GOLD"
            ? goldPurity || null
            : null,

        goldValue:
          loanType === "GOLD"
            ? Number(goldValue || 0)
            : null,

        goldOwnership:
          loanType === "GOLD"
            ? goldOwnership || null
            : null,

        // =========================
        // AI / RISK RESULT
        // =========================

        // IMPORTANT:
        // Save the SERVER-CALCULATED score,
        // not the client-supplied creditScore.
        creditScore: score.score,

        risk: score.risk,
        eligibility: score.eligibility,
        interestRate: score.interestRate,

        // =========================
        // FRAUD DETECTION
        // =========================

        fraudScore: score.fraudScore,

        fraudRisk: score.fraudRisk,

        fraudFlags:
          score.fraudFlags.length > 0
            ? JSON.stringify(score.fraudFlags)
            : null,

        riskReasons:
          score.riskReasons.length > 0
            ? JSON.stringify(score.riskReasons)
            : null,

        status: "PENDING",
      },
    });

    /* ---------------- RESPONSE ---------------- */

    return res.json({
      success: true,
      message: "Loan application submitted successfully.",
      loan,

      riskAssessment: {
        score: score.score,
        risk: score.risk,
        eligibility: score.eligibility,
        interestRate: score.interestRate,
        approved: score.approved,
        eligibleAmount: score.eligibleAmount,
        emi: score.emi,
      },

      fraudAssessment: {
        fraudScore: score.fraudScore,
        fraudRisk: score.fraudRisk,
        fraudFlags: score.fraudFlags,
      },

      riskReasons: score.riskReasons,
    });

  } catch (error: any) {
    console.error("Loan Application Error:", error);

    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/* ========================================================= */
/* GET ALL LOANS */
/* ========================================================= */

export const getLoans = async (
  req: Request,
  res: Response
) => {
  try {
    const loans =
      await prisma.loanApplication.findMany({
        orderBy: {
          createdAt: "desc",
        },
      });

    return res.json(loans);

  } catch (error: any) {
    console.error("Get Loans Error:", error);

    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/* ========================================================= */
/* GET LOAN BY EMAIL */
/* ========================================================= */

export const getLoanByEmail = async (
  req: Request,
  res: Response
) => {
  try {
    const email = String(req.params.email);

    const loan =
      await prisma.loanApplication.findFirst({
        where: {
          email,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

    return res.json(loan);

  } catch (error: any) {
    console.error(
      "Get Loan By Email Error:",
      error
    );

    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/* ========================================================= */
/* APPROVE LOAN */
/* ========================================================= */

export const approveLoan = async (
  req: Request,
  res: Response
) => {
  try {
    const id = String(req.params.id);

    const loan =
      await prisma.loanApplication.update({
        where: {
          id,
        },
        data: {
          status: "APPROVED",
        },
      });

    return res.json({
      success: true,
      message: "Loan approved successfully.",
      loan,
    });

  } catch (error: any) {
    console.error(
      "Approve Loan Error:",
      error
    );

    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/* ========================================================= */
/* REJECT LOAN */
/* ========================================================= */

export const rejectLoan = async (
  req: Request,
  res: Response
) => {
  try {
    const id = String(req.params.id);

    const loan =
      await prisma.loanApplication.update({
        where: {
          id,
        },
        data: {
          status: "REJECTED",
        },
      });

    return res.json({
      success: true,
      message: "Loan rejected successfully.",
      loan,
    });

  } catch (error: any) {
    console.error(
      "Reject Loan Error:",
      error
    );

    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/* ========================================================= */
/* CALCULATE LOAN RISK */
/* ========================================================= */

export const calculateLoanRisk = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      monthlyIncome,
      loanAmount,
      loanMonths,
      creditScore,
      occupation,
      documentsVerified,
      bankVerified,

      // Fraud Detection
      fraudRisk,
      fraudFlags,
    } = req.body;

    if (
      monthlyIncome === undefined ||
      loanAmount === undefined ||
      loanMonths === undefined ||
      !occupation ||
      documentsVerified === undefined ||
      bankVerified === undefined
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Missing required risk assessment fields.",
      });
    }

    const result = calculateRisk({
      monthlyIncome: Number(monthlyIncome),
      loanAmount: Number(loanAmount),
      loanMonths: Number(loanMonths),
      creditScore: Number(creditScore || 0),

      occupation: String(occupation),
      documentsVerified: Boolean(documentsVerified),
      bankVerified: Boolean(bankVerified),

      fraudRisk:
        fraudRisk !== undefined
          ? Number(fraudRisk)
          : undefined,

      fraudFlags:
        Array.isArray(fraudFlags)
          ? fraudFlags
          : [],
    });

    return res.json({
      success: true,
      risk: result,
    });

  } catch (error: any) {
    console.error(
      "Risk Calculation Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Risk calculation failed.",
    });
  }
};