"use client";

interface Props {
  progress: number;
}

export default function UploadProgress({
  progress,
}: Props) {
  return (
    <div className="mt-4">

      <div className="h-2 rounded-full bg-zinc-700">

        <div
          className="h-2 rounded-full bg-cyan-400 transition-all duration-500"
          style={{
            width: `${progress}%`,
          }}
        />

      </div>

      <p className="mt-2 text-sm text-zinc-400">
        Upload Progress : {progress}%
      </p>

    </div>
  );
}