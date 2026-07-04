"use client";

import { useEffect, useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL;

export default function AdminPage() {
  const [loans, setLoans] = useState<any[]>([]);

  async function loadLoans() {
    const res = await fetch(`${API}/api/loan`);
    const data = await res.json();
    setLoans(data);
  }

  async function approveLoan(id: string) {
    await fetch(`${API}/api/loan/approve/${id}`, {
      method: "PATCH",
    });

    alert("Loan Approved ✅");

    loadLoans();
  }

  useEffect(() => {
    loadLoans();
  }, []);

  return (
    <div className="min-h-screen bg-[#050816] p-10 text-white">
      <h1 className="mb-8 text-4xl font-bold">
        Admin Dashboard
      </h1>

      <table className="w-full border border-white/10">
        <thead>
          <tr className="border-b border-white/10">
            <th className="p-3">Applicant</th>
            <th className="p-3">Amount</th>
            <th className="p-3">Score</th>
            <th className="p-3">Status</th>
            <th className="p-3">Action</th>
          </tr>
        </thead>

        <tbody>
          {loans.map((loan) => (
            <tr key={loan.id} className="border-b border-white/10">
              <td className="p-3">{loan.fullName}</td>

              <td className="p-3">
                ₹ {loan.loanAmount.toLocaleString()}
              </td>

              <td className="p-3">{loan.creditScore}</td>

              <td className="p-3">{loan.status}</td>

              <td className="p-3">
                {loan.status === "PENDING" ? (
                  <button
                    onClick={() => approveLoan(loan.id)}
                    className="rounded bg-green-500 px-4 py-2"
                  >
                    Approve
                  </button>
                ) : (
                  <span className="text-green-400">
                    Approved
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}