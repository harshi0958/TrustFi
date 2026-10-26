
"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud } from "lucide-react";

import FilePreview from "./FilePreview";
import UploadProgress from "./UploadProgress";
import AIScanStatus from "./AIScanStatus";
import { useLoanStore } from "@/store/loanStore";
import { uploadDocument, type OCRDocumentType } from "@/lib/api";

interface OCRUploadResponse {
  success?: unknown;
  message?: unknown;
  uploadId?: unknown;
  ocrSkipped?: unknown;
  validationMessage?: unknown;
  extractedText?: {
    documentValid?: unknown;
    confidence?: unknown;
    fraudRisk?: unknown;
    fraudRiskLevel?: unknown;
    fraudFlags?: unknown;
    validationMessage?: unknown;
    name?: unknown;
  };
  fraudAssessment?: {
    fraudScore?: unknown;
    fraudRisk?: unknown;
    fraudFlags?: unknown;
    validationMessage?: unknown;
  };
}

function isOCRUploadResponse(value: unknown): value is OCRUploadResponse {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function getResponseMessage(
  result: OCRUploadResponse | null
): string | undefined {
  const messages = [
    result?.extractedText?.validationMessage,
    result?.validationMessage,
    result?.message,
  ];

  return messages.find(
    (message): message is string =>
      typeof message === "string" && message.length > 0
  );
}

interface Props {
  title: string;
  documentType: OCRDocumentType;
  documentKey?: string;
  onUploaded?: (uploadId?: string) => void;
  onRemoved?: () => void;
  onValidation?: (result: OCRUploadResponse) => boolean | void;
}

export default function UploadCard({
  title,
  documentType,
  documentKey,
  onUploaded,
  onRemoved,
  onValidation,
}: Props) {
  const {
    updateDocumentFraudAssessment,
    clearDocumentFraudAssessment,
  } = useLoanStore();

  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [validationError, setValidationError] = useState("");
  const [ocrDocumentValid, setOcrDocumentValid] =
    useState<boolean | null>(null);
  const [ocrValidationMessage, setOcrValidationMessage] =
    useState("");
  const [ocrSkipped, setOcrSkipped] = useState(false);

  const isSelfie = documentType === "SELFIE";

  const clearDocumentAssessment = useCallback(() => {
    if (documentKey) {
      clearDocumentFraudAssessment(documentKey);
    }
  }, [clearDocumentFraudAssessment, documentKey]);

  const recordDocumentAssessment = useCallback((
    result: OCRUploadResponse,
    identityValidated = true
  ) => {
    if (!documentKey) return;

    const extracted = result?.extractedText;
    const assessment = result?.fraudAssessment;
    const fraudScore = Number(
      assessment?.fraudScore ?? extracted?.fraudRisk
    );
    const confidence = Number(extracted?.confidence);
    const fraudRisk =
      assessment?.fraudRisk ?? extracted?.fraudRiskLevel;
    const fraudFlags: unknown =
      assessment?.fraudFlags ?? extracted?.fraudFlags;

    if (
      !extracted ||
      typeof extracted.documentValid !== "boolean" ||
      !Number.isFinite(fraudScore) ||
      fraudScore < 0 ||
      fraudScore > 100 ||
      !Number.isFinite(confidence) ||
      confidence < 0 ||
      confidence > 100 ||
      (
        fraudRisk !== "LOW" &&
        fraudRisk !== "MEDIUM" &&
        fraudRisk !== "HIGH"
      ) ||
      !Array.isArray(fraudFlags) ||
      !fraudFlags.every((flag: unknown) => typeof flag === "string")
    ) {
      clearDocumentAssessment();
      return;
    }

    const validationMessage =
      typeof extracted.validationMessage === "string"
        ? extracted.validationMessage
        : typeof assessment?.validationMessage === "string"
          ? assessment.validationMessage
          : "";

    updateDocumentFraudAssessment(documentKey, {
      fraudScore,
      fraudRisk,
      fraudFlags: fraudFlags as string[],
      documentValid:
        extracted.documentValid === true && identityValidated,
      confidence,
      validationMessage,
    });
  }, [
    clearDocumentAssessment,
    documentKey,
    updateDocumentFraudAssessment,
  ]);

  /*
   * -----------------------------------------
   * FILE DROP / SELECT
   * -----------------------------------------
   */

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (!acceptedFiles.length) {
        return;
      }

      const selected = acceptedFiles[0];

      /*
       * FILE SIZE VALIDATION
       */

      if (selected.size > 10 * 1024 * 1024) {
        setValidationError("Maximum file size is 10 MB.");
        return;
      }

      /*
       * SELFIE VALIDATION
       *
       * Selfie is not sent to the OCR backend.
       */

      if (isSelfie) {
        if (!selected.type.startsWith("image/")) {
          setValidationError(
            "Please upload a valid image for selfie."
          );
          return;
        }

        clearDocumentAssessment();
        setFile(selected);
        setProgress(100);
        setUploading(false);
        setValidationError("");
        setOcrDocumentValid(null);
        setOcrValidationMessage("");
        setOcrSkipped(false);

        onUploaded?.();
        return;
      }

      /*
       * NORMAL DOCUMENT UPLOAD
       */

      setFile(selected);
      setProgress(10);
      setUploading(true);
      setValidationError("");
      setOcrDocumentValid(null);
      setOcrValidationMessage("");
      setOcrSkipped(false);
      clearDocumentAssessment();
      onRemoved?.();

      try {
        setProgress(30);

        /*
         * OCR API
         */

        const result = await uploadDocument(selected, documentType);

        setProgress(70);

        /*
         * BACKEND RESPONSE VALIDATION
         */

        const uploadResult = isOCRUploadResponse(result)
          ? result
          : null;

        if (
          !uploadResult ||
          uploadResult.success !== true
        ) {
          if (uploadResult) {
            recordDocumentAssessment(uploadResult, false);
          }
          setFile(null);
          setProgress(0);
          onRemoved?.();

          const message =
            getResponseMessage(uploadResult) ||
            "Document upload or validation failed.";

          setValidationError(message);
          onValidation?.(
            uploadResult ?? {
              success: false,
              message: "Invalid response received from the document service.",
            }
          );
          return;
        }

        const extracted = uploadResult.extractedText;
        const validationResult = onValidation?.(uploadResult);
        recordDocumentAssessment(
          uploadResult,
          validationResult !== false
        );
        setOcrDocumentValid(
          typeof extracted?.documentValid === "boolean"
            ? extracted.documentValid
            : null
        );
        setOcrValidationMessage(
          typeof extracted?.validationMessage === "string"
            ? extracted.validationMessage
            : ""
        );
        setOcrSkipped(uploadResult.ocrSkipped === true);

        /*
         * Upload completion is independent of OCR classification or
         * identity matching. Those results remain visible for review.
         */

        setProgress(100);
        setValidationError("");

        onUploaded?.(
          typeof uploadResult.uploadId === "string"
            ? uploadResult.uploadId
            : undefined
        );
      } catch (error) {
        console.error("Document upload error:", error);
        clearDocumentAssessment();

        setFile(null);
        setProgress(0);
        onRemoved?.();
        setOcrDocumentValid(null);
        setOcrValidationMessage("");
        setOcrSkipped(false);

        setValidationError(
          error instanceof Error
            ? error.message
            : "Document upload failed. Please try again."
        );

        onValidation?.({
          success: false,
          message: "Document upload failed.",
        });
      } finally {
        setUploading(false);
      }
    },
    [
      documentType,
      isSelfie,
      onUploaded,
      onValidation,
      onRemoved,
      clearDocumentAssessment,
      recordDocumentAssessment,
    ]
  );

  /*
   * -----------------------------------------
   * DROPZONE
   * -----------------------------------------
   */

  const {
    getRootProps,
    getInputProps,
    isDragActive,
  } = useDropzone({
    onDrop,
    maxFiles: 1,

    accept: isSelfie
      ? {
          "image/jpeg": [],
          "image/png": [],
          "image/webp": [],
        }
      : {
          "image/jpeg": [],
          "image/png": [],
          "image/webp": [],
          "application/pdf": [],
        },

    disabled: uploading,
  });

  /*
   * -----------------------------------------
   * REMOVE FILE
   * -----------------------------------------
   */

  const removeFile = () => {
    setFile(null);
    setProgress(0);
    setUploading(false);
    setValidationError("");
    setOcrDocumentValid(null);
    setOcrValidationMessage("");
    setOcrSkipped(false);
    clearDocumentAssessment();

    onRemoved?.();
  };

  /*
   * -----------------------------------------
   * UI
   * -----------------------------------------
   */

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
      {/* TITLE */}

      <h3 className="mb-4 text-lg font-semibold text-white">
        {title}
      </h3>

      {/* UPLOAD AREA */}

      {!file ? (
        <div
          {...getRootProps()}
          className={`flex h-52 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed transition ${
            isDragActive
              ? "border-cyan-400 bg-cyan-500/10"
              : "border-zinc-700 hover:border-cyan-400"
          }`}
        >
          <input {...getInputProps()} />

          <UploadCloud
            size={42}
            className="text-cyan-400"
          />

          <p className="mt-4 text-white">
            {isDragActive ? "Drop file here" : "Drag & Drop"}
          </p>

          <p className="text-sm text-zinc-500">
            or Click to Upload
          </p>

          <p className="mt-2 text-xs text-zinc-600">
            {isSelfie
              ? "JPG • PNG • WEBP (Max 10MB)"
              : "JPG • PNG • WEBP • PDF (Max 10MB)"}
          </p>
        </div>
      ) : (
        <>
          {/* FILE PREVIEW */}

          <FilePreview
            file={file}
            onRemove={removeFile}
          />

          {/* PROGRESS */}

          <UploadProgress progress={progress} />

          {/* AI STATUS */}

          {progress === 100 && !validationError && (
            <AIScanStatus
              isSelfie={isSelfie}
              documentValid={ocrDocumentValid}
              validationMessage={ocrValidationMessage}
              ocrSkipped={ocrSkipped}
            />
          )}

          {/* ERROR */}

          {validationError && (
            <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-4">
              <p className="text-sm font-semibold text-red-400">
                Upload Failed
              </p>

              <p className="mt-1 text-sm text-red-300">
                {validationError}
              </p>

              <button
                type="button"
                onClick={removeFile}
                className="mt-3 rounded-lg bg-red-500/20 px-4 py-2 text-sm font-medium text-red-300 hover:bg-red-500/30"
              >
                Upload Again
              </button>
            </div>
          )}
        </>
      )}

      {/* UPLOAD ERROR WHEN NO FILE EXISTS */}

      {!file && validationError && (
        <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-4">
          <p className="text-sm font-semibold text-red-400">
            Upload Failed
          </p>

          <p className="mt-1 text-sm text-red-300">
            {validationError}
          </p>

          <button
            type="button"
            onClick={() => setValidationError("")}
            className="mt-3 rounded-lg bg-red-500/20 px-4 py-2 text-sm font-medium text-red-300 hover:bg-red-500/30"
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
}
