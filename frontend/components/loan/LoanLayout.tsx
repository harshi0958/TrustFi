"use client";

import { useLoanStore } from "@/store/loanStore";

import LoanStepper from "./LoanStepper";
import ProgressCard from "./ProgressCard";
import AISidePanel from "./AISidePanel";


import PersonalDetails from "./steps/PersonalDetails";
import IdentityVerification from "./steps/IdentityVerification";
import EmploymentDetails from "./steps/EmploymentDetails";
import BankingDetails from "./steps/BankingDetails";
import LoanDetails from "./steps/LoanDetails";
import DocumentUpload from "./steps/DocumentUpload";
import AIProcessing from "./steps/AIProcessing";
import LoanApproval from "./steps/LoanApproval";
// Fallback placeholder for LoanApproval step. The original module was missing.


export default function LoanLayout() {
  const currentStep = useLoanStore((state) => state.currentStep);

  return (
    <div className="min-h-screen bg-[#050816]">
      <div className="mx-auto grid max-w-7xl grid-cols-12 gap-6 px-8 py-10">
        <div className="col-span-3 space-y-5">
          <ProgressCard />
          <LoanStepper />
        </div>

        <div className="col-span-6">
          <div className="rounded-3xl border border-white/10 bg-zinc-900 p-8">
            {currentStep === 1 && <PersonalDetails />}
            {currentStep === 2 && <IdentityVerification />}
            {currentStep === 3 && <EmploymentDetails />}
            {currentStep === 4 && <BankingDetails />}
            {currentStep === 5 && <LoanDetails />}
            {currentStep === 6 && <DocumentUpload />}
            {currentStep === 7 && <AIProcessing />}
            {currentStep === 8 && <LoanApproval />}
          </div>
        </div>

        <div className="col-span-3">
          <AISidePanel />
        </div>
      </div>
    </div>
  );
}