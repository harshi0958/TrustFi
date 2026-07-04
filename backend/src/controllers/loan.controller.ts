import { Request, Response } from "express";
import prisma from "../lib/prisma";
import { calculateRisk } from "../services/risk.service";

export const applyLoan = async (req: Request, res: Response) => {
  console.log(req.body);
  console.log("BODY:", req.body);

  try {

  const score = calculateRisk({
    monthlyIncome: req.body.monthlyIncome,
    loanAmount: req.body.loanAmount,
    loanMonths: req.body.loanMonths,
    creditScore: req.body.creditScore,
  });

  const loan = await prisma.loanApplication.create({
    data: {
  ...req.body,
  risk: score.risk,
  eligibility: score.eligibility,
  interestRate: score.interestRate,
  status: "PENDING",
}
  });

  res.json({
    success: true,
    loan,
  });

}catch (error: any) {
  console.error(error);

  res.status(500).json({
    success: false,
    error: error.message,
    fullError: error,
  });
}
};

export const getLoans = async (req: Request, res: Response) => {
  try {
    const loans = await prisma.loanApplication.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(loans);

  } catch (err) {

    res.status(500).json({
      success:false,
      error:err
    });

  }
};
