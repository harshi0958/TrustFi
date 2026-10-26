
import { Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { existsSync, statSync } from "node:fs";
import path from "node:path";
import prisma from "../lib/prisma";
import { calculateRisk } from "../services/risk.service";

/* ========================================================= */
/* FRAUD INPUT NORMALIZATION */
/* ========================================================= */

const normalizeFraudInputs = (body: any) => {
  const rawScore = body.fraudScore;
  const rawRisk = body.fraudRisk;

  const fraudScore =
    rawScore !== undefined &&
    rawScore !== null &&
    rawScore !== "" &&
    Number.isFinite(Number(rawScore))
      ? Number(rawScore)
      : undefined;

  const fraudRisk:
    | number
    | "LOW"
    | "MEDIUM"
    | "HIGH"
    | undefined =
    typeof rawRisk === "string" &&
    ["LOW", "MEDIUM", "HIGH"].includes(
      rawRisk.toUpperCase()
    )
      ? (rawRisk.toUpperCase() as "LOW" | "MEDIUM" | "HIGH")
      : rawRisk !== undefined &&
          rawRisk !== null &&
          rawRisk !== "" &&
          Number.isFinite(Number(rawRisk))
        ? Number(rawRisk)
        : undefined;

  const fraudFlags: string[] = Array.isArray(body.fraudFlags)
    ? body.fraudFlags
        .filter(
          (flag: unknown): flag is string =>
            typeof flag === "string" &&
            flag.trim().length > 0
        )
        .map((flag: string) => flag.trim())
    : [];

  return {
    fraudScore,
    fraudRisk,
    fraudFlags: [...new Set(fraudFlags)],
  };
};

/* ========================================================= */
/* APPLY LOAN */
/* ========================================================= */

export const applyLoan = async (
  req: Request,
  res: Response
) => {
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

      propertyType,
      propertyValue,
      propertyAddress,
      ownershipStatus,
      propertyDocumentUploadId,

      goldWeight,
      goldPurity,
      goldValue,
      goldOwnership,
    } = req.body;

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

    if (
      loanType === "PROPERTY" &&
      (
        typeof propertyType !== "string" ||
        !propertyType.trim() ||
        !Number.isFinite(Number(propertyValue)) ||
        Number(propertyValue) <= 0 ||
        typeof propertyAddress !== "string" ||
        !propertyAddress.trim() ||
        typeof ownershipStatus !== "string" ||
        !ownershipStatus.trim()
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Property loan details are incomplete or invalid.",
      });
    }

    let storedPropertyDocumentUploadId: string | null = null;

    if (loanType === "PROPERTY") {
      if (
        typeof propertyDocumentUploadId !== "string" ||
        !/^[a-f0-9]{32}$/i.test(propertyDocumentUploadId)
      ) {
        return res.status(400).json({
          success: false,
          message: "A stored property document upload is required.",
        });
      }

      const uploadPath = path.resolve(
        process.cwd(),
        "uploads",
        propertyDocumentUploadId
      );

      if (
        !existsSync(uploadPath) ||
        !statSync(uploadPath).isFile()
      ) {
        return res.status(400).json({
          success: false,
          message:
            "The property document upload could not be found. Please upload it again.",
        });
      }

      storedPropertyDocumentUploadId = propertyDocumentUploadId;
    }

    if (
      loanType === "GOLD" &&
      (
        !Number.isFinite(Number(goldWeight)) ||
        Number(goldWeight) <= 0 ||
        typeof goldPurity !== "string" ||
        !goldPurity.trim() ||
        !Number.isFinite(Number(goldValue)) ||
        Number(goldValue) <= 0 ||
        typeof goldOwnership !== "string" ||
        !goldOwnership.trim()
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Gold loan details are incomplete or invalid.",
      });
    }

    /* ---------------- NUMERIC VALIDATION ---------------- */

    const income = Number(monthlyIncome);
    const amount = Number(loanAmount);
    const months = Number(loanMonths);
    const suppliedCreditScore = Number(creditScore || 0);

    if (
      !Number.isFinite(income) ||
      income <= 0 ||
      !Number.isFinite(amount) ||
      amount <= 0 ||
      !Number.isInteger(months) ||
      months <= 0 ||
      !Number.isFinite(suppliedCreditScore)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Income, loan amount, duration, or credit score is invalid.",
      });
    }

    if (
      typeof documentsVerified !== "boolean" ||
      typeof bankVerified !== "boolean"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Document and bank verification values must be boolean.",
      });
    }

    const fraudInputs = normalizeFraudInputs(req.body);

    if (
      fraudInputs.fraudScore !== undefined &&
      (
        fraudInputs.fraudScore < 0 ||
        fraudInputs.fraudScore > 100
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Fraud score must be between 0 and 100.",
      });
    }

    /* ---------------- SERVER-SIDE RISK CALCULATION ---------------- */

    const score = calculateRisk({
      monthlyIncome: income,
      loanAmount: amount,
      loanMonths: months,
      creditScore: suppliedCreditScore,
      occupation: String(occupation),
      documentsVerified,
      bankVerified,
      ...fraudInputs,
    });

    /* ---------------- CREATE LOAN ---------------- */

    const loan = await prisma.loanApplication.create({
      data: {
        fullName,
        email,
        phone,
        monthlyIncome: income,
        loanType,
        loanAmount: amount,
        loanMonths: months,
        purpose,

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
        ...(loanType === "PROPERTY"
          ? {
              propertyDocumentUploadId:
                storedPropertyDocumentUploadId,
            }
          : {}),

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

        creditScore: score.score,
        risk: score.risk,
        eligibility: score.eligibility,
        interestRate: score.interestRate,

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

    return res.status(201).json({
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
  } catch (error: unknown) {
    console.error("Loan Application Error:", error);

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2022"
    ) {
      return res.status(503).json({
        success: false,
        message:
          "Loan application storage needs a database migration before this application can be saved.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to submit the loan application.",
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
    const loans = await prisma.loanApplication.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.json(loans);
  } catch (error: unknown) {
    console.error("Get Loans Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve loan applications.",
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
    const email = String(req.params.email).trim();

    const loan = await prisma.loanApplication.findFirst({
      where: {
        email,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!loan) {
      return res.status(404).json({
        success: false,
        message: "No loan application found for this email.",
      });
    }

    return res.json(loan);
  } catch (error: unknown) {
    console.error("Get Loan By Email Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve the loan application.",
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

    const existingLoan = await prisma.loanApplication.findUnique({
      where: { id },
    });

    if (!existingLoan) {
      return res.status(404).json({
        success: false,
        message: "Loan application not found.",
      });
    }

    if (existingLoan.fraudRisk === "HIGH") {
      return res.status(409).json({
        success: false,
        message:
          "This application has high fraud risk and cannot be approved through this endpoint.",
      });
    }

    const loan = await prisma.loanApplication.update({
      where: { id },
      data: {
        status: "APPROVED",
      },
    });

    return res.json({
      success: true,
      message: "Loan approved successfully.",
      loan,
    });
  } catch (error: unknown) {
    console.error("Approve Loan Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to approve the loan application.",
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

    const existingLoan = await prisma.loanApplication.findUnique({
      where: { id },
    });

    if (!existingLoan) {
      return res.status(404).json({
        success: false,
        message: "Loan application not found.",
      });
    }

    const loan = await prisma.loanApplication.update({
      where: { id },
      data: {
        status: "REJECTED",
      },
    });

    return res.json({
      success: true,
      message: "Loan rejected successfully.",
      loan,
    });
  } catch (error: unknown) {
    console.error("Reject Loan Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to reject the loan application.",
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
        message: "Missing required risk assessment fields.",
      });
    }

    const income = Number(monthlyIncome);
    const amount = Number(loanAmount);
    const months = Number(loanMonths);
    const suppliedCreditScore = Number(creditScore || 0);

    if (
      !Number.isFinite(income) ||
      income <= 0 ||
      !Number.isFinite(amount) ||
      amount <= 0 ||
      !Number.isInteger(months) ||
      months <= 0 ||
      !Number.isFinite(suppliedCreditScore)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Income, loan amount, duration, or credit score is invalid.",
      });
    }

    if (
      typeof documentsVerified !== "boolean" ||
      typeof bankVerified !== "boolean"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Document and bank verification values must be boolean.",
      });
    }

    const fraudInputs = normalizeFraudInputs(req.body);

    if (
      fraudInputs.fraudScore !== undefined &&
      (
        fraudInputs.fraudScore < 0 ||
        fraudInputs.fraudScore > 100
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Fraud score must be between 0 and 100.",
      });
    }

    const result = calculateRisk({
      monthlyIncome: income,
      loanAmount: amount,
      loanMonths: months,
      creditScore: suppliedCreditScore,
      occupation: String(occupation),
      documentsVerified,
      bankVerified,
      ...fraudInputs,
    });

    return res.json({
      success: true,
      risk: result,
    });
  } catch (error: unknown) {
    console.error("Risk Calculation Error:", error);

    return res.status(500).json({
      success: false,
      message: "Risk calculation failed.",
    });
  }
};
