"use client";

import { BrainCircuit, ShieldCheck } from "lucide-react";

export default function AIScanStatus() {
  return (
    <div className="mt-4 rounded-xl border border-cyan-500/20 bg-cyan-500/10 p-4">
      <div className="flex items-center gap-3">
        <BrainCircuit className="text-cyan-400" />

        <div>
          <h3 className="font-semibold text-white">
            AI OCR Analysis
          </h3>

          <p className="text-sm text-zinc-400">
            Document verified successfully.
          </p>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <ShieldCheck className="text-green-400" />

        <p className="text-green-400">
          FHE Encryption Enabled
        </p>
      </div>
    </div>
  );
}