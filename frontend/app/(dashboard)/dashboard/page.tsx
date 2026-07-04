"use client";


import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  BrainCircuit,
  ShieldCheck,
  Wallet,
  AlertTriangle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useLoanStore } from "@/store/loanStore";

import LoanHistory from "@/components/dashboard/LoanHistory";

export default function DashboardPage() {
  const router = useRouter();

  const { personal, approvedLoan } = useLoanStore();

  

  return (
    <div className="min-h-screen bg-[#050816] p-10">

      <div className="flex items-center justify-between">

        <div>

          <h1 className="text-4xl font-bold text-white">
            TrustFi Dashboard
          </h1>

          <p className="mt-2 text-zinc-400">
            Welcome, {personal.fullName || "User"}
          </p>

        </div>

        <Button
          className="bg-cyan-500 text-black hover:bg-cyan-400"
          onClick={() => router.push("/loan")}
        >
          Apply New Loan
        </Button>

      </div>

      <div className="mt-8 rounded-3xl border border-green-500/20 bg-zinc-900 p-8">

        <div className="flex items-center gap-4">

          <CheckCircle2
            size={50}
            className="text-green-400"
          />

          <div>

            <h2 className="text-3xl font-bold text-white">
              {approvedLoan.status === "Approved"
  ? "Loan Approved"
  : "Loan Rejected"}
            </h2>

            <p className="text-zinc-400">
              AI Confidential Underwriting Completed
            </p>

          </div>

        </div>

        <div className="mt-8 grid grid-cols-2 lg:grid-cols-3 gap-6">

          <Card
            title="Approved Amount"
            value={`₹ ${approvedLoan.amount.toLocaleString()}`}
            icon={<Wallet className="text-green-400" />}
          />

          <Card
            title="Monthly EMI"
            value={`₹ ${approvedLoan.emi.toLocaleString()}`}
            icon={<Wallet className="text-cyan-400" />}
          />

          <Card
            title="Credit Score"
            value={approvedLoan.score}
            icon={<BrainCircuit className="text-cyan-400" />}
          />

          <Card
            title="Eligibility"
            value={`${approvedLoan.eligibility}%`}
            icon={<CheckCircle2 className="text-green-400" />}
          />

          <Card
            title="Interest Rate"
            value={`${approvedLoan.interestRate}%`}
            icon={<Wallet className="text-yellow-400" />}
          />

          <Card
            title="Risk"
            value={approvedLoan.risk}
            icon={<AlertTriangle className="text-red-400" />}
          />

        </div>

      </div>
      <LoanHistory />

      <div className="mt-8 rounded-3xl border border-cyan-500/20 bg-zinc-900 p-6">

        <div className="flex items-center gap-3">

          <BrainCircuit className="text-cyan-400" />

          <h2 className="text-xl font-bold text-cyan-300">
            AI Decision Summary
          </h2>

        </div>

        <ul className="mt-5 space-y-2 text-zinc-300">

          <li>✅ Aadhaar Verified</li>
          <li>✅ PAN Verified</li>
          <li>✅ Salary Verified</li>
          <li>✅ Bank Verified</li>
          <li>✅ OCR Extraction Completed</li>
          <li>✅ AI Repayment Prediction Generated</li>

        </ul>

      </div>

      <div className="mt-8 rounded-3xl border border-green-500/20 bg-green-500/10 p-6">

        <div className="flex items-center gap-3">

          <ShieldCheck className="text-green-400" />

          <div>

            <h2 className="font-bold text-green-400">
              Fully Homomorphic Encryption
            </h2>

            <p className="text-zinc-300 mt-2">
              All financial information remained encrypted during
              AI computation. No sensitive data was exposed.
            </p>

          </div>

        </div>

      </div>

    </div>
    
  );
}

function Card({
  title,
  value,
  icon,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#111827] p-5">

      <div className="flex items-center justify-between">

        <p className="text-zinc-400">
          {title}
        </p>

        {icon}

      </div>

      <h2 className="mt-4 text-3xl font-bold text-white">
        {value}
      </h2>

    </div>
  );
}