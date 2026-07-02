"use client";

import LoanStepper from "./LoanStepper";
import ProgressCard from "./ProgressCard";
import AISidePanel from "./AISidePanel";

export default function LoanLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#050816]">

      <div className="mx-auto grid max-w-7xl grid-cols-12 gap-6 px-8 py-10">

        <div className="col-span-3 space-y-5">
          <ProgressCard />
          <LoanStepper />
        </div>

        <div className="col-span-6">

          <div className="rounded-3xl border border-white/10 bg-zinc-900 p-8">
            {children}
          </div>

        </div>

        <div className="col-span-3">
          <AISidePanel />
        </div>

      </div>

    </div>
  );
}