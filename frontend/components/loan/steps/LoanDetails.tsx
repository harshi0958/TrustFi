"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLoanStore } from "@/store/loanStore";
import { calculateCredit } from "@/lib/creditEngine";

export default function LoanDetails() {
  const { nextStep, previousStep } = useLoanStore();

  const [amount, setAmount] = useState(500000);
  const [months, setMonths] = useState(24);
  const [purpose, setPurpose] = useState("");

  const monthlyIncome = Number(
  useLoanStore.getState().personal.monthlyIncome || 0
);

const occupation =
  useLoanStore.getState().personal.occupation;

const result = useMemo(() => {

  return calculateCredit({

    monthlyIncome,

    loanAmount: amount,

    months,

    occupation,

    documentsVerified: true,

    bankVerified: true,

  });

}, [
  monthlyIncome,
  occupation,
  amount,
  months,
]);

const emi = result.emi;

const risk = result.risk;

const creditLimit = result.eligibleAmount;

 return (
    <div className="space-y-8">

      <div>
        <h1 className="text-3xl font-bold text-white">
          Loan Details
        </h1>

        <p className="mt-2 text-zinc-400">
          Configure your loan request.
        </p>
      </div>

      <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-5">

        <h2 className="text-lg font-semibold text-cyan-300">
          Eligible Credit Limit
        </h2>

        <p className="mt-2 text-4xl font-bold text-white">
          ₹ {creditLimit.toLocaleString()}
        </p>

      </div>
    <div className="rounded-xl border border-white/10 bg-zinc-900 p-5">

  <p className="text-zinc-400">
    AI Credit Score
  </p>

  <h2 className="mt-2 text-3xl font-bold text-green-400">
    {result.score}
  </h2>

</div>

<div className="rounded-xl border border-white/10 bg-zinc-900 p-5">

  <p className="text-zinc-400">
    Eligibility
  </p>

  <h2 className="mt-2 text-3xl font-bold text-yellow-400">
    {result.eligibility}%
  </h2>

</div>
      <div>

        <Label className="text-white">
          Loan Amount
        </Label>

        <Input
          type="number"
          className="mt-2 text-white"
          value={amount}
          onChange={(e) =>
            setAmount(Number(e.target.value))
          }
        />

        <input
          className="mt-5 w-full"
          type="range"
          min={50000}
          max={creditLimit}
          step={10000}
          value={amount}
          onChange={(e) =>
            setAmount(Number(e.target.value))
          }
        />

      </div>

      <div>

        <Label className="text-white">
          Repayment Period
        </Label>

        <Input
          type="number"
          className="mt-2 text-white"
          value={months}
          onChange={(e) =>
            setMonths(Number(e.target.value))
          }
        />

      </div>

      <div>

        <Label className="text-white">
          Loan Purpose
        </Label>

        <Select
          onValueChange={setPurpose}
        >
          <SelectTrigger className="mt-2">
            <SelectValue placeholder="Select Purpose" />
          </SelectTrigger>

          <SelectContent>

            <SelectItem value="Business">
              Business
            </SelectItem>

            <SelectItem value="Education">
              Education
            </SelectItem>

            <SelectItem value="Medical">
              Medical
            </SelectItem>

            <SelectItem value="Home Renovation">
              Home Renovation
            </SelectItem>

            <SelectItem value="Personal">
              Personal
            </SelectItem>

          </SelectContent>

        </Select>

      </div>

      <div className="grid grid-cols-2 gap-5">

        <div className="rounded-xl border border-white/10 bg-zinc-900 p-5">

          <p className="text-zinc-400">
            Estimated EMI
          </p>

          <h2 className="mt-2 text-3xl font-bold text-green-400">
            ₹ {emi.toLocaleString()}
          </h2>

        </div>

        <div className="rounded-xl border border-white/10 bg-zinc-900 p-5">

          <p className="text-zinc-400">
            AI Risk Score
          </p>

          <h2
            className={`mt-2 text-3xl font-bold ${
              risk === "Low"
                ? "text-green-400"
                : risk === "Medium"
                ? "text-yellow-400"
                : "text-red-400"
            }`}
          >
            {risk}
          </h2>

        </div>
            <div className="rounded-xl border border-white/10 bg-zinc-900 p-5">

  <p className="text-zinc-400">
    Interest Rate
  </p>

  <h2 className="mt-2 text-3xl font-bold text-cyan-400">
    {result.interestRate}%
  </h2>

</div>
      </div>

      <div className="flex justify-between">

        <Button
          variant="outline"
          onClick={previousStep}
        >
          Previous
        </Button>

        <Button
          className="bg-cyan-500 text-black hover:bg-cyan-400"
          disabled={!purpose}
          onClick={nextStep}
        >
          Continue to Documents
        </Button>

      </div>

    </div>
  );
}