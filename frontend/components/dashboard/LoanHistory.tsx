"use client";

import { useEffect, useState } from "react";
import { getLoans } from "@/lib/api";

export default function LoanHistory() {
  const [loans, setLoans] = useState<any[]>([]);

  useEffect(() => {
    async function loadLoans() {
      try {
        const data = await getLoans();
        setLoans(data);
      } catch (err) {
        console.error(err);
      }
    }

    loadLoans();
  }, []);

  return (
    <div className="mt-8 rounded-3xl border border-white/10 bg-zinc-900 p-6">
      <h2 className="mb-5 text-2xl font-bold text-white">
        Loan History
      </h2>

      <table className="w-full">
        <thead>
          <tr className="border-b border-white/10 text-left">
            <th className="pb-3">Applicant</th>
            <th className="pb-3">Amount</th>
            <th className="pb-3">Score</th>
            <th className="pb-3">Status</th>
          </tr>
        </thead>

        <tbody>
          {loans.map((loan) => (
            <tr key={loan.id} className="border-b border-white/5">
              <td className="py-4 text-white">{loan.fullName}</td>

              <td className="py-4 text-cyan-400">
                ₹ {loan.loanAmount.toLocaleString()}
              </td>

              <td className="py-4 text-white">
                {loan.creditScore}
              </td>

              <td className="py-4">
                <span className="rounded-full bg-green-500/20 px-3 py-1 text-green-400">
                  {loan.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}