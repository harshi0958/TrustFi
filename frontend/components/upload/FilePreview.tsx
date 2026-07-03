"use client";

import { FileText, Image as ImageIcon, Trash2 } from "lucide-react";

interface Props {
  file: File;
  onRemove: () => void;
}

export default function FilePreview({
  file,
  onRemove,
}: Props) {
  const isImage = file.type.startsWith("image");

  return (
    <div className="mt-4 rounded-xl border border-zinc-700 bg-zinc-800 p-4">

      <div className="flex items-center justify-between">

        <div className="flex items-center gap-3">

          {isImage ? (
            <ImageIcon className="text-cyan-400" />
          ) : (
            <FileText className="text-cyan-400" />
          )}

          <div>
            <p className="text-white font-medium">
              {file.name}
            </p>

            <p className="text-xs text-zinc-400">
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>

        </div>

        <button onClick={onRemove}>
          <Trash2 className="text-red-400 hover:text-red-300" />
        </button>

      </div>

    </div>
  );
}