export interface CreditInput {
  monthlyIncome: number;
  loanAmount: number;
  months: number;
  occupation: string;

  documentsVerified: boolean;
  bankVerified: boolean;
}

export interface CreditResult {
  score: number;
  eligibility: number;
  risk: "Low" | "Medium" | "High";
  interestRate: number;
  approved: boolean;
  eligibleAmount: number;
  emi: number;
}

export function calculateCredit(
  input: CreditInput
): CreditResult {

  let score = 300;

  // Income Score

  if (input.monthlyIncome >= 100000)
    score += 220;
  else if (input.monthlyIncome >= 70000)
    score += 180;
  else if (input.monthlyIncome >= 50000)
    score += 150;
  else if (input.monthlyIncome >= 30000)
    score += 100;
  else
    score += 40;

  // Employment

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

  // Documents

  if (input.documentsVerified)
    score += 120;

  // Banking

  if (input.bankVerified)
    score += 80;

  // Loan vs Income

  const yearlyIncome =
    input.monthlyIncome * 12;

  const ratio =
    input.loanAmount / yearlyIncome;

  if (ratio <= 0.5)
    score += 120;

  else if (ratio <= 1)
    score += 80;

  else
    score -= 50;

  if (score > 900)
    score = 900;

  let risk: "Low" | "Medium" | "High";

  let interestRate = 14;

  let approved = false;

  if (score >= 800) {

    risk = "Low";
    interestRate = 8;
    approved = true;

  } else if (score >= 700) {

    risk = "Low";
    interestRate = 10;
    approved = true;

  } else if (score >= 600) {

    risk = "Medium";
    interestRate = 12;
    approved = true;

  } else {

    risk = "High";
    interestRate = 16;
    approved = false;

  }

  const eligibleAmount =
    yearlyIncome * 3;

  const r =
    interestRate / 12 / 100;

  const n =
    input.months;

  const emi =
    approved
      ? Math.round(
          (input.loanAmount *
            r *
            Math.pow(1 + r, n)) /
            (Math.pow(1 + r, n) - 1)
        )
      : 0;

  const eligibility =
    Math.min(
      100,
      Math.round(score / 9)
    );

  return {

    score,

    eligibility,

    risk,

    interestRate,

    approved,

    eligibleAmount,

    emi,

  };
}