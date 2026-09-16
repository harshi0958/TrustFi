"use client";

import { useState } from "react";
import UploadCard from "@/components/upload/UploadCard";
import { Button } from "@/components/ui/button";
import { useLoanStore } from "@/store/loanStore";

/*
 * -----------------------------------------
 * NAME NORMALIZATION
 * -----------------------------------------
 */

function normalizeName(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/*
 * -----------------------------------------
 * LEVENSHTEIN DISTANCE
 * -----------------------------------------
 */

function levenshtein(a: string, b: string) {
  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

/*
 * -----------------------------------------
 * WORD SIMILARITY
 * -----------------------------------------
 */

function wordSimilarity(
  word1: string,
  word2: string
) {
  if (!word1 || !word2) return 0;

  if (word1 === word2) return 1;

  const distance = levenshtein(
    word1,
    word2
  );

  const maxLength = Math.max(
    word1.length,
    word2.length
  );

  if (maxLength === 0) return 1;

  return 1 - distance / maxLength;
}

/*
 * -----------------------------------------
 * OCR NAME QUALITY CHECK
 * -----------------------------------------
 *
 * Returns true when OCR appears reasonably
 * related to the applicant name.
 *
 * Garbage OCR should NOT be treated as a
 * genuine identity mismatch.
 */

function isUsableOCRName(
  applicantName: string,
  documentName: string
) {
  if (!documentName) return false;

  const normalizedApplicant =
    normalizeName(applicantName);

  const normalizedDocument =
    normalizeName(documentName);

  if (
    !normalizedApplicant ||
    !normalizedDocument
  ) {
    return false;
  }

  const applicantParts =
    normalizedApplicant
      .split(" ")
      .filter(Boolean);

  const documentParts =
    normalizedDocument
      .split(" ")
      .filter(Boolean);

  if (
    applicantParts.length < 2 ||
    documentParts.length < 2
  ) {
    return false;
  }

  /*
   * Common OCR placeholders.
   */

  const invalidWords = [
    "unknown",
    "not",
    "found",
    "name",
    "n",
    "na",
    "null",
    "undefined",
  ];

  if (
    documentParts.some((word) =>
      invalidWords.includes(word)
    )
  ) {
    return false;
  }

  /*
   * Compare OCR words with applicant words.
   *
   * Example:
   *
   * Harshit Jariwala
   *
   * OCR:
   * wa wow bathly
   *
   * There is almost no similarity,
   * therefore OCR is considered unreliable.
   */

  let bestSimilarity = 0;

  for (const documentWord of documentParts) {
    for (const applicantWord of applicantParts) {
      const similarity = wordSimilarity(
        documentWord,
        applicantWord
      );

      bestSimilarity = Math.max(
        bestSimilarity,
        similarity
      );
    }
  }

  console.log(
    "Best OCR Name Similarity:",
    bestSimilarity
  );

  /*
   * Very low similarity means OCR is likely
   * garbage/unreliable.
   */

  if (bestSimilarity < 0.35) {
    return false;
  }

  return true;
}

/*
 * -----------------------------------------
 * SMART NAME MATCHING
 * -----------------------------------------
 *
 * Returns:
 *
 * true  = MATCH
 * false = CLEAR MISMATCH
 * null  = OCR UNRELIABLE
 */

function nameMatches(
  applicantName: string,
  documentName: string
): boolean | null {
  const normalizedApplicant =
    normalizeName(applicantName);

  const normalizedDocument =
    normalizeName(documentName);

  if (
    !normalizedApplicant ||
    !normalizedDocument
  ) {
    return null;
  }

  /*
   * First determine whether OCR is reliable
   * enough to perform identity matching.
   */

  if (
    !isUsableOCRName(
      applicantName,
      documentName
    )
  ) {
    console.warn(
      "OCR name appears unreliable:",
      documentName
    );

    return null;
  }

  const applicantParts =
    normalizedApplicant
      .split(" ")
      .filter(Boolean);

  const documentParts =
    normalizedDocument
      .split(" ")
      .filter(Boolean);

  if (
    applicantParts.length < 2 ||
    documentParts.length < 2
  ) {
    return null;
  }

  /*
   * -----------------------------------------
   * FIRST NAME
   * -----------------------------------------
   */

  const applicantFirstName =
    applicantParts[0];

  const documentFirstName =
    documentParts[0];

  const firstNameSimilarity =
    wordSimilarity(
      applicantFirstName,
      documentFirstName
    );

  /*
   * -----------------------------------------
   * LAST NAME
   * -----------------------------------------
   */

  const applicantLastName =
    applicantParts[
      applicantParts.length - 1
    ];

  const documentLastName =
    documentParts[
      documentParts.length - 1
    ];

  const lastNameSimilarity =
    wordSimilarity(
      applicantLastName,
      documentLastName
    );

  console.log(
    "First Name Similarity:",
    firstNameSimilarity
  );

  console.log(
    "Last Name Similarity:",
    lastNameSimilarity
  );

  /*
   * -----------------------------------------
   * EXACT MATCH
   * -----------------------------------------
   */

  if (
    applicantFirstName ===
      documentFirstName &&
    applicantLastName ===
      documentLastName
  ) {
    return true;
  }

  /*
   * -----------------------------------------
   * SMALL OCR TYPO
   * -----------------------------------------
   *
   * Example:
   *
   * Harshit -> Harshlt
   * Jariwala -> Jariwata
   *
   * Accept because OCR can make small
   * character-level mistakes.
   */

  if (
    firstNameSimilarity >= 0.75 &&
    lastNameSimilarity >= 0.75
  ) {
    return true;
  }

  /*
   * -----------------------------------------
   * CLEAR FIRST NAME MISMATCH
   * -----------------------------------------
   *
   * Example:
   *
   * Applicant:
   * Harshit Jariwala
   *
   * Document:
   * Dhwnil Jariwala
   *
   * Last name is same but first name is
   * clearly different.
   */

  if (
    firstNameSimilarity < 0.55 &&
    lastNameSimilarity >= 0.75
  ) {
    return false;
  }

  /*
   * -----------------------------------------
   * CLEAR COMPLETE MISMATCH
   * -----------------------------------------
   */

  if (
    firstNameSimilarity < 0.55 &&
    lastNameSimilarity < 0.55
  ) {
    return false;
  }

  /*
   * -----------------------------------------
   * BORDERLINE OCR
   * -----------------------------------------
   *
   * Instead of rejecting the applicant,
   * send it to manual verification.
   */

  return null;
}

/*
 * -----------------------------------------
 * DOCUMENT LABEL
 * -----------------------------------------
 */

function getDocumentLabel(
  documentKey: string
) {
  switch (documentKey) {
    case "aadhaarFront":
      return "Aadhaar Front";

    case "aadhaarBack":
      return "Aadhaar Back";

    case "pan":
      return "PAN Card";

    case "salarySlip":
      return "Salary Slip";

    case "passbook":
      return "Bank Passbook";

    default:
      return "Document";
  }
}

/*
 * -----------------------------------------
 * MAIN COMPONENT
 * -----------------------------------------
 */

export default function IdentityVerification() {
  const {
    nextStep,
    documents,
    updateDocument,
    personal,
  } = useLoanStore();

  const [
    identityErrors,
    setIdentityErrors,
  ] = useState<Record<string, string>>({});

  /*
   * -----------------------------------------
   * IDENTITY NAME VALIDATION
   * -----------------------------------------
   */

  const validateIdentityName = (
    documentKey: string,
    result: any
  ) => {
    const applicantName =
      normalizeName(
        personal.fullName || ""
      );

    const rawExtractedName =
      result?.extractedText?.name || "";

    const extractedName =
      normalizeName(
        rawExtractedName
      );

    const documentLabel =
      getDocumentLabel(documentKey);

    console.log(
      "================================="
    );

    console.log(
      "Document:",
      documentLabel
    );

    console.log(
      "Applicant Name:",
      personal.fullName
    );

    console.log(
      "OCR Name:",
      rawExtractedName
    );

    console.log(
      "Normalized Applicant:",
      applicantName
    );

    console.log(
      "Normalized Document:",
      extractedName
    );

    /*
     * -----------------------------------------
     * APPLICANT NAME MISSING
     * -----------------------------------------
     */

    if (!applicantName) {
      setIdentityErrors((prev) => ({
        ...prev,
        [documentKey]:
          "Please enter your full name before uploading identity documents.",
      }));

      return false;
    }

    /*
     * -----------------------------------------
     * OCR NAME NOT RELIABLE
     * -----------------------------------------
     *
     * IMPORTANT:
     *
     * Garbage OCR is NOT an identity mismatch.
     *
     * The document is allowed to continue and
     * can be manually verified later.
     */

    if (
      !isUsableOCRName(
        applicantName,
        rawExtractedName
      )
    ) {
      console.warn(
        `${documentLabel}: OCR name is unreliable. Manual verification required.`
      );

      setIdentityErrors((prev) => {
        const updated = {
          ...prev,
        };

        delete updated[documentKey];

        return updated;
      });

      return true;
    }

    /*
     * -----------------------------------------
     * SMART NAME MATCH
     * -----------------------------------------
     */

    const matched = nameMatches(
      applicantName,
      extractedName
    );

    console.log(
      "Identity Name Match:",
      matched
    );

    /*
     * -----------------------------------------
     * OCR UNRELIABLE / BORDERLINE
     * -----------------------------------------
     */

    if (matched === null) {
      console.warn(
        `${documentLabel}: OCR result is not reliable enough for automatic matching.`
      );

      setIdentityErrors((prev) => {
        const updated = {
          ...prev,
        };

        delete updated[documentKey];

        return updated;
      });

      /*
       * Allow upload.
       *
       * Manual verification can happen later.
       */

      return true;
    }

    /*
     * -----------------------------------------
     * CLEAR NAME MISMATCH
     * -----------------------------------------
     */

    if (matched === false) {
      setIdentityErrors((prev) => ({
        ...prev,
        [documentKey]:
          `Identity mismatch. Application name "${personal.fullName}" does not match the document name "${rawExtractedName}".`,
      }));

      console.error(
        `${documentLabel}: Identity mismatch`
      );

      return false;
    }

    /*
     * -----------------------------------------
     * IDENTITY VERIFIED
     * -----------------------------------------
     */

    setIdentityErrors((prev) => {
      const updated = {
        ...prev,
      };

      delete updated[documentKey];

      return updated;
    });

    console.log(
      `Identity verified for ${documentLabel}`
    );

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

  /*
   * -----------------------------------------
   * UI
   * -----------------------------------------
   */

  return (
    <div className="space-y-8">

      {/* ---------------------------------- */}
      {/* HEADER */}
      {/* ---------------------------------- */}

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

      {/* ---------------------------------- */}
      {/* DOCUMENTS */}
      {/* ---------------------------------- */}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

        {/* -------------------------------- */}
        {/* AADHAAR FRONT */}
        {/* -------------------------------- */}

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

        {/* -------------------------------- */}
        {/* AADHAAR BACK */}
        {/* -------------------------------- */}

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

        {/* -------------------------------- */}
        {/* PAN CARD */}
        {/* -------------------------------- */}

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

        {/* -------------------------------- */}
        {/* SELFIE */}
        {/* -------------------------------- */}

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

        {/* -------------------------------- */}
        {/* SALARY SLIP */}
        {/* -------------------------------- */}

        <div>
          <UploadCard
            title="Salary Slip"
            documentType="SALARY_SLIP"

            onValidation={(result) =>
              validateIdentityName(
                "salarySlip",
                result
              )
            }

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

          {identityErrors.salarySlip && (
            <p className="mt-2 text-sm text-red-400">
              {identityErrors.salarySlip}
            </p>
          )}
        </div>

        {/* -------------------------------- */}
        {/* BANK PASSBOOK */}
        {/* -------------------------------- */}

        <div>
          <UploadCard
            title="Bank Passbook"
            documentType="BANK_PASSBOOK"

            onValidation={(result) =>
              validateIdentityName(
                "passbook",
                result
              )
            }

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

          {identityErrors.passbook && (
            <p className="mt-2 text-sm text-red-400">
              {identityErrors.passbook}
            </p>
          )}
        </div>

      </div>

      {/* ---------------------------------- */}
      {/* IDENTITY ERROR */}
      {/* ---------------------------------- */}

      {Object.keys(identityErrors).length > 0 && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-5">

          <h3 className="font-semibold text-red-400">
            Identity Verification Failed
          </h3>

          <p className="mt-2 text-sm text-red-300">
            One or more uploaded documents
            could not be matched with the
            applicant information.
          </p>

        </div>
      )}

      {/* ---------------------------------- */}
      {/* FORM ERROR */}
      {/* ---------------------------------- */}

      {!formValid && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4">

          <p className="text-red-400">
            Please upload and verify all
            required documents.
          </p>

        </div>
      )}

      {/* ---------------------------------- */}
      {/* BUTTON */}
      {/* ---------------------------------- */}

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