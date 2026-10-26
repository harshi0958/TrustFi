"use client";

import { useLoanStore } from "@/store/loanStore";

export default function AISidePanel() {
  const { currentStep, approvedLoan, fraudAssessment } = useLoanStore();

  const messages: Record<number, string> = {
    1: "Enter the applicant's personal information.",
    2: "Identity documents are checked using OCR and name matching.",
    3: "Review the applicant's employment details.",
    4: "Enter banking information; account ownership is not verified here.",
    5: "Configure the loan request and review an indicative estimate.",
    6: "Upload required financial and loan-specific documents.",
    7:
      approvedLoan.status === "REJECTED"
        ? "The eligibility estimate does not meet the current criteria."
        : fraudAssessment.assessmentCompleted &&
            fraudAssessment.fraudRisk === "HIGH"
          ? "Manual review is required; automatic submission is blocked."
          : "Review the assessment and submit for manual review when permitted.",
  };

  return (
    <div className="space-y-5">

      {/* AI Assistant */}

      <div className="rounded-2xl border border-cyan-500/20 bg-zinc-900 p-5">

        <h2 className="text-xl font-bold text-white">
          AI Assistant
        </h2>

        <p className="mt-3 text-zinc-400">
          {messages[currentStep] ?? "Loan application status unavailable."}
        </p>

      </div>

      {/* Privacy */}

      <div className="rounded-2xl border border-white/10 bg-zinc-900 p-5">

        <h2 className="font-bold text-white">
          Privacy Processing
        </h2>

        <p className="mt-3 text-zinc-400">
          Fully Homomorphic Encryption execution is not integrated or
          verified in this application flow.
        </p>

      </div>

      {/* Encrypted Fields */}

      <div className="rounded-2xl border border-white/10 bg-zinc-900 p-5">

        <h2 className="font-bold text-white">
          Encrypted Fields
        </h2>

        <ul className="mt-4 space-y-2 text-zinc-300">

          <li>Aadhaar and PAN: OCR type/name checks only</li>
          <li>Salary and bank documents: OCR type checks only</li>
          <li>Risk score: computed by the loan risk service</li>
          <li>Encryption during computation: not verified</li>

        </ul>

      </div>

      {/* Final Status */}

      {currentStep === 7 && (
        <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/10 p-5">

          <h2 className="font-bold text-yellow-300">
            Eligibility Review
          </h2>

          <p className="mt-3 text-sm text-zinc-300">
            Risk assessment: {approvedLoan.score > 0 ? "Complete" : "Pending"}
          </p>
          <p className="mt-1 text-sm text-zinc-300">
            Fraud assessment:{" "}
            {fraudAssessment.assessmentCompleted ? "Complete" : "Incomplete"}
          </p>
          <p className="mt-1 text-sm text-zinc-300">
            Application status: {approvedLoan.status || "PENDING"}
          </p>

        </div>
      )}

    </div>
  );
}