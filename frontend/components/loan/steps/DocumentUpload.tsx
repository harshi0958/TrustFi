"use client";

import UploadCard from "@/components/upload/UploadCard";
import { Button } from "@/components/ui/button";
import { useLoanStore } from "@/store/loanStore";

export default function DocumentUpload() {
  const { previousStep, nextStep } = useLoanStore();
  return (
    <div className="space-y-8">

      <div>
        <h1 className="text-4xl font-bold text-white">
          Upload Required Documents
        </h1>

        <p className="mt-2 text-zinc-400">
          Upload all documents required for AI verification.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

        <UploadCard title="Aadhaar Card" />
        <UploadCard title="PAN Card" />
        <UploadCard title="Salary Slip" />
        <UploadCard title="Passport Size Photo" />
        <UploadCard title="Bank Passbook" />
        <UploadCard title="Credit Card (Optional)" />

      </div>

      <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-6">

        <h2 className="text-xl font-bold text-cyan-300">
          AI Verification
        </h2>

        <ul className="mt-4 space-y-2 text-zinc-300">
          <li>✅ OCR Data Extraction</li>
          <li>✅ PAN Verification</li>
          <li>✅ Aadhaar Verification</li>
          <li>✅ Salary Analysis</li>
          <li>✅ Bank Statement Analysis</li>
          <li>✅ FHE Encrypted Processing</li>
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
  onClick={() => {
    console.log("Current Step:", useLoanStore.getState().currentStep);
    nextStep();
  }}
>
  Submit Application
</Button>

      </div>

    </div>
  );
}