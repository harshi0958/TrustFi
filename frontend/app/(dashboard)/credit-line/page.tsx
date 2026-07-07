"use client";

import { CreditCard, Wallet, TrendingUp, Calendar } from "lucide-react";
import { useLoanStore } from "@/store/loanStore";

export default function CreditLinePage() {
  const { approvedLoan } = useLoanStore();

  const limit = approvedLoan.amount || 500000;
  const used = Math.round(limit * 0.35);
  const remaining = limit - used;

  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-bold text-white">Credit Line</h1>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">

        <Card
          title="Available Credit"
          value={`₹ ${limit.toLocaleString()}`}
          icon={<Wallet className="text-cyan-400" />}
        />

        <Card
          title="Used Credit"
          value={`₹ ${used.toLocaleString()}`}
          icon={<CreditCard className="text-yellow-400" />}
        />

        <Card
          title="Remaining"
          value={`₹ ${remaining.toLocaleString()}`}
          icon={<TrendingUp className="text-green-400" />}
        />

        <Card
          title="Interest Rate"
          value={`${approvedLoan.interestRate || 10}%`}
          icon={<Calendar className="text-red-400" />}
        />

      </div>

      <div className="rounded-3xl border border-white/10 bg-zinc-900 p-8">
        <h2 className="text-2xl font-bold text-white">
          Credit Utilization
        </h2>

        <div className="mt-8 h-5 overflow-hidden rounded-full bg-zinc-800">
          <div
            className="h-full rounded-full bg-cyan-500"
            style={{
              width: `${(used / limit) * 100}%`,
            }}
          />
        </div>

        <p className="mt-5 text-zinc-400">
          {Math.round((used / limit) * 100)}% Credit Used
        </p>
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
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-zinc-900 p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-zinc-400">{title}</h3>
        {icon}
      </div>

      <p className="mt-6 text-3xl font-bold text-white">
        {value}
      </p>
    </div>
  );
}