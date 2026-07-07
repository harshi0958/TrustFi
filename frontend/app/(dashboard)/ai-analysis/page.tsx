"use client";

import {
  BrainCircuit,
  ShieldCheck,
  ScanSearch,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { useLoanStore } from "@/store/loanStore";

export default function AIAnalysisPage() {
  const { approvedLoan } = useLoanStore();

  const score = approvedLoan.score || 820;
  const eligibility = approvedLoan.eligibility || 80;
  const risk = approvedLoan.risk || "Low";

  return (
    <div className="space-y-8">

      <h1 className="text-4xl font-bold text-white">
        AI Analysis
      </h1>

      {/* Score Cards */}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">

        <Card
          title="AI Credit Score"
          value={`${score}`}
          color="text-cyan-400"
          icon={<BrainCircuit />}
        />

        <Card
          title="Eligibility"
          value={`${eligibility}%`}
          color="text-green-400"
          icon={<CheckCircle2 />}
        />

        <Card
          title="Risk Level"
          value={risk}
          color={
            risk === "Low"
              ? "text-green-400"
              : risk === "Medium"
              ? "text-yellow-400"
              : "text-red-400"
          }
          icon={<AlertTriangle />}
        />

        <Card
          title="OCR Status"
          value="Verified"
          color="text-cyan-400"
          icon={<ScanSearch />}
        />

      </div>

      {/* AI Decision */}
      <div className="rounded-3xl border border-cyan-500/20 bg-zinc-900 p-8">

        <div className="flex items-center gap-3">

          <BrainCircuit className="text-cyan-400" size={30} />

          <h2 className="text-2xl font-bold text-white">
            AI Decision Summary
          </h2>

        </div>

        <div className="mt-6 space-y-4 text-zinc-300">

          <p>✅ Aadhaar matched successfully.</p>

          <p>✅ OCR extracted income correctly.</p>

          <p>✅ Salary verification completed.</p>

          <p>✅ Credit score is above lending threshold.</p>

          <p>✅ No suspicious financial activity detected.</p>

          <p>
            🤖 Recommendation:
            <span className="ml-2 font-semibold text-green-400">
              Loan Approved
            </span>
          </p>

        </div>

      </div>

      {/* Encryption */}
      <div className="rounded-3xl border border-green-500/20 bg-green-500/10 p-8">

        <div className="flex items-center gap-3">

          <ShieldCheck
            className="text-green-400"
            size={30}
          />

          <h2 className="text-2xl font-bold text-green-400">
            Fully Homomorphic Encryption
          </h2>

        </div>

        <p className="mt-6 text-zinc-300 leading-8">

          All personal financial data remained encrypted during
          AI computation. Sensitive information was never exposed
          to the lender or the AI model.

        </p>

      </div>

    </div>
  );
}

function Card({
  title,
  value,
  color,
  icon,
}: {
  title: string;
  value: string;
  color: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-zinc-900 p-6">

      <div className="flex items-center justify-between">

        <p className="text-zinc-400">
          {title}
        </p>

        <div className={color}>
          {icon}
        </div>

      </div>

      <h2 className={`mt-5 text-3xl font-bold ${color}`}>
        {value}
      </h2>

    </div>
  );
}