"use client";

import { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud } from "lucide-react";

import FilePreview from "./FilePreview";
import UploadProgress from "./UploadProgress";
import AIScanStatus from "./AIScanStatus";

interface Props {
  title: string;
  onUploaded?: () => void;
}

export default function UploadCard({ title,onUploaded }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (!acceptedFiles.length) return;

    const selected = acceptedFiles[0];

    if (selected.size > 10 * 1024 * 1024) {
      alert("Maximum file size is 10 MB.");
      return;
    }

    setFile(selected);
    setProgress(0);

    onUploaded?.();
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
    accept: {
      "image/*": [],
      "application/pdf": [],
    },
  });

  useEffect(() => {
    if (!file) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 150);

    return () => clearInterval(interval);
  }, [file]);

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">

      <h3 className="mb-4 text-lg font-semibold text-white">
        {title}
      </h3>

      {!file ? (
        <div
          {...getRootProps()}
          className={`flex h-52 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed transition

          ${
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
            Drag & Drop
          </p>

          <p className="text-sm text-zinc-500">
            or Click to Upload
          </p>

          <p className="mt-2 text-xs text-zinc-600">
            JPG • PNG • PDF (Max 10MB)
          </p>
        </div>
      ) : (
        <>
          <FilePreview
            file={file}
            onRemove={() => {
              setFile(null);
              setProgress(0);
            }}
          />

          <UploadProgress progress={progress} />

          {progress === 100 && <AIScanStatus />}
        </>
      )}
    </div>
  );
}