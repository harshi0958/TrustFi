
"use client";

import { useMemo, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle,
  ShieldCheck,
  BrainCircuit,
  Loader2,
  AlertTriangle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { useLoanStore } from "@/store/loanStore";
import { calculateCredit } from "@/lib/creditEngine";
import { applyLoan } from "@/lib/api";
import {
  canStartLoanSubmission,
  isHighFraudRiskBlocked,
} from "@/lib/underwriting";

export default function LoanApproval() {
  const router = useRouter();

  const {
    personal,
    loan,
    documents,
    propertyDocumentUploadId,
    saveApprovedLoan,
    fraudAssessment,
  } = useLoanStore();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSucceeded, setSubmissionSucceeded] = useState(false);
  const submissionLock = useRef(false);

  // --------------------------------------------------
  // DOCUMENT PRESENCE CHECK
  // File presence alone does not prove OCR verification.
  // --------------------------------------------------

  const requiredDocumentFilesPresent = Boolean(
    documents.aadhaarFront &&
      documents.aadhaarBack &&
      documents.pan &&
      documents.selfie &&
      documents.salarySlip &&
      documents.passbook &&
      (loan.loanType === "PROPERTY"
        ? documents.propertyDocument
        : loan.loanType === "GOLD"
          ? documents.goldDocument
          : true)
  );

  const documentResults = fraudAssessment?.documentResults ?? {};

  const isValidatedDocument = (keyParts: string[]) => {
    const entry = Object.entries(documentResults).find(([key]) => {
      const normalizedKey = key.toLowerCase();
      return keyParts.every((part) => normalizedKey.includes(part));
    });

    if (!entry) return false;

    const item = entry[1];

    return (
      item.documentValid === true &&
      typeof item.confidence === "number" &&
      Number.isFinite(item.confidence) &&
      item.confidence >= 70 &&
      typeof item.fraudScore === "number" &&
      Number.isFinite(item.fraudScore) &&
      ["LOW", "MEDIUM", "HIGH"].includes(item.fraudRisk)
    );
  };

  const allRequiredDocumentsOCRVerified = Boolean(
    isValidatedDocument(["aadhaar", "front"]) &&
      isValidatedDocument(["aadhaar", "back"]) &&
      isValidatedDocument(["pan"]) &&
      isValidatedDocument(["salary"]) &&
      (isValidatedDocument(["passbook"]) ||
        isValidatedDocument(["bank"])) &&
      (loan.loanType === "PROPERTY"
        ? isValidatedDocument(["property"])
        : loan.loanType === "GOLD"
          ? isValidatedDocument(["gold"])
          : true)
  );

  const bankVerified =
    isValidatedDocument(["passbook"]) ||
    isValidatedDocument(["bank"]);
  const documentsVerified = allRequiredDocumentsOCRVerified;

  // --------------------------------------------------
  // FRAUD ASSESSMENT VALIDATION
  // --------------------------------------------------

  const fraudScore = Number(fraudAssessment?.fraudScore);
  const fraudRisk = fraudAssessment?.fraudRisk;
  const fraudFlags = Array.isArray(fraudAssessment?.fraudFlags)
    ? fraudAssessment.fraudFlags
    : [];

  const assessmentCompleted =
    fraudAssessment != null &&
    "assessmentCompleted" in fraudAssessment &&
    fraudAssessment.assessmentCompleted === true;

  
const validFraudAssessment =
  assessmentCompleted &&
  allRequiredDocumentsOCRVerified &&
  Number.isFinite(fraudScore) &&
  fraudScore >= 0 &&
  fraudScore <= 100 &&
  ["LOW", "MEDIUM", "HIGH"].includes(fraudRisk);


  const highFraudRisk = isHighFraudRiskBlocked(
    assessmentCompleted,
    fraudRisk
  );

  // --------------------------------------------------
  // CREDIT ELIGIBILITY ESTIMATE
  // This is an estimate, not a final lender decision.
  // --------------------------------------------------

  const result = useMemo(() => {
    return calculateCredit({
      monthlyIncome: Number(personal.monthlyIncome || 0),
      loanAmount: Number(loan.amount || 0),
      months: Number(loan.months || 0),
      occupation: personal.occupation || "",
      documentsVerified,
      bankVerified,
    });
  }, [
    personal.monthlyIncome,
    personal.occupation,
    loan.amount,
    loan.months,
    documentsVerified,
    bankVerified,
  ]);

  // --------------------------------------------------
  // SAVE LOCAL ESTIMATE
  // Never represent this estimate as final approval.
  // --------------------------------------------------

  useEffect(() => {
    saveApprovedLoan({
      amount: Number(loan.amount || 0),
      emi: result.emi,
      score: result.score,
      eligibility: result.eligibility,
      interestRate: result.interestRate,
      risk: result.risk,
      status:
        !validFraudAssessment || highFraudRisk || result.approved
          ? "PENDING"
          : "REJECTED",
    });
  }, [
    loan.amount,
    result,
    saveApprovedLoan,
    validFraudAssessment,
    highFraudRisk,
  ]);

  // --------------------------------------------------
  // REQUIRED FIELD VALIDATION
  // --------------------------------------------------

  const validateApplication = (): boolean => {
    if (!personal.fullName?.trim()) {
      alert("Applicant name is missing.");
      return false;
    }

    if (!personal.email?.trim()) {
      alert("Email is missing.");
      return false;
    }

    if (!personal.phone?.trim()) {
      alert("Phone number is missing.");
      return false;
    }

    if (
      !Number.isFinite(Number(personal.monthlyIncome)) ||
      Number(personal.monthlyIncome) <= 0
    ) {
      alert("Please enter a valid monthly income.");
      return false;
    }

    if (!personal.occupation?.trim()) {
      alert("Occupation is missing.");
      return false;
    }

    if (!loan.loanType) {
      alert("Loan type is missing.");
      return false;
    }

    if (
      !Number.isFinite(Number(loan.amount)) ||
      Number(loan.amount) <= 0
    ) {
      alert("Loan amount is invalid.");
      return false;
    }

    if (
      !Number.isFinite(Number(loan.months)) ||
      Number(loan.months) <= 0
    ) {
      alert("Loan tenure is invalid.");
      return false;
    }

    if (!loan.purpose?.trim()) {
      alert("Please provide the loan purpose.");
      return false;
    }

    if (!requiredDocumentFilesPresent) {
      alert(
        "Please upload all required documents before submitting."
      );
      return false;
    }

    // PROPERTY LOAN VALIDATION
    if (loan.loanType === "PROPERTY") {
      if (!propertyDocumentUploadId) {
        alert("Please upload the property document before submitting.");
        return false;
      }

      if (!loan.propertyType) {
        alert("Please select the property type.");
        return false;
      }

      if (
        !Number.isFinite(Number(loan.propertyValue)) ||
        Number(loan.propertyValue) <= 0
      ) {
        alert("Please enter a valid property value.");
        return false;
      }

      if (!loan.propertyAddress?.trim()) {
        alert("Please provide the property address.");
        return false;
      }

      if (!loan.ownershipStatus) {
        alert("Please provide the property ownership status.");
        return false;
      }
    }

    // GOLD LOAN VALIDATION
    if (loan.loanType === "GOLD") {
      if (
        !Number.isFinite(Number(loan.goldWeight)) ||
        Number(loan.goldWeight) <= 0
      ) {
        alert("Please enter a valid gold weight.");
        return false;
      }

      if (!loan.goldPurity) {
        alert("Please select the gold purity.");
        return false;
      }

      if (
        !Number.isFinite(Number(loan.goldValue)) ||
        Number(loan.goldValue) <= 0
      ) {
        alert("Please enter a valid gold value.");
        return false;
      }

      if (!loan.goldOwnership) {
        alert("Please provide the gold ownership details.");
        return false;
      }
    }

    return true;

  };
  // --------------------------------------------------
  // SUBMIT APPLICATION
  // --------------------------------------------------

  const submitLoan = async () => {
    if (
      !canStartLoanSubmission(
        submissionLock.current,
        isSubmitting,
        submissionSucceeded
      )
    ) {
      return;
    }

    if (!validateApplication()) return;

    // A completed high-risk assessment remains a submission restriction.
    if (highFraudRisk) {
      alert(
        "Loan submission blocked because HIGH fraud risk was detected. Further review is required."
      );
      return;
    }

    if (!result.approved && allRequiredDocumentsOCRVerified) {
      alert(
        "Your current eligibility estimate does not meet the approval criteria. The application cannot be submitted through this flow."
      );
      return;
    }

    submissionLock.current = true;

    try {
      setIsSubmitting(true);

      const loanPayload = {
        fullName: personal.fullName.trim(),
        email: personal.email.trim(),
        phone: personal.phone.trim(),

        monthlyIncome: Number(personal.monthlyIncome),
        occupation: personal.occupation,

        loanType: loan.loanType,
        loanAmount: Number(loan.amount),
        loanMonths: Number(loan.months),
        purpose: loan.purpose,

        // PROPERTY LOAN DETAILS
        propertyType:
          loan.loanType === "PROPERTY"
            ? loan.propertyType
            : null,

        propertyValue:
          loan.loanType === "PROPERTY"
            ? Number(loan.propertyValue || 0)
            : null,

        propertyAddress:
          loan.loanType === "PROPERTY"
            ? loan.propertyAddress
            : null,

        ownershipStatus:
          loan.loanType === "PROPERTY"
            ? loan.ownershipStatus
            : null,
        propertyDocumentUploadId:
          loan.loanType === "PROPERTY"
            ? propertyDocumentUploadId
            : null,

        // GOLD LOAN DETAILS
        goldWeight:
          loan.loanType === "GOLD"
            ? Number(loan.goldWeight || 0)
            : null,

        goldPurity:
          loan.loanType === "GOLD"
            ? loan.goldPurity
            : null,

        goldValue:
          loan.loanType === "GOLD"
            ? Number(loan.goldValue || 0)
            : null,

        goldOwnership:
          loan.loanType === "GOLD"
            ? loan.goldOwnership
            : null,

        // Only send OCR-derived fraud data when the assessment is complete.
        ...(validFraudAssessment
          ? {
              fraudScore,
              fraudRisk,
              fraudFlags: [...fraudFlags],
            }
          : {}),
        assessmentCompleted: validFraudAssessment,

        // VERIFICATION INDICATORS
        documentsVerified,
        bankVerified,
      };

      // Do not log applicant PII or financial documents.
      const submission = await applyLoan(loanPayload);

      setSubmissionSucceeded(true);

      alert(
        `Loan application submitted successfully for manual review. Reference: ${submission.loan.id}. Final approval is subject to lender review.`
      );

      try {
        // Dashboard lookup remains best-effort after confirmed persistence.
        localStorage.setItem("loanEmail", personal.email);
      } catch (storageError: unknown) {
        console.error(
          "Loan application was saved, but the dashboard lookup could not be stored:",
          storageError
        );
      }

      router.push("/dashboard");
    } catch (err: unknown) {
      submissionLock.current = false;
      console.error("Loan application submission failed.", err);

      const message =
        err instanceof Error
          ? err.message
          : "Loan submission failed. Please try again.";

      alert(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div className="text-center">
        <CheckCircle
          size={70}
          className="mx-auto text-cyan-400"
        />

        <h1 className="mt-5 text-4xl font-bold text-white">
          Loan Eligibility Summary
        </h1>

        <p className="mt-2 text-zinc-400">
          Review your application information and verification status
          before submission.
        </p>
      </div>

      {/* FRAUD STATUS */}
      <div
        className={`rounded-2xl border p-5 ${
          highFraudRisk
            ? "border-red-500/30 bg-red-500/10"
            : !validFraudAssessment
              ? "border-amber-500/30 bg-amber-500/10"
              : "border-green-500/30 bg-green-500/10"
        }`}
      >
        <div className="flex items-start gap-3">
          {!validFraudAssessment || highFraudRisk ? (
            <AlertTriangle className="mt-1 shrink-0 text-amber-400" />
          ) : (
            <ShieldCheck className="mt-1 shrink-0 text-green-400" />
          )}

          <div>
            <h2 className="font-semibold text-white">
              Fraud Assessment
            </h2>

            {highFraudRisk ? (
              <>
                <p className="mt-1 text-sm text-red-300">
                  Completed HIGH fraud risk assessment. Submission is blocked;
                  further review is required.
                </p>
                <p className="mt-2 text-sm text-zinc-300">
                  Risk level: {fraudRisk} · Score: {fraudScore}/100
                </p>
                {fraudFlags.length > 0 && (
                  <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-zinc-300">
                    {fraudFlags.map((flag, index) => (
                      <li key={`${flag}-${index}`}>{flag}</li>
                    ))}
                  </ul>
                )}
              </>
            ) : !validFraudAssessment ? (
              <p className="mt-1 text-sm text-zinc-300">
                Assessment incomplete. The application can be submitted
                for review, but this is not a completed fraud or document
                authenticity check.
              </p>
            ) : (
              <>
                <p className="mt-1 text-sm text-zinc-300">
                  Risk level: {fraudRisk} · Score: {fraudScore}/100
                </p>

                {highFraudRisk && (
                  <p className="mt-2 text-sm text-red-300">
                    Submission blocked. Further review is required.
                  </p>
                )}

                {fraudFlags.length > 0 && (
                  <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-zinc-300">
                    {fraudFlags.map((flag, index) => (
                      <li key={`${flag}-${index}`}>{flag}</li>
                    ))}
                  </ul>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* ESTIMATE CARDS */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Card
          title="Applicant"
          value={personal.fullName || "Applicant"}
        />

        <Card
          title="Estimated Risk Score"
          value={result.score}
        />

        <Card
          title="Eligibility Estimate"
          value={`${result.eligibility}%`}
        />

        <Card
          title="Indicative Interest Rate"
          value={`${result.interestRate}%`}
        />

        <Card
          title="Estimated Monthly EMI"
          value={`₹ ${Number(result.emi || 0).toLocaleString("en-IN")}`}
        />

        <Card
          title="Requested Loan Amount"
          value={`₹ ${Number(loan.amount || 0).toLocaleString("en-IN")}`}
        />

        <Card
          title="Estimated Credit Risk"
          value={result.risk}
        />

        <Card
          title="Application Status"
          value={
            highFraudRisk
              ? "Review Required"
              : !validFraudAssessment
                ? "Pending Review"
                : result.approved
                  ? "Ready to Submit"
                  : "Eligibility Not Met"
          }
        />
      </div>

      {/* DECISION SUMMARY */}
      <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-6">
        <div className="flex items-center gap-3">
          <BrainCircuit className="text-cyan-400" />

          <h2 className="text-xl font-bold text-cyan-300">
            Verification Summary
          </h2>
        </div>

        <ul className="mt-5 space-y-3 text-zinc-300">
          <StatusRow
            label="Aadhaar documents uploaded"
            complete={Boolean(
              documents.aadhaarFront && documents.aadhaarBack
            )}
          />

          <StatusRow
            label="PAN document uploaded"
            complete={Boolean(documents.pan)}
          />

          <StatusRow
            label="Salary slip uploaded"
            complete={Boolean(documents.salarySlip)}
          />

          <StatusRow
            label="Bank passbook uploaded"
            complete={Boolean(documents.passbook)}
          />

          <StatusRow
            label="All required document files present"
            complete={requiredDocumentFilesPresent}
          />

          
<StatusRow
  label="Required documents passed OCR type checks (not authenticity verification)"
  complete={allRequiredDocumentsOCRVerified}
/>


          <StatusRow
            label="Repayment estimate calculated"
            complete={Number(result.emi) > 0}
          />

          <StatusRow
            label="Fraud assessment completed"
            complete={validFraudAssessment}
          />
        </ul>

        <p className="mt-4 text-xs text-zinc-400">
          Uploaded files do not independently prove identity, OCR,
          bank-account ownership, or document authenticity. Those
          checks must be verified by the backend.
        </p>
      </div>

      {/* PRIVACY */}
      <div className="rounded-2xl border border-green-500/20 bg-green-500/10 p-5">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-1 text-green-400" />

          <div>
            <h3 className="font-semibold text-green-400">
              Data Protection
            </h3>

            <p className="mt-1 text-sm text-zinc-300">
              Application data should be protected by secure transport,
              access controls, and appropriate server-side safeguards.
              Encryption during computation is claimed only when the
              corresponding FHE implementation is actually active.
            </p>
          </div>
        </div>
      </div>

      {/* ACTIONS */}
      <div className="flex flex-col justify-center gap-4 sm:flex-row">
        <Button
          variant="outline"
          onClick={() => window.print()}
          disabled={isSubmitting}
        >
          Download / Print Report
        </Button>

        <Button
          className="bg-cyan-500 text-black hover:bg-cyan-400"
          onClick={submitLoan}
          disabled={
            !canStartLoanSubmission(
              false,
              isSubmitting,
              submissionSucceeded
            ) ||
            highFraudRisk ||
            (allRequiredDocumentsOCRVerified && !result.approved)
          }
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <Loader2 size={18} className="animate-spin" />
              Submitting Application...
            </span>
          ) : (
            validFraudAssessment
              ? "Submit Loan Application"
              : "Submit Application for Manual Review"
          )}
        </Button>
      </div>
    </div>
  );
}

// --------------------------------------------------
// REUSABLE COMPONENTS
// --------------------------------------------------

function StatusRow({
  label,
  complete,
}: {
  label: string;
  complete: boolean;
}) {
  return (
    <li className="flex items-start gap-2">
      <span aria-hidden="true">
        {complete ? "✅" : "⚠️"}
      </span>
      <span>{label}</span>
    </li>
  );
}

function Card({
  title,
  value,
}: {
  title: string;
  value: string | number;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-zinc-900 p-5">
      <p className="text-sm text-zinc-400">{title}</p>

      <h2 className="mt-2 break-words text-2xl font-bold text-white">
        {value}
      </h2>
    </div>
  );
}
