"use client";

import { useLoanStore } from "@/store/loanStore";

export default function AISidePanel() {
  const currentStep = useLoanStore((state) => state.currentStep);

  const messages = {
    1: "Waiting for personal information...",
    2: "Waiting for identity verification...",
    3: "Analyzing employment details...",
    4: "Verifying banking information...",
    5: "Calculating confidential loan eligibility...",
    6: "Verifying uploaded documents...",
    7: "Running AI underwriting on encrypted data...",
    8: "✅ Loan approved successfully.",
  };

  return (
    <div className="space-y-5">

      {/* AI Assistant */}

      <div className="rounded-2xl border border-cyan-500/20 bg-zinc-900 p-5">

        <h2 className="text-xl font-bold text-white">
          AI Assistant
        </h2>

        <p className="mt-3 text-zinc-400">
          {
            messages[
              currentStep as keyof typeof messages
            ]
          }
        </p>

      </div>

      {/* Privacy */}

      <div className="rounded-2xl border border-white/10 bg-zinc-900 p-5">

        <h2 className="font-bold text-white">
          Privacy Score
        </h2>

        <div className="mt-4 text-5xl font-black text-cyan-400">
          100%
        </div>

        <p className="mt-3 text-zinc-400">
          All uploaded financial data remains encrypted
          using Fully Homomorphic Encryption.
        </p>

      </div>

      {/* Encrypted Fields */}

      <div className="rounded-2xl border border-white/10 bg-zinc-900 p-5">

        <h2 className="font-bold text-white">
          Encrypted Fields
        </h2>

        <ul className="mt-4 space-y-2 text-zinc-300">

          <li>✓ Aadhaar Number</li>
          <li>✓ PAN Number</li>
          <li>✓ Salary</li>
          <li>✓ Bank Statement</li>
          <li>✓ Credit Score</li>

        </ul>

      </div>

      {/* Final Status */}

      {currentStep === 8 && (
        <div className="rounded-2xl border border-green-500/20 bg-green-500/10 p-5">

          <h2 className="font-bold text-green-400">
            Application Status
          </h2>

          <ul className="mt-3 space-y-2 text-zinc-300">

            <li>✅ Identity Verified</li>
            <li>✅ Documents Verified</li>
            <li>✅ AI Credit Analysis Completed</li>
            <li>✅ FHE Encryption Verified</li>
            <li>✅ Loan Ready for Disbursement</li>

          </ul>

        </div>
      )}

    </div>
  );
}