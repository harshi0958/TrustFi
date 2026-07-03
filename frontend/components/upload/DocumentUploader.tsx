"use client";

import UploadCard from "@/components/upload/UploadCard";
import { Button } from "@/components/ui/button";
import { useLoanStore } from "@/store/loanStore";

export default function DocumentUpload() {
  const { nextStep, previousStep } = useLoanStore();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">
          Document Upload
        </h1>

        <p className="mt-2 text-zinc-400">
          Upload all required KYC and financial documents.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-6">

        <UploadCard title="Aadhaar Card" />

        <UploadCard title="PAN Card" />

        <UploadCard title="Salary Slip" />

        <UploadCard title="Passport Size Photo" />

        <UploadCard title="Bank Passbook / Statement" />

        <UploadCard title="Credit Card (Optional)" />

      </div>

      <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-6">

        <h2 className="text-xl font-semibold text-cyan-300">
          AI Verification
        </h2>

        <ul className="mt-4 space-y-2 text-zinc-300">
          <li>✅ OCR extracts document details automatically.</li>
          <li>✅ PAN & Aadhaar validation.</li>
          <li>✅ Salary verification.</li>
          <li>✅ Bank statement analysis.</li>
          <li>✅ Fully Homomorphic Encryption protects your data.</li>
        </ul>

      </div>

      <div className="flex justify-between">

        <Button
          variant="outline"
          onClick={previousStep}
        >
          Previous
        </Button>

        <Button
          className="bg-cyan-500 text-black hover:bg-cyan-400"
          onClick={nextStep}
        >
          Continue to AI Review
        </Button>

      </div>

    </div>
  );
}