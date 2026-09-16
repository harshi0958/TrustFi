"use client";

import { useEffect, useState } from "react";
import { getLoanByEmail } from "@/lib/api";

export default function LoanHistory() {
  const [loan, setLoan] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLoan() {
      try {
        const email = localStorage.getItem("loanEmail");

        if (!email) {
          setLoading(false);
          return;
        }

        const data = await getLoanByEmail(email);

        setLoan(data);
      } catch (err) {
        console.error("Failed to load user loan:", err);
      } finally {
        setLoading(false);
      }
    }

    loadLoan();
  }, []);

  if (loading) {
    return (
      <div className="mt-8 rounded-3xl border border-white/10 bg-zinc-900 p-6">
        <p className="text-gray-400">
          Loading your loan details...
        </p>
      </div>
    );
  }

  if (!loan) {
    return (
      <div className="mt-8 rounded-3xl border border-white/10 bg-zinc-900 p-6">
        <h2 className="mb-2 text-2xl font-bold text-white">
          Loan Details
        </h2>

        <p className="text-gray-400">
          You don't have any loan application yet.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-8 rounded-3xl border border-white/10 bg-zinc-900 p-6">

      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white">
          My Loan Application
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Your latest loan application details
        </p>
      </div>

      {/* ================= DETAILS ================= */}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">

        {/* LOAN TYPE */}

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <p className="text-xs text-gray-500">
            Loan Type
          </p>

          <p className="mt-2 font-semibold text-cyan-400">
            {loan.loanType || "PERSONAL"}
          </p>
        </div>

        {/* AMOUNT */}

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <p className="text-xs text-gray-500">
            Loan Amount
          </p>

          <p className="mt-2 font-semibold text-white">
            ₹ {Number(loan.loanAmount || 0).toLocaleString("en-IN")}
          </p>
        </div>

        {/* CREDIT SCORE */}

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <p className="text-xs text-gray-500">
            AI Credit Score
          </p>

          <p className="mt-2 font-semibold text-cyan-400">
            {loan.creditScore}
          </p>
        </div>

        {/* RISK */}

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <p className="text-xs text-gray-500">
            Risk Level
          </p>

          <p
            className={`mt-2 font-semibold ${
              loan.risk === "LOW"
                ? "text-green-400"
                : loan.risk === "MEDIUM"
                ? "text-yellow-400"
                : "text-red-400"
            }`}
          >
            {loan.risk}
          </p>
        </div>

      </div>

      {/* ================= SECOND ROW ================= */}

      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">

        {/* ELIGIBILITY */}

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <p className="text-xs text-gray-500">
            Eligibility
          </p>

          <p className="mt-2 font-semibold text-white">
            {loan.eligibility}%
          </p>
        </div>

        {/* INTEREST */}

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <p className="text-xs text-gray-500">
            Interest Rate
          </p>

          <p className="mt-2 font-semibold text-white">
            {loan.interestRate}%
          </p>
        </div>

        {/* TENURE */}

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <p className="text-xs text-gray-500">
            Tenure
          </p>

          <p className="mt-2 font-semibold text-white">
            {loan.loanMonths} Months
          </p>
        </div>

        {/* STATUS */}

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <p className="text-xs text-gray-500">
            Application Status
          </p>

          <p
            className={`mt-2 font-semibold ${
              loan.status === "APPROVED"
                ? "text-green-400"
                : loan.status === "REJECTED"
                ? "text-red-400"
                : "text-yellow-400"
            }`}
          >
            {loan.status}
          </p>
        </div>

      </div>

      {/* ================= PURPOSE ================= */}

      {loan.purpose && (
        <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">

          <p className="text-xs text-gray-500">
            Loan Purpose
          </p>

          <p className="mt-2 text-sm text-gray-300">
            {loan.purpose}
          </p>

        </div>
      )}

    </div>
  );
}