export interface LoanRiskResult {
  score: number;
  risk: "LOW" | "MEDIUM" | "HIGH";
  eligibility: number;
  interestRate: number;
  approved: boolean;
  eligibleAmount: number;
  emi: number;
}

const validRiskLevels = ["LOW", "MEDIUM", "HIGH"];

export function isValidLoanRiskResult(
  value: unknown
): value is LoanRiskResult {
  if (!value || typeof value !== "object") return false;

  const result = value as Record<string, unknown>;

  return (
    typeof result.score === "number" &&
    Number.isFinite(result.score) &&
    typeof result.eligibility === "number" &&
    Number.isFinite(result.eligibility) &&
    typeof result.interestRate === "number" &&
    Number.isFinite(result.interestRate) &&
    typeof result.eligibleAmount === "number" &&
    Number.isFinite(result.eligibleAmount) &&
    typeof result.emi === "number" &&
    Number.isFinite(result.emi) &&
    typeof result.approved === "boolean" &&
    typeof result.risk === "string" &&
    validRiskLevels.includes(result.risk) &&
    result.score >= 0 &&
    result.score <= 1000 &&
    result.eligibility >= 0 &&
    result.eligibility <= 100 &&
    result.interestRate >= 0 &&
    result.eligibleAmount >= 0 &&
    result.emi >= 0
  );
}

export function isHighFraudRiskBlocked(
  assessmentCompleted: boolean,
  fraudRisk: unknown
): boolean {
  return assessmentCompleted && fraudRisk === "HIGH";
}

export function canStartLoanSubmission(
  isLocked: boolean,
  isSubmitting: boolean,
  submissionSucceeded: boolean
): boolean {
  return !isLocked && !isSubmitting && !submissionSucceeded;
}

export function shouldShowRiskRetry(
  riskError: string,
  isAssessing: boolean
): boolean {
  return riskError.length > 0 && !isAssessing;
}
