"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud } from "lucide-react";

import FilePreview from "./FilePreview";
import UploadProgress from "./UploadProgress";
import AIScanStatus from "./AIScanStatus";

interface Props {
  title: string;
  documentType: string;
  onUploaded?: () => void;
  onRemoved?: () => void;
  onValidation?: (result: any) => boolean | void;
}

export default function UploadCard({
  title,
  documentType,
  onUploaded,
  onRemoved,
  onValidation,
}: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [validationError, setValidationError] = useState("");

  const isSelfie = documentType === "SELFIE";

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
       * -----------------------------------------
       * FILE SIZE VALIDATION
       * -----------------------------------------
       */

      if (selected.size > 10 * 1024 * 1024) {
        setValidationError(
          "Maximum file size is 10 MB."
        );
        return;
      }

      /*
       * -----------------------------------------
       * SELFIE VALIDATION
       *
       * Selfie is NOT sent to OCR backend.
       * -----------------------------------------
       */

      if (isSelfie) {
        if (!selected.type.startsWith("image/")) {
          setValidationError(
            "Please upload a valid image for selfie."
          );
          return;
        }

        setFile(selected);
        setProgress(100);
        setUploading(false);
        setValidationError("");

        onValidation?.({
          success: true,
          extractedText: {
            detectedType: "SELFIE",
            expectedType: "SELFIE",
            documentValid: true,
            confidence: 100,
            validationMessage:
              "Selfie uploaded successfully.",
          },
        });

        onUploaded?.();

        return;
      }

      /*
       * -----------------------------------------
       * NORMAL DOCUMENT
       * -----------------------------------------
       */

      setFile(selected);
      setProgress(10);
      setUploading(true);
      setValidationError("");

      try {
        /*
         * -----------------------------------------
         * API URL
         * -----------------------------------------
         */

        const apiUrl =
          process.env.NEXT_PUBLIC_API_URL;

        if (!apiUrl) {
          throw new Error(
            "NEXT_PUBLIC_API_URL is not configured."
          );
        }

        /*
         * -----------------------------------------
         * FORM DATA
         * -----------------------------------------
         */

        const formData = new FormData();

        formData.append(
          "document",
          selected
        );

        formData.append(
          "expectedType",
          documentType
        );

        /*
         * -----------------------------------------
         * OCR API
         * -----------------------------------------
         */

        const response = await fetch(
          `${apiUrl}/api/ocr/upload`,
          {
            method: "POST",
            body: formData,
          }
        );

        let result: any;

        try {
          result = await response.json();
        } catch {
          throw new Error(
            "Invalid response from server."
          );
        }

        console.log(
          "OCR RESULT:",
          result
        );

        /*
         * -----------------------------------------
         * BACKEND VALIDATION
         * -----------------------------------------
         */

        if (
          !response.ok ||
          !result.success
        ) {
          setFile(null);
          setProgress(0);

          const message =
            result?.extractedText
              ?.validationMessage ||
            result?.validationMessage ||
            result?.message ||
            "Invalid document. Please upload the correct document.";

          setValidationError(message);

          onValidation?.(result);

          return;
        }

        /*
         * -----------------------------------------
         * FRONTEND IDENTITY VALIDATION
         *
         * Aadhaar/PAN name matching etc.
         * -----------------------------------------
         */

        const validationResult =
          onValidation?.(result);

        if (validationResult === false) {
          setFile(null);
          setProgress(0);

          return;
        }

        /*
         * -----------------------------------------
         * SUCCESS
         * -----------------------------------------
         */

        setProgress(100);

        setValidationError("");

        onUploaded?.();

      } catch (error) {
        console.error(
          "Document upload error:",
          error
        );

        setFile(null);
        setProgress(0);

        setValidationError(
          error instanceof Error
            ? error.message
            : "Document verification failed. Please try again."
        );

        onValidation?.({
          success: false,
          message:
            "Document verification failed.",
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

      {/* -----------------------------------------
       * UPLOAD AREA
       * ----------------------------------------- */}

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
            {isDragActive
              ? "Drop file here"
              : "Drag & Drop"}
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
          {/* -----------------------------------------
           * FILE PREVIEW
           * ----------------------------------------- */}

          <FilePreview
            file={file}
            onRemove={removeFile}
          />

          {/* -----------------------------------------
           * PROGRESS
           * ----------------------------------------- */}

          <UploadProgress
            progress={progress}
          />

          {/* -----------------------------------------
           * AI STATUS
           * ----------------------------------------- */}

          {progress === 100 &&
            !validationError && (
              <AIScanStatus />
            )}

          {/* -----------------------------------------
           * ERROR
           * ----------------------------------------- */}

          {validationError && (
            <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-4">

              <p className="text-sm font-semibold text-red-400">
                Document Verification Failed
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

      {/* -----------------------------------------
       * UPLOAD ERROR WHEN NO FILE EXISTS
       * ----------------------------------------- */}

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
            onClick={() =>
              setValidationError("")
            }
            className="mt-3 rounded-lg bg-red-500/20 px-4 py-2 text-sm font-medium text-red-300 hover:bg-red-500/30"
          >
            Try Again
          </button>

        </div>
      )}

    </div>
  );
}