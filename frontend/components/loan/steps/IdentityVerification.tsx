"use client";

import UploadCard from "@/components/upload/UploadCard";
import { Button } from "@/components/ui/button";
import { useLoanStore } from "@/store/loanStore";

export default function IdentityVerification() {
  const {
    nextStep,
    documents,
    updateDocument,
  } = useLoanStore();

  const formValid =
    documents.aadhaarFront &&
    documents.aadhaarBack &&
    documents.pan &&
    documents.selfie &&
    documents.salarySlip &&
    documents.passbook;

  return (
    <div className="space-y-8">

      <div>
        <h1 className="text-4xl font-bold text-white">
          Identity Verification
        </h1>

        <p className="mt-2 text-zinc-400">
          Upload your KYC documents securely.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-6">

        <UploadCard
          title="Aadhaar Front"
          onUploaded={() =>
            updateDocument("aadhaarFront", true)
          }
        />

        <UploadCard
          title="Aadhaar Back"
          onUploaded={() =>
            updateDocument("aadhaarBack", true)
          }
        />

        <UploadCard
          title="PAN Card"
          onUploaded={() =>
            updateDocument("pan", true)
          }
        />

        <UploadCard
          title="Selfie"
          onUploaded={() =>
            updateDocument("selfie", true)
          }
        />

        <UploadCard
          title="Salary Slip"
          onUploaded={() =>
            updateDocument("salarySlip", true)
          }
        />

        <UploadCard
          title="Bank Passbook"
          onUploaded={() =>
            updateDocument("passbook", true)
          }
        />

      </div>

      {!formValid && (
        <div className="rounded-xl border border-red-500 bg-red-500/10 p-4">
          <p className="text-red-400">
            Please upload all required documents.
          </p>
        </div>
      )}

      <div className="flex justify-end">

        <Button
          disabled={!formValid}
          className="bg-cyan-500 text-black hover:bg-cyan-400"
          onClick={nextStep}
        >
          Save & Continue
        </Button>

      </div>

    </div>
  );
}