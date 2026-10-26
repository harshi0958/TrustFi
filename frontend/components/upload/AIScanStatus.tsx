"use client";

import { AlertTriangle, BrainCircuit } from "lucide-react";

export default function AIScanStatus({
  isSelfie,
  documentValid,
  validationMessage,
  ocrSkipped,
}: {
  isSelfie: boolean;
  documentValid: boolean | null;
  validationMessage: string;
  ocrSkipped: boolean;
}) {
  return (
    <div className="mt-4 rounded-xl border border-cyan-500/20 bg-cyan-500/10 p-4">
      <div className="flex items-center gap-3">
        <BrainCircuit className="text-cyan-400" />

        <div>
          <h3 className="font-semibold text-white">
            Upload Status
          </h3>

          <p className="text-sm text-zinc-400">
            {isSelfie
              ? "Photo received. Identity and authenticity have not been verified."
              : ocrSkipped
                ? "Property document file received. OCR, ownership, and authenticity have not been checked."
              : documentValid === true
                ? "File received. OCR type check passed; document authenticity is not confirmed."
                : "File received. OCR verification is incomplete; manual review is still required."}
          </p>
          {!isSelfie &&
            !ocrSkipped &&
            documentValid !== true &&
            validationMessage && (
              <p className="mt-1 text-xs text-amber-300">
                OCR note: {validationMessage}
              </p>
            )}
        </div>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <AlertTriangle className="text-yellow-400" />

        <p className="text-sm text-yellow-300">
          Privacy-preserving FHE execution is not verified in this flow.
        </p>
      </div>
    </div>
  );
}