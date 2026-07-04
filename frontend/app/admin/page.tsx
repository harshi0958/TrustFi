"use client";

import { useEffect, useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL;

export default function AdminPage() {
  const [loans, setLoans] = useState<any[]>([]);

  const loadLoans = async () => {
    const res = await fetch(`${API}/api/loan`);
    const data = await res.json();
    setLoans(data);
  };

  const approveLoan = async (id: string) => {
    await fetch(`${API}/api/loan/approve/${id}`, {
      method: "PATCH",
    });

    loadLoans();
  };

  useEffect(() => {
    loadLoans();
  }, []);

  return (
    <div className="min-h-screen bg-[#050816] p-10 text-white">

      <h1 className="text-5xl font-bold text-center mb-10">
        👨‍💼 Admin Dashboard
      </h1>

      <div className="overflow-x-auto rounded-2xl border border-cyan-500/20 bg-zinc-900 shadow-xl">

        <table className="min-w-full">

          <thead className="bg-cyan-500/10">

            <tr>

              <th className="px-6 py-4 text-left">Applicant</th>

              <th className="px-6 py-4 text-center">Loan Amount</th>

              <th className="px-6 py-4 text-center">Credit Score</th>

              <th className="px-6 py-4 text-center">Status</th>

              <th className="px-6 py-4 text-center">Action</th>

            </tr>

          </thead>

          <tbody>

            {loans.map((loan: any) => (

              <tr
                key={loan.id}
                className="border-t border-white/10 hover:bg-cyan-500/5 transition"
              >

                <td className="px-6 py-5 font-semibold">
                  {loan.fullName}
                </td>

                <td className="px-6 py-5 text-center text-cyan-400 font-bold">
                  ₹ {loan.loanAmount.toLocaleString()}
                </td>

                <td className="px-6 py-5 text-center">
                  {loan.creditScore}
                </td>

                <td className="px-6 py-5 text-center">

                  {loan.status === "APPROVED" ? (

                    <span className="rounded-full bg-green-500/20 px-4 py-2 text-green-400 font-semibold">
                      ✅ APPROVED
                    </span>

                  ) : (

                    <span className="rounded-full bg-yellow-500/20 px-4 py-2 text-yellow-400 font-semibold">
                      ⏳ PENDING
                    </span>

                  )}

                </td>

                <td className="px-6 py-5 text-center">

                  {loan.status === "PENDING" ? (

                    <button
                      onClick={() => approveLoan(loan.id)}
                      className="rounded-lg bg-green-500 px-5 py-2 font-semibold text-white hover:bg-green-600 transition"
                    >
                      Approve
                    </button>

                  ) : (

                    <button
                      disabled
                      className="rounded-lg bg-zinc-700 px-5 py-2 text-zinc-300 cursor-not-allowed"
                    >
                      Approved
                    </button>

                  )}

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>
  );
}