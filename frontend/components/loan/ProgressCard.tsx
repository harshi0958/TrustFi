"use client";

import { useLoanStore } from "@/store/loanStore";

export default function ProgressCard() {
  const currentStep = useLoanStore((state) => state.currentStep);

  const percentage = Math.round((currentStep / 8) * 100);

  return (
    <div className="rounded-2xl border border-cyan-500/20 bg-zinc-900 p-6">
      <h2 className="text-lg font-bold text-white">
        Application Progress
      </h2>

      <div className="mt-5 h-3 overflow-hidden rounded-full bg-zinc-800">
        <div
          className="h-full bg-cyan-400 transition-all"
          style={{
            width: `${percentage}%`,
          }}
        />
      </div>

      <p className="mt-4 text-cyan-300">
        {percentage}% Completed
      </p>
    </div>
  );
}