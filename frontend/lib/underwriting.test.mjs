import assert from "node:assert/strict";
import test from "node:test";
import {
  canStartLoanSubmission,
  isHighFraudRiskBlocked,
  isValidLoanRiskResult,
  shouldShowRiskRetry,
} from "./underwriting.ts";

test("accepts a complete valid loan-risk result for the Step 7 review panel", () => {
  assert.equal(
    isValidLoanRiskResult({
      score: 760,
      risk: "LOW",
      eligibility: 84,
      interestRate: 10,
      approved: true,
      eligibleAmount: 5400000,
      emi: 23072,
    }),
    true
  );
});

test("does not expose the review panel for invalid or failed risk results", () => {
  assert.equal(isValidLoanRiskResult(null), false);
  assert.equal(
    isValidLoanRiskResult({
      score: 760,
      risk: "UNKNOWN",
      eligibility: 84,
      interestRate: 10,
      approved: true,
      eligibleAmount: 5400000,
      emi: 23072,
    }),
    false
  );
});

test("keeps the completed HIGH-fraud-risk restriction active", () => {
  assert.equal(isHighFraudRiskBlocked(true, "HIGH"), true);
  assert.equal(isHighFraudRiskBlocked(false, "HIGH"), false);
  assert.equal(isHighFraudRiskBlocked(true, "MEDIUM"), false);
});

test("prevents concurrent or repeated loan submissions", () => {
  assert.equal(canStartLoanSubmission(false, false, false), true);
  assert.equal(canStartLoanSubmission(true, false, false), false);
  assert.equal(canStartLoanSubmission(false, true, false), false);
  assert.equal(canStartLoanSubmission(false, false, true), false);
});

test("shows risk retry only after a failed request is no longer in progress", () => {
  assert.equal(shouldShowRiskRetry("API unavailable", false), true);
  assert.equal(shouldShowRiskRetry("API unavailable", true), false);
  assert.equal(shouldShowRiskRetry("", false), false);
});
