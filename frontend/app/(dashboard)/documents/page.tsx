"use client";

import {
  FileCheck,
} from "lucide-react";
import { useLoanStore } from "@/store/loanStore";

export default function DocumentsPage() {
  const { documents, loan, fraudAssessment } = useLoanStore();
  const documentRows = [
    { name: "Aadhaar Front", key: "aadhaarFront" },
    { name: "Aadhaar Back", key: "aadhaarBack" },
    { name: "PAN Card", key: "pan" },
    { name: "Selfie", key: "selfie" },
    { name: "Salary Slip", key: "salarySlip" },
    { name: "Bank Passbook", key: "passbook" },
    ...(loan.loanType === "PROPERTY"
      ? [{ name: "Property Document", key: "propertyDocument" }]
      : loan.loanType === "GOLD"
        ? [{ name: "Gold Document", key: "goldDocument" }]
        : []),
  ];

  const getStatus = (key: string) => {
    const result = fraudAssessment.documentResults[key];

    if (result) {
      return result.documentValid && result.confidence >= 70
        ? "OCR type check passed"
        : "OCR validation incomplete";
    }

    return documents[key as keyof typeof documents]
      ? "File uploaded; validation not recorded"
      : "Not uploaded";
  };

  return (
    <div className="space-y-8">

      <h1 className="text-4xl font-bold text-white">
        Documents
      </h1>

      <div className="grid gap-6">

        {documentRows.map((doc) => (

          <div
            key={doc.name}
            className="rounded-3xl border border-white/10 bg-zinc-900 p-6"
          >

            <div className="flex items-center justify-between">

              <div className="flex items-center gap-4">

                <div className="rounded-xl bg-cyan-500/10 p-4">

                  <FileCheck
                    className="text-cyan-400"
                    size={28}
                  />

                </div>

                <div>

                  <h2 className="text-xl font-bold text-white">
                    {doc.name}
                  </h2>

                  <p className="text-zinc-400">
                    {getStatus(doc.key)}
                  </p>

                </div>

              </div>

              <div className="flex items-center gap-3">

                <span className="rounded-full bg-yellow-500/10 px-4 py-2 text-yellow-300">
                  {getStatus(doc.key)}

                </span>

              </div>

            </div>

          </div>

        ))}

      </div>

      <div className="rounded-3xl border border-yellow-500/20 bg-yellow-500/10 p-8">

        <h2 className="text-2xl font-bold text-yellow-300">
          Verification Status
        </h2>

        <div className="mt-6 space-y-3 text-zinc-300">

          <p>
            OCR type checks passed:{" "}
            {
              Object.values(fraudAssessment.documentResults).filter(
                (result) =>
                  result.documentValid && result.confidence >= 70
              ).length
            }
          </p>
          <p>
            Type checks do not establish document authenticity, identity
            ownership, or bank-account ownership.
          </p>
          <p>
            Fraud assessment:{" "}
            {fraudAssessment.assessmentCompleted
              ? fraudAssessment.fraudRisk
              : "Incomplete"}
          </p>
          <p>FHE processing is not verified in this flow.</p>

        </div>

      </div>

    </div>
  );
}