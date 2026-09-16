export interface RiskInput {
  monthlyIncome: number;
  loanAmount: number;
  loanMonths: number;
  creditScore?: number;
  occupation: string;
  documentsVerified: boolean;
  bankVerified: boolean;
}

export interface RiskResult {
  score: number;
  risk: "LOW" | "MEDIUM" | "HIGH";
  eligibility: number;
  interestRate: number;
  approved: boolean;
  eligibleAmount: number;
  emi: number;
}

export function calculateRisk(
  input: RiskInput
): RiskResult {
  let score = 300;

  /* ---------------- INCOME SCORE ---------------- */

  if (input.monthlyIncome >= 100000) {
    score += 220;
  } else if (input.monthlyIncome >= 70000) {
    score += 180;
  } else if (input.monthlyIncome >= 50000) {
    score += 150;
  } else if (input.monthlyIncome >= 30000) {
    score += 100;
  } else {
    score += 40;
  }

  /* ---------------- EMPLOYMENT ---------------- */

  switch (input.occupation) {
    case "Salaried":
      score += 120;
      break;

    case "Business":
      score += 90;
      break;

    case "Freelancer":
      score += 70;
      break;

    default:
      score += 30;
  }

  /* ---------------- DOCUMENT VERIFICATION ---------------- */

  if (input.documentsVerified) {
    score += 120;
  }

  /* ---------------- BANK VERIFICATION ---------------- */

  if (input.bankVerified) {
    score += 80;
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
  } else if (ratio <= 1) {
    score += 80;
  } else {
    score -= 50;
  }

  /* ---------------- SCORE LIMIT ---------------- */

  score = Math.min(
    900,
    Math.max(300, score)
  );

  /* ---------------- RISK ---------------- */

  let risk: "LOW" | "MEDIUM" | "HIGH";

  let interestRate: number;

  let approved: boolean;

  if (score >= 800) {
    risk = "LOW";
    interestRate = 8;
    approved = true;
  } else if (score >= 700) {
    risk = "LOW";
    interestRate = 10;
    approved = true;
  } else if (score >= 600) {
    risk = "MEDIUM";
    interestRate = 12;
    approved = true;
  } else {
    risk = "HIGH";
    interestRate = 16;
    approved = false;
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

  /* ---------------- RESULT ---------------- */

  return {
    score,
    risk,
    eligibility,
    interestRate,
    approved,
    eligibleAmount,
    emi,
  };
}