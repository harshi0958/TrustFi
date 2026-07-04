export function calculateRisk(data: {
  monthlyIncome: number;
  loanAmount: number;
  loanMonths: number;
  creditScore: number;
}) {
  const {
    monthlyIncome,
    loanAmount,
    loanMonths,
    creditScore,
  } = data;

  const emi = loanAmount / loanMonths;

  const ratio = emi / monthlyIncome;

  let risk = "LOW";

  if (creditScore < 600 || ratio > 0.6) {
    risk = "HIGH";
  } else if (creditScore < 700 || ratio > 0.4) {
    risk = "MEDIUM";
  }

  let eligibility = 95;

  eligibility -= Math.max(0, ratio * 100 - 20);

  if (creditScore < 700) eligibility -= 15;
  if (creditScore < 600) eligibility -= 25;

  eligibility = Math.max(0, Math.min(100, Math.round(eligibility)));

  let interestRate = 10;

  if (risk === "MEDIUM") interestRate = 12;
  if (risk === "HIGH") interestRate = 15;

  return {
    risk,
    eligibility,
    interestRate,
  };
}