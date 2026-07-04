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

    alert("Loan Approved ✅");

    loadLoans();
  };

  useEffect(() => {
    loadLoans();
  }, []);

  return (
    <div className="min-h-screen bg-[#050816] text-white p-10">
      <h1 className="text-4xl font-bold mb-8">
        Admin Dashboard
      </h1>

      <table className="w-full">
        <thead>
          <tr>
            <th>Applicant</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {loans.map((loan: any) => (
            <tr key={loan.id}>
              <td>{loan.fullName}</td>
              <td>₹ {loan.loanAmount}</td>
              <td>{loan.status}</td>

              <td>
                {loan.status === "PENDING" ? (
                  <button
                    onClick={() => approveLoan(loan.id)}
                    className="bg-green-500 px-4 py-2 rounded"
                  >
                    Approve
                  </button>
                ) : (
                  "✅ Approved"
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}