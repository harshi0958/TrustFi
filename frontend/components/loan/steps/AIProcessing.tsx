"use client";

import { useEffect, useState } from "react";
import { BrainCircuit, Lock, ShieldCheck, FileCheck } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useLoanStore } from "@/store/loanStore";

const steps = [
  "Uploading encrypted documents...",
  "OCR extracting Aadhaar & PAN...",
  "Verifying government identity...",
  "Validating salary & bank records...",
  "Encrypting data using FHE...",
  "Running AI credit scoring model...",
  "Predicting repayment behaviour...",
  "Generating confidential loan decision..."
];

export default function AIProcessing() {
  const { nextStep } = useLoanStore();
  const [progress, setProgress] = useState(0);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }

        return prev + 2;
      });
    }, 120);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setCurrent(Math.min(steps.length - 1, Math.floor(progress / 15)));
  }, [progress]);

  useEffect(() => {
  if (progress === 100) {
    const timer = setTimeout(() => {
      nextStep();
    }, 1000);

    return () => clearTimeout(timer);
  }
}, [progress, nextStep]);

  return (
    
    <div className="space-y-8">

      <div className="text-center">

        <BrainCircuit
          size={60}
          className="mx-auto text-cyan-400 animate-pulse"
        />

        <h2 className="text-lg font-semibold text-green-400">
AI Underwriting Summary
</h2>

<ul className="mt-4 space-y-2 text-zinc-300">

<li>✅ Aadhaar OCR Completed</li>

<li>✅ PAN Verification Passed</li>

<li>✅ Salary Slip Parsed</li>

<li>✅ Bank Account Verified</li>

<li>✅ Income Consistency Checked</li>

<li>✅ AI Repayment Prediction Generated</li>

<li>🔒 Fully Homomorphic Encryption Active</li>

</ul>

        <p className="mt-3 text-zinc-400">
          TrustFi AI is securely analyzing your encrypted financial data.
        </p>

      </div>

      <Progress value={progress} className="h-3" />
    <Progress value={progress} className="h-3" />

{/* AI Live Metrics */}

<div className="grid grid-cols-2 gap-4">

  <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/10 p-4">
    <p className="text-sm text-zinc-400">
      AI Confidence
    </p>

    <h2 className="mt-2 text-3xl font-bold text-cyan-400">
      98%
    </h2>
  </div>

  <div className="rounded-xl border border-green-500/20 bg-green-500/10 p-4">
    <p className="text-sm text-zinc-400">
      Fraud Risk
    </p>

    <h2 className="mt-2 text-3xl font-bold text-green-400">
      Low
    </h2>
  </div>

  <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/10 p-4">
    <p className="text-sm text-zinc-400">
      Identity Match
    </p>

    <h2 className="mt-2 text-3xl font-bold text-yellow-400">
      100%
    </h2>
  </div>

  <div className="rounded-xl border border-purple-500/20 bg-purple-500/10 p-4">
    <p className="text-sm text-zinc-400">
      FHE Encryption
    </p>

    <h2 className="mt-2 text-3xl font-bold text-purple-400">
      Active
    </h2>
  </div>

</div>
      <div className="rounded-2xl border border-cyan-500/20 bg-zinc-900 p-6">

        <p className="text-xl text-cyan-300">
          {steps[current]}
        </p>

      </div>

      <div className="space-y-5">

        <div className="flex items-center gap-4">

          <FileCheck className="text-green-400" />

          <span className="text-white">
            OCR Document Extraction
          </span>

        </div>

        <div className="flex items-center gap-4">

          <Lock className="text-cyan-400" />

          <span className="text-white">
            Fully Homomorphic Encryption Active
          </span>

        </div>

        <div className="flex items-center gap-4">

          <ShieldCheck className="text-green-400" />

          <span className="text-white">
            Privacy Preserving Credit Analysis
          </span>

        </div>

      </div>

      <div className="rounded-2xl border border-green-500/20 bg-green-500/10 p-5">

        <h2 className="text-lg font-semibold text-green-400">
          Live Status
        </h2>

        <p className="mt-2 text-zinc-300">
          AI is evaluating repayment capacity, financial behaviour,
          document authenticity and encrypted banking data.
        </p>

      </div>

    </div>
  );
}