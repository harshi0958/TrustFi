"use client";

export default function LoanHistory() {
  const loans = [
    {
      id: "TRF-2025-001",
      amount: "₹5,00,000",
      status: "Approved",
      date: "03 Jul 2026",
    },
  ];

  return (
    <div className="mt-8 rounded-3xl border border-white/10 bg-zinc-900 p-6">

      <h2 className="mb-5 text-2xl font-bold text-white">
        Loan History
      </h2>

      <table className="w-full">

        <thead>

          <tr className="border-b border-white/10 text-left text-zinc-400">

            <th className="pb-3">Loan ID</th>
            <th className="pb-3">Amount</th>
            <th className="pb-3">Status</th>
            <th className="pb-3">Date</th>

          </tr>

        </thead>

        <tbody>

          {loans.map((loan) => (

            <tr
              key={loan.id}
              className="border-b border-white/5"
            >

              <td className="py-4 text-white">
                {loan.id}
              </td>

              <td className="py-4 text-cyan-400">
                {loan.amount}
              </td>

              <td className="py-4">

                <span className="rounded-full bg-green-500/20 px-3 py-1 text-green-400">
                  {loan.status}
                </span>

              </td>

              <td className="py-4 text-zinc-300">
                {loan.date}
              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>
  );
}