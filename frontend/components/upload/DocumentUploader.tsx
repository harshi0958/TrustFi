"use client";

import UploadCard from "@/components/upload/UploadCard";
import { Button } from "@/components/ui/button";
import { useLoanStore } from "@/store/loanStore";

export default function DocumentUpload() {
  const {
    nextStep,
    previousStep,
    loan,
    documents,
    updateDocument,
    setPropertyDocumentUploadId,
    setFraudAssessmentCompleted,
  } = useLoanStore();

  const isPropertyLoan = loan.loanType === "PROPERTY";
  const isGoldLoan = loan.loanType === "GOLD";

  const handleUploaded = (
    documentKey:
      | "salarySlip"
      | "passbook"
      | "propertyDocument"
      | "goldDocument",
    uploadId?: string
  ) => {
    updateDocument(documentKey, true);
    if (documentKey === "propertyDocument") {
      setPropertyDocumentUploadId(uploadId ?? null);
    }
  };

  const handleRemoved = (
    documentKey:
      | "salarySlip"
      | "passbook"
      | "propertyDocument"
      | "goldDocument"
  ) => {
    updateDocument(documentKey, false);
    if (documentKey === "propertyDocument") {
      setPropertyDocumentUploadId(null);
    }
  };

  const financialDocumentsUploaded =
    documents.salarySlip && documents.passbook;

  const loanSpecificDocumentUploaded =
    isPropertyLoan
      ? documents.propertyDocument
      : isGoldLoan
      ? documents.goldDocument
      : true;

  const allRequiredDocumentsUploaded =
    financialDocumentsUploaded &&
    loanSpecificDocumentUploaded;

  const documentStatus = (uploaded: boolean) =>
    uploaded
      ? "File received; authenticity unverified"
      : "Required";

  const continueToAIReview = () => {
    setFraudAssessmentCompleted(true);
    nextStep();
  };

  return (
    <div className="space-y-8">

      {/* ---------------- HEADER ---------------- */}

      <div>
        <h1 className="text-3xl font-bold text-white">
          Document Upload
        </h1>

        <p className="mt-2 text-zinc-400">
          Upload your financial and loan-specific documents
          for upload and review. Upload completion does not establish
          document authenticity.
        </p>
      </div>

      {/* ---------------- LOAN TYPE ---------------- */}

      <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-5">

        <p className="text-sm text-zinc-400">
          Selected Loan Type
        </p>

        <h2 className="mt-1 text-xl font-semibold text-cyan-300">
          {loan.loanType === "PERSONAL"
            ? "Personal Loan"
            : loan.loanType === "PROPERTY"
            ? "Property Loan"
            : "Gold Loan"}
        </h2>

        {isPropertyLoan && (
          <p className="mt-2 text-sm text-zinc-400">
            Property ownership or property-related
            documents are required for verification.
          </p>
        )}

        {isGoldLoan && (
          <p className="mt-2 text-sm text-zinc-400">
            Gold ownership, purchase, or valuation
            documents are required for verification.
          </p>
        )}

      </div>

      {/* ---------------- FINANCIAL DOCUMENTS ---------------- */}

      <div>

        <h2 className="mb-4 text-xl font-semibold text-white">
          Financial Documents
        </h2>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

          {/* Salary Slip */}

          <UploadCard
            title="Salary Slip"
            documentType="SALARY_SLIP"
            documentKey="salarySlip"
            onUploaded={() =>
              handleUploaded("salarySlip")
            }
            onRemoved={() =>
              handleRemoved("salarySlip")
            }
          />

          {/* Bank Passbook */}

          <UploadCard
            title="Bank Passbook / Statement"
            documentType="BANK_PASSBOOK"
            documentKey="passbook"
            onUploaded={() =>
              handleUploaded("passbook")
            }
            onRemoved={() =>
              handleRemoved("passbook")
            }
          />

        </div>

      </div>

      {/* ---------------- PROPERTY LOAN ---------------- */}

      {isPropertyLoan && (
        <div>

          <h2 className="mb-4 text-xl font-semibold text-white">
            Property Loan Documents
          </h2>

          <UploadCard
            title="Property Ownership / Sale Deed"
            documentType="PROPERTY_DOCUMENT"
            documentKey="propertyDocument"
            onUploaded={(uploadId) =>
              handleUploaded("propertyDocument", uploadId)
            }
            onRemoved={() =>
              handleRemoved("propertyDocument")
            }
          />

        </div>
      )}

      {/* ---------------- GOLD LOAN ---------------- */}

      {isGoldLoan && (
        <div>

          <h2 className="mb-4 text-xl font-semibold text-white">
            Gold Loan Documents
          </h2>

          <UploadCard
            title="Gold Ownership / Purchase / Valuation Document"
            documentType="GOLD_DOCUMENT"
            documentKey="goldDocument"
            onUploaded={() =>
              handleUploaded("goldDocument")
            }
            onRemoved={() =>
              handleRemoved("goldDocument")
            }
          />

        </div>
      )}

      {/* ---------------- AI VERIFICATION ---------------- */}

      <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-6">

        <h2 className="text-xl font-semibold text-cyan-300">
          AI Verification
        </h2>

        <ul className="mt-4 space-y-2 text-zinc-300">

          <li>
            ✅ OCR extracts document details automatically.
          </li>

          <li>
            ✅ Document type is checked against the
            selected document field.
          </li>

          <li>
            ✅ Salary and banking information can be
            analyzed for credit assessment.
          </li>

          {isPropertyLoan && (
            <li>
              ✅ Property document verification is required
              for Property Loan.
            </li>
          )}

          {isGoldLoan && (
            <li>
              ✅ Gold ownership/valuation document
              verification is required for Gold Loan.
            </li>
          )}

          <li>Fully Homomorphic Encryption is not verified in this flow.</li>

        </ul>

      </div>

      {/* ---------------- DOCUMENT STATUS ---------------- */}

      <div className="rounded-xl border border-white/10 bg-zinc-900 p-5">

        <h2 className="text-lg font-semibold text-white">
          Document Status
        </h2>

        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">

          <div className="flex items-center justify-between rounded-lg bg-zinc-800 p-3">
            <span className="text-zinc-300">
              Salary Slip
            </span>

            <span
              className={
                documents.salarySlip
                  ? "text-amber-300"
                  : "text-red-400"
              }
            >
              {documentStatus(documents.salarySlip)}
            </span>
          </div>

          <div className="flex items-center justify-between rounded-lg bg-zinc-800 p-3">
            <span className="text-zinc-300">
              Bank Statement
            </span>

            <span
              className={
                documents.passbook
                  ? "text-amber-300"
                  : "text-red-400"
              }
            >
              {documentStatus(documents.passbook)}
            </span>
          </div>

          {isPropertyLoan && (
            <div className="flex items-center justify-between rounded-lg bg-zinc-800 p-3">

              <span className="text-zinc-300">
                Property Document
              </span>

              <span
                className={
                  documents.propertyDocument
                    ? "text-amber-300"
                    : "text-red-400"
                }
              >
                {documentStatus(
                  documents.propertyDocument
                )}
              </span>

            </div>
          )}

          {isGoldLoan && (
            <div className="flex items-center justify-between rounded-lg bg-zinc-800 p-3">

              <span className="text-zinc-300">
                Gold Document
              </span>

              <span
                className={
                  documents.goldDocument
                    ? "text-amber-300"
                    : "text-red-400"
                }
              >
                {documentStatus(documents.goldDocument)}
              </span>

            </div>
          )}

        </div>

      </div>

      {/* ---------------- NAVIGATION ---------------- */}

      <div className="flex justify-between">

        <Button
          variant="outline"
          onClick={previousStep}
        >
          Previous
        </Button>

        <Button
          className="bg-cyan-500 text-black hover:bg-cyan-400"
          disabled={!allRequiredDocumentsUploaded}
          onClick={continueToAIReview}
        >
          Continue to AI Review
        </Button>

      </div>

    </div>
  );
}