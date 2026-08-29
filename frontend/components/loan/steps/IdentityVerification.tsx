"use client";

import { useState } from "react";

import UploadCard from "@/components/upload/UploadCard";
import { Button } from "@/components/ui/button";
import { useLoanStore } from "@/store/loanStore";

function normalizeName(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export default function IdentityVerification() {
  const {
    nextStep,
    documents,
    updateDocument,
    personal,
  } = useLoanStore();

  const [identityErrors, setIdentityErrors] = useState<
    Record<string, string>
  >({});

  /*
   * -----------------------------------------
   * NAME MATCHING
   * -----------------------------------------
   */

  const validateIdentityName = (
    documentKey: string,
    result: any
  ) => {
    const applicantName = normalizeName(
      personal.fullName
    );

    const extractedName = normalizeName(
      result?.extractedText?.name || ""
    );

    console.log("Applicant Name:", personal.fullName);
    console.log(
      "OCR Name:",
      result?.extractedText?.name
    );

    /*
     * OCR could not find a name
     */

    if (!applicantName || !extractedName) {
      setIdentityErrors((prev) => ({
        ...prev,
        [documentKey]:
          "Unable to verify the name from this document.",
      }));

      return false;
    }

    /*
     * Split names into individual words
     */

    const applicantParts = applicantName.split(" ");
    const extractedParts = extractedName.split(" ");

    /*
     * Count matching words
     */

    const matchedParts = applicantParts.filter(
      (part) =>
        extractedParts.includes(part)
    );

    const matchRatio =
      matchedParts.length /
      applicantParts.length;

    console.log("Name Match Ratio:", matchRatio);

    /*
     * Require at least 50% name match
     */

    if (matchRatio < 0.5) {
      setIdentityErrors((prev) => ({
        ...prev,
        [documentKey]:
          `Identity mismatch. Application name "${personal.fullName}" does not match the document name "${result.extractedText.name}".`,
      }));

      return false;
    }

    /*
     * Identity verified
     */

    setIdentityErrors((prev) => {
      const updated = { ...prev };

      delete updated[documentKey];

      return updated;
    });

    return true;
  };

  /*
   * -----------------------------------------
   * FORM VALIDATION
   * -----------------------------------------
   */

  const formValid =
    documents.aadhaarFront &&
    documents.aadhaarBack &&
    documents.pan &&
    documents.selfie &&
    documents.salarySlip &&
    documents.passbook;

  return (
    <div className="space-y-8">

      {/* HEADER */}

      <div>
        <h1 className="text-4xl font-bold text-white">
          Identity Verification
        </h1>

        <p className="mt-2 text-zinc-400">
          Upload your KYC documents securely.
          Documents will be checked using OCR
          and identity matching.
        </p>
      </div>

      {/* DOCUMENTS */}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

        {/* AADHAAR FRONT */}

        <div>
          <UploadCard
            title="Aadhaar Front"
            documentType="AADHAAR"

            onValidation={(result) =>
              validateIdentityName(
                "aadhaarFront",
                result
              )
            }

            onUploaded={() =>
              updateDocument(
                "aadhaarFront",
                true
              )
            }

            onRemoved={() =>
              updateDocument(
                "aadhaarFront",
                false
              )
            }
          />

          {identityErrors.aadhaarFront && (
            <p className="mt-2 text-sm text-red-400">
              {identityErrors.aadhaarFront}
            </p>
          )}
        </div>

        {/* AADHAAR BACK */}

        <div>
          <UploadCard
            title="Aadhaar Back"
            documentType="AADHAAR"

            onValidation={(result) =>
              validateIdentityName(
                "aadhaarBack",
                result
              )
            }

            onUploaded={() =>
              updateDocument(
                "aadhaarBack",
                true
              )
            }

            onRemoved={() =>
              updateDocument(
                "aadhaarBack",
                false
              )
            }
          />

          {identityErrors.aadhaarBack && (
            <p className="mt-2 text-sm text-red-400">
              {identityErrors.aadhaarBack}
            </p>
          )}
        </div>

        {/* PAN */}

        <div>
          <UploadCard
            title="PAN Card"
            documentType="PAN"

            onValidation={(result) =>
              validateIdentityName(
                "pan",
                result
              )
            }

            onUploaded={() =>
              updateDocument(
                "pan",
                true
              )
            }

            onRemoved={() =>
              updateDocument(
                "pan",
                false
              )
            }
          />

          {identityErrors.pan && (
            <p className="mt-2 text-sm text-red-400">
              {identityErrors.pan}
            </p>
          )}
        </div>

        {/* SELFIE */}

        <div>
          <UploadCard
            title="Selfie"
            documentType="SELFIE"

            onUploaded={() =>
              updateDocument(
                "selfie",
                true
              )
            }

            onRemoved={() =>
              updateDocument(
                "selfie",
                false
              )
            }
          />
        </div>

        {/* SALARY SLIP */}

        <div>
          <UploadCard
            title="Salary Slip"
            documentType="SALARY_SLIP"

            onUploaded={() =>
              updateDocument(
                "salarySlip",
                true
              )
            }

            onRemoved={() =>
              updateDocument(
                "salarySlip",
                false
              )
            }
          />
        </div>

        {/* BANK PASSBOOK */}

        <div>
          <UploadCard
            title="Bank Passbook"
            documentType="BANK_PASSBOOK"

            onUploaded={() =>
              updateDocument(
                "passbook",
                true
              )
            }

            onRemoved={() =>
              updateDocument(
                "passbook",
                false
              )
            }
          />
        </div>

      </div>

      {/* IDENTITY ERROR */}

      {Object.keys(identityErrors).length > 0 && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-5">

          <h3 className="font-semibold text-red-400">
            Identity Verification Failed
          </h3>

          <p className="mt-2 text-sm text-red-300">
            One or more uploaded documents could
            not be matched with the applicant
            information.
          </p>

        </div>
      )}

      {/* FORM ERROR */}

      {!formValid && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4">

          <p className="text-red-400">
            Please upload and verify all required
            documents.
          </p>

        </div>
      )}

      {/* BUTTON */}

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