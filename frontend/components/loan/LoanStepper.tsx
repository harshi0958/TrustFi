"use client";

import { useLoanStore } from "@/store/loanStore";

const steps = [
  "Personal",
  "Identity",
  "Employment",
  "Banking",
  "Loan",
  "Documents",
  "AI Review",
  "Eligibility",
];

export default function LoanStepper() {
  const currentStep = useLoanStore((state) => state.currentStep);

  return (
    <div className="rounded-2xl border border-white/10 bg-zinc-900 p-6">
      <h2 className="mb-6 text-xl font-bold text-white">
        Loan Progress
      </h2>

      <div className="space-y-4">
        {steps.map((step, index) => (
          <div
            key={step}
            className={`rounded-xl p-3 transition ${
              currentStep === index + 1
                ? "bg-cyan-500 text-black font-semibold"
                : "bg-zinc-800 text-zinc-300"
            }`}
          >
            Step {index + 1}

            <div>{step}</div>
          </div>
        ))}
      </div>
    </div>
  );
}