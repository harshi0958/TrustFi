export interface RiskInput {
  monthlyIncome: number;
  loanAmount: number;
  loanMonths: number;
  creditScore?: number;
  occupation: string;
  documentsVerified: boolean;
  bankVerified: boolean;

  // Fraud detection inputs
  fraudRisk?: number;
  fraudFlags?: string[];
}

export interface RiskResult {
  score: number;
  risk: "LOW" | "MEDIUM" | "HIGH";
  eligibility: number;
  interestRate: number;
  approved: boolean;
  eligibleAmount: number;
  emi: number;

  // Fraud detection result
  fraudScore: number;
  fraudRisk: "LOW" | "MEDIUM" | "HIGH";
  fraudFlags: string[];

  // Explainable AI / risk reasons
  riskReasons: string[];
}

export function calculateRisk(
  input: RiskInput
): RiskResult {
  let score = 300;

  const riskReasons: string[] = [];
  const fraudFlags: string[] = [];

  /* ---------------- INCOME SCORE ---------------- */

  if (input.monthlyIncome >= 100000) {
    score += 220;
    riskReasons.push(
      "High monthly income indicates strong repayment capacity."
    );
  } else if (input.monthlyIncome >= 70000) {
    score += 180;
    riskReasons.push(
      "Good monthly income supports repayment capacity."
    );
  } else if (input.monthlyIncome >= 50000) {
    score += 150;
    riskReasons.push(
      "Moderate-to-good monthly income supports loan eligibility."
    );
  } else if (input.monthlyIncome >= 30000) {
    score += 100;
    riskReasons.push(
      "Monthly income provides basic repayment capacity."
    );
  } else {
    score += 40;
    riskReasons.push(
      "Lower monthly income increases repayment risk."
    );
  }

  /* ---------------- EMPLOYMENT ---------------- */

  switch (input.occupation) {
    case "Salaried":
      score += 120;
      riskReasons.push(
        "Salaried employment provides stable income."
      );
      break;

    case "Business":
      score += 90;
      riskReasons.push(
        "Business income provides moderate repayment stability."
      );
      break;

    case "Freelancer":
      score += 70;
      riskReasons.push(
        "Freelance income may have higher variability."
      );
      break;

    default:
      score += 30;
      riskReasons.push(
        "Employment information provides limited stability evidence."
      );
  }

  /* ---------------- DOCUMENT VERIFICATION ---------------- */

  if (input.documentsVerified) {
    score += 120;
    riskReasons.push(
      "Required documents have been successfully verified."
    );
  } else {
    riskReasons.push(
      "Document verification is incomplete."
    );
  }

  /* ---------------- BANK VERIFICATION ---------------- */

  if (input.bankVerified) {
    score += 80;
    riskReasons.push(
      "Bank information has been successfully verified."
    );
  } else {
    riskReasons.push(
      "Bank verification is incomplete."
    );
  }

  /* ---------------- LOAN VS INCOME ---------------- */

  const yearlyIncome =
    input.monthlyIncome * 12;

  const ratio =
    yearlyIncome > 0
      ? input.loanAmount / yearlyIncome
      : Infinity;

  if (ratio <= 0.5) {
    score += 120;

    riskReasons.push(
      "Requested loan amount is low compared with annual income."
    );
  } else if (ratio <= 1) {
    score += 80;

    riskReasons.push(
      "Requested loan amount is within a reasonable income range."
    );
  } else {
    score -= 50;

    riskReasons.push(
      "Requested loan amount is high compared with annual income."
    );
  }

  /* ---------------- EXISTING CREDIT SCORE ---------------- */

  if (
    input.creditScore !== undefined &&
    input.creditScore > 0
  ) {
    if (input.creditScore >= 750) {
      riskReasons.push(
        "Existing credit score indicates strong credit history."
      );
    } else if (input.creditScore >= 650) {
      riskReasons.push(
        "Existing credit score indicates moderate credit history."
      );
    } else {
      riskReasons.push(
        "Existing credit score indicates higher credit risk."
      );
    }
  }

  /* ---------------- SCORE LIMIT ---------------- */

  score = Math.min(
    900,
    Math.max(300, score)
  );

  /* ---------------- CREDIT RISK ---------------- */

  let risk: "LOW" | "MEDIUM" | "HIGH";

  let interestRate: number;

  let approved: boolean;

  if (score >= 800) {
    risk = "LOW";
    interestRate = 8;
    approved = true;

    riskReasons.push(
      "Overall credit risk is low based on the calculated score."
    );
  } else if (score >= 700) {
    risk = "LOW";
    interestRate = 10;
    approved = true;

    riskReasons.push(
      "Overall credit risk is low with acceptable repayment indicators."
    );
  } else if (score >= 600) {
    risk = "MEDIUM";
    interestRate = 12;
    approved = true;

    riskReasons.push(
      "Overall credit risk is medium and requires additional consideration."
    );
  } else {
    risk = "HIGH";
    interestRate = 16;
    approved = false;

    riskReasons.push(
      "Overall credit risk is high based on the calculated score."
    );
  }

  /* ---------------- FRAUD DETECTION ---------------- */

  let fraudScore = 0;

  /*
   * External fraud risk can come from
   * document validation / OCR services.
   */
  if (
    input.fraudRisk !== undefined &&
    Number.isFinite(input.fraudRisk)
  ) {
    fraudScore = Math.min(
      100,
      Math.max(0, Math.round(input.fraudRisk))
    );
  }

  /* ---------------- FRAUD FLAGS ---------------- */

  if (input.fraudFlags && input.fraudFlags.length > 0) {
    for (const flag of input.fraudFlags) {
      if (
        typeof flag === "string" &&
        flag.trim().length > 0
      ) {
        fraudFlags.push(flag.trim());
      }
    }
  }

  /*
   * Automatically detect suspicious
   * loan-to-income ratio.
   */
  if (ratio > 1.5) {
    fraudScore += 15;

    fraudFlags.push(
      "Loan amount is unusually high compared with annual income."
    );
  }

  /*
   * Missing verification can increase
   * fraud risk.
   */
  if (!input.documentsVerified) {
    fraudScore += 20;

    fraudFlags.push(
      "Required documents are not fully verified."
    );
  }

  if (!input.bankVerified) {
    fraudScore += 15;

    fraudFlags.push(
      "Bank information is not verified."
    );
  }

  /* ---------------- FRAUD SCORE LIMIT ---------------- */

  fraudScore = Math.min(
    100,
    Math.max(0, fraudScore)
  );

  /* ---------------- FRAUD RISK LEVEL ---------------- */

  let fraudRiskLevel:
    | "LOW"
    | "MEDIUM"
    | "HIGH";

  if (fraudScore >= 60) {
    fraudRiskLevel = "HIGH";
  } else if (fraudScore >= 30) {
    fraudRiskLevel = "MEDIUM";
  } else {
    fraudRiskLevel = "LOW";
  }

  /* ---------------- FRAUD EXPLANATION ---------------- */

  if (fraudRiskLevel === "LOW") {
    riskReasons.push(
      "No major fraud indicators were detected."
    );
  } else if (fraudRiskLevel === "MEDIUM") {
    riskReasons.push(
      "Some fraud indicators were detected and may require manual review."
    );
  } else {
    riskReasons.push(
      "Multiple fraud indicators were detected and manual review is recommended."
    );
  }

  /* ---------------- ELIGIBLE AMOUNT ---------------- */

  const eligibleAmount =
    yearlyIncome * 3;

  /* ---------------- EMI ---------------- */

  const r =
    interestRate / 12 / 100;

  const n =
    input.loanMonths;

  let emi = 0;

  if (
    approved &&
    input.loanAmount > 0 &&
    n > 0 &&
    r > 0
  ) {
    emi = Math.round(
      (input.loanAmount *
        r *
        Math.pow(1 + r, n)) /
        (Math.pow(1 + r, n) - 1)
    );
  }

  /* ---------------- ELIGIBILITY ---------------- */

  const eligibility = Math.min(
    100,
    Math.round(score / 9)
  );

  /* ---------------- FINAL RESULT ---------------- */

  return {
    score,
    risk,
    eligibility,
    interestRate,
    approved,
    eligibleAmount,
    emi,

    fraudScore,
    fraudRisk: fraudRiskLevel,
    fraudFlags: [...new Set(fraudFlags)],
    riskReasons,
  };
}