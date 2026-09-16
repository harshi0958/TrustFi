"use client";

import { useMemo } from "react";

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

import {
  LoanType,
  useLoanStore,
} from "@/store/loanStore";

import { calculateCredit } from "@/lib/creditEngine";

export default function LoanDetails() {
  const {
    nextStep,
    previousStep,
    loan,
    personal,
    updateLoan,
  } = useLoanStore();

  /* ---------------- PERSONAL DATA ---------------- */

  const monthlyIncome = Number(
    personal.monthlyIncome || 0
  );

  const occupation = personal.occupation || "";

  /* ---------------- LOAN DATA ---------------- */

  const amount = Number(loan.amount || 0);
  const months = Number(loan.months || 0);
  const purpose = loan.purpose || "";
  const loanType = loan.loanType;

  /* ---------------- CREDIT CALCULATION ---------------- */

  const result = useMemo(() => {
    return calculateCredit({
      monthlyIncome,
      loanAmount: amount,
      months,
      occupation,

      // Temporary values.
      // These will be connected to actual verification
      // status in the document-verification step.
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

  /* ---------------- LOAN TYPE CHANGE ---------------- */

const handleLoanTypeChange = (value: string) => {
  updateLoan({
    loanType: value as LoanType,
    purpose: "",

    // Reset loan-specific details when changing loan type
    propertyType: "",
    propertyValue: 0,
    propertyAddress: "",
    ownershipStatus: "",

    goldWeight: 0,
    goldPurity: "",
    goldValue: 0,
    goldOwnership: "",
  });
};

  /* ---------------- LOAN TYPE LABEL ---------------- */

  const loanTypeLabel =
    loanType === "PERSONAL"
      ? "Personal Loan"
      : loanType === "PROPERTY"
      ? "Property Loan"
      : loanType === "GOLD"
      ? "Gold Loan"
      : "Not Selected";

  /* ---------------- CONTINUE ---------------- */
const handleContinue = () => {
  if (!loanType || !purpose) {
    return;
  }

  if (amount <= 0 || months <= 0) {
    return;
  }

  // Property Loan validation
  if (loanType === "PROPERTY") {
    if (
      !loan.propertyType ||
      loan.propertyValue <= 0 ||
      !loan.propertyAddress ||
      !loan.ownershipStatus
    ) {
      return;
    }
  }

  // Gold Loan validation
  if (loanType === "GOLD") {
    if (
      loan.goldWeight <= 0 ||
      !loan.goldPurity ||
      loan.goldValue <= 0 ||
      !loan.goldOwnership
    ) {
      return;
    }
  }

  nextStep();
};

  return (
    <div className="space-y-8">

      {/* ---------------- HEADER ---------------- */}

      <div>
        <h1 className="text-3xl font-bold text-white">
          Loan Details
        </h1>

        <p className="mt-2 text-zinc-400">
          Configure your loan request and select
          the type of loan you need.
        </p>
      </div>

      {/* ---------------- LOAN TYPE ---------------- */}

      <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-6">

        <div>
          <h2 className="text-xl font-semibold text-cyan-300">
            Select Loan Type
          </h2>

          <p className="mt-1 text-sm text-zinc-400">
            Choose the type of loan you want to apply for.
          </p>
        </div>

        <div className="mt-5">

          <Label className="text-white">
            Loan Type
          </Label>

          <Select
            value={loanType || ""}
            onValueChange={handleLoanTypeChange}
          >
            <SelectTrigger className="mt-2 border-white/10 bg-zinc-900 text-white">
              <SelectValue placeholder="Select Loan Type" />
            </SelectTrigger>

            <SelectContent>

              <SelectItem value="PERSONAL">
                Personal Loan
              </SelectItem>

              <SelectItem value="PROPERTY">
                Property Loan
              </SelectItem>

              <SelectItem value="GOLD">
                Gold Loan
              </SelectItem>

            </SelectContent>
          </Select>

        </div>

      </div>

      {/* ---------------- LOAN TYPE INFORMATION ---------------- */}

     {loanType === "PROPERTY" && (
  <div className="space-y-5 rounded-2xl border border-blue-500/20 bg-blue-500/10 p-6">

    <div>
      <h3 className="text-xl font-semibold text-blue-300">
        🏠 Property Loan Details
      </h3>

      <p className="mt-1 text-sm text-zinc-400">
        Provide details about the property being used for your loan.
      </p>
    </div>

    {/* PROPERTY TYPE */}

    <div>
      <Label className="text-white">
        Property Type
      </Label>

      <Select
        value={loan.propertyType}
        onValueChange={(value) =>
          updateLoan({
            propertyType: value,
          })
        }
      >
        <SelectTrigger className="mt-2 border-white/10 bg-zinc-900 text-white">
          <SelectValue placeholder="Select Property Type" />
        </SelectTrigger>

        <SelectContent>

          <SelectItem value="RESIDENTIAL">
            Residential Property
          </SelectItem>

          <SelectItem value="COMMERCIAL">
            Commercial Property
          </SelectItem>

          <SelectItem value="PLOT">
            Plot / Land
          </SelectItem>

          <SelectItem value="INDUSTRIAL">
            Industrial Property
          </SelectItem>

        </SelectContent>
      </Select>
    </div>

    {/* PROPERTY VALUE */}

    <div>
      <Label className="text-white">
        Estimated Property Value
      </Label>

      <Input
        type="number"
        min={0}
        placeholder="Enter property value"
        className="mt-2 text-white"
        value={loan.propertyValue || ""}
        onChange={(e) =>
          updateLoan({
            propertyValue: Number(e.target.value),
          })
        }
      />

      <p className="mt-2 text-xs text-zinc-500">
        Estimated current market value of the property.
      </p>
    </div>

    {/* PROPERTY ADDRESS */}

    <div>
      <Label className="text-white">
        Property Address
      </Label>

      <Input
        type="text"
        placeholder="Enter complete property address"
        className="mt-2 text-white"
        value={loan.propertyAddress}
        onChange={(e) =>
          updateLoan({
            propertyAddress: e.target.value,
          })
        }
      />
    </div>

    {/* OWNERSHIP */}

    <div>
      <Label className="text-white">
        Ownership Status
      </Label>

      <Select
        value={loan.ownershipStatus}
        onValueChange={(value) =>
          updateLoan({
            ownershipStatus: value,
          })
        }
      >
        <SelectTrigger className="mt-2 border-white/10 bg-zinc-900 text-white">
          <SelectValue placeholder="Select Ownership Status" />
        </SelectTrigger>

        <SelectContent>

          <SelectItem value="SELF_OWNED">
            Self Owned
          </SelectItem>

          <SelectItem value="JOINTLY_OWNED">
            Jointly Owned
          </SelectItem>

          <SelectItem value="FAMILY_OWNED">
            Family Owned
          </SelectItem>

        </SelectContent>
      </Select>
    </div>

  </div>
)}
      {loanType === "GOLD" && (
  <div className="space-y-5 rounded-2xl border border-yellow-500/20 bg-yellow-500/10 p-6">

    <div>
      <h3 className="text-xl font-semibold text-yellow-300">
        🪙 Gold Loan Details
      </h3>

      <p className="mt-1 text-sm text-zinc-400">
        Provide details about the gold being pledged for the loan.
      </p>
    </div>

    {/* GOLD WEIGHT */}

    <div>
      <Label className="text-white">
        Gold Weight (grams)
      </Label>

      <Input
        type="number"
        min={0}
        step="0.01"
        placeholder="Enter gold weight"
        className="mt-2 text-white"
        value={loan.goldWeight || ""}
        onChange={(e) =>
          updateLoan({
            goldWeight: Number(e.target.value),
          })
        }
      />

      <p className="mt-2 text-xs text-zinc-500">
        Total weight of the gold being pledged.
      </p>
    </div>

    {/* GOLD PURITY */}

    <div>
      <Label className="text-white">
        Gold Purity
      </Label>

      <Select
        value={loan.goldPurity}
        onValueChange={(value) =>
          updateLoan({
            goldPurity: value,
          })
        }
      >
        <SelectTrigger className="mt-2 border-white/10 bg-zinc-900 text-white">
          <SelectValue placeholder="Select Gold Purity" />
        </SelectTrigger>

        <SelectContent>

          <SelectItem value="24K">
            24K - 99.9% Pure
          </SelectItem>

          <SelectItem value="22K">
            22K - 91.6% Pure
          </SelectItem>

          <SelectItem value="20K">
            20K - 83.3% Pure
          </SelectItem>

          <SelectItem value="18K">
            18K - 75% Pure
          </SelectItem>

        </SelectContent>
      </Select>
    </div>

    {/* GOLD VALUE */}

    <div>
      <Label className="text-white">
        Estimated Gold Value
      </Label>

      <Input
        type="number"
        min={0}
        placeholder="Enter estimated gold value"
        className="mt-2 text-white"
        value={loan.goldValue || ""}
        onChange={(e) =>
          updateLoan({
            goldValue: Number(e.target.value),
          })
        }
      />

      <p className="mt-2 text-xs text-zinc-500">
        Estimated current market value of the pledged gold.
      </p>
    </div>

    {/* GOLD OWNERSHIP */}

    <div>
      <Label className="text-white">
        Gold Ownership
      </Label>

      <Select
        value={loan.goldOwnership}
        onValueChange={(value) =>
          updateLoan({
            goldOwnership: value,
          })
        }
      >
        <SelectTrigger className="mt-2 border-white/10 bg-zinc-900 text-white">
          <SelectValue placeholder="Select Ownership" />
        </SelectTrigger>

        <SelectContent>

          <SelectItem value="SELF_OWNED">
            Self Owned
          </SelectItem>

          <SelectItem value="FAMILY_OWNED">
            Family Owned
          </SelectItem>

        </SelectContent>
      </Select>
    </div>

  </div>
)}

      {/* ---------------- ELIGIBLE CREDIT LIMIT ---------------- */}

      <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-5">

        <h2 className="text-lg font-semibold text-cyan-300">
          Eligible Credit Limit
        </h2>

        <p className="mt-2 text-4xl font-bold text-white">
          ₹ {creditLimit.toLocaleString()}
        </p>

        <p className="mt-2 text-sm text-zinc-400">
          Based on your current financial profile
        </p>

      </div>

      {/* ---------------- AI CREDIT SCORE ---------------- */}

      <div className="rounded-xl border border-white/10 bg-zinc-900 p-5">

        <p className="text-zinc-400">
          AI Credit Score
        </p>

        <h2 className="mt-2 text-3xl font-bold text-green-400">
          {result.score}
        </h2>

      </div>

      {/* ---------------- ELIGIBILITY ---------------- */}

      <div className="rounded-xl border border-white/10 bg-zinc-900 p-5">

        <p className="text-zinc-400">
          Eligibility
        </p>

        <h2 className="mt-2 text-3xl font-bold text-yellow-400">
          {result.eligibility}%
        </h2>

      </div>

      {/* ---------------- LOAN AMOUNT ---------------- */}

      <div>

        <Label className="text-white">
          Loan Amount
        </Label>

        <Input
          type="number"
          className="mt-2 text-white"
          value={amount}
          min={50000}
          max={Math.max(creditLimit, 50000)}
          onChange={(e) => {
            const value = Number(e.target.value);

            updateLoan({
              amount: value,
            });
          }}
        />

        <input
          className="mt-5 w-full"
          type="range"
          min={50000}
          max={Math.max(creditLimit, 50000)}
          step={10000}
          value={Math.min(
            Math.max(amount, 50000),
            Math.max(creditLimit, 50000)
          )}
          onChange={(e) => {
            updateLoan({
              amount: Number(e.target.value),
            });
          }}
        />

        <div className="mt-2 flex justify-between text-xs text-zinc-500">

          <span>
            ₹ 50,000
          </span>

          <span>
            Max: ₹ {creditLimit.toLocaleString()}
          </span>

        </div>

      </div>

      {/* ---------------- REPAYMENT PERIOD ---------------- */}

      <div>

        <Label className="text-white">
          Repayment Period
        </Label>

        <Input
          type="number"
          className="mt-2 text-white"
          value={months}
          min={3}
          max={84}
          onChange={(e) => {
            updateLoan({
              months: Number(e.target.value),
            });
          }}
        />

        <p className="mt-2 text-xs text-zinc-500">
          Enter repayment period in months.
        </p>

      </div>

      {/* ---------------- LOAN PURPOSE ---------------- */}

      <div>

        <Label className="text-white">
          Loan Purpose
        </Label>

        <Select
          value={purpose}
          onValueChange={(value) => {
            updateLoan({
              purpose: value,
            });
          }}
        >

          <SelectTrigger className="mt-2 border-white/10 bg-zinc-900 text-white">
            <SelectValue placeholder="Select Purpose" />
          </SelectTrigger>

          <SelectContent>

            {/* Personal Loan */}

            {loanType === "PERSONAL" && (
              <>
                <SelectItem value="Personal">
                  Personal
                </SelectItem>

                <SelectItem value="Medical">
                  Medical
                </SelectItem>

                <SelectItem value="Education">
                  Education
                </SelectItem>

                <SelectItem value="Home Renovation">
                  Home Renovation
                </SelectItem>

                <SelectItem value="Emergency Financial Need">
                  Emergency Financial Need
                </SelectItem>
              </>
            )}

            {/* Property Loan */}

            {loanType === "PROPERTY" && (
              <>
                <SelectItem value="Property Purchase">
                  Property Purchase
                </SelectItem>

                <SelectItem value="Property Construction">
                  Property Construction
                </SelectItem>

                <SelectItem value="Property Renovation">
                  Property Renovation
                </SelectItem>
              </>
            )}

            {/* Gold Loan */}

            {loanType === "GOLD" && (
              <>
                <SelectItem value="Gold Purchase">
                  Gold Purchase
                </SelectItem>

                <SelectItem value="Emergency Financial Need">
                  Emergency Financial Need
                </SelectItem>

                <SelectItem value="Business">
                  Business
                </SelectItem>

                <SelectItem value="Medical">
                  Medical
                </SelectItem>
              </>
            )}

          </SelectContent>

        </Select>

      </div>

      {/* ---------------- EMI + RISK ---------------- */}

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

        {/* EMI */}

        <div className="rounded-xl border border-white/10 bg-zinc-900 p-5">

          <p className="text-zinc-400">
            Estimated EMI
          </p>

          <h2 className="mt-2 text-3xl font-bold text-green-400">
            ₹ {emi.toLocaleString()}
          </h2>

        </div>

        {/* RISK */}

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

      </div>

      {/* ---------------- INTEREST RATE ---------------- */}

      <div className="rounded-xl border border-white/10 bg-zinc-900 p-5">

        <p className="text-zinc-400">
          Interest Rate
        </p>

        <h2 className="mt-2 text-3xl font-bold text-cyan-400">
          {result.interestRate}%
        </h2>

      </div>

      {/* ---------------- LOAN SUMMARY ---------------- */}

      <div className="rounded-2xl border border-white/10 bg-zinc-900 p-6">

        <h2 className="text-lg font-semibold text-white">
          Loan Summary
        </h2>

        <div className="mt-5 space-y-3">

          <div className="flex justify-between">

            <span className="text-zinc-400">
              Loan Type
            </span>

            <span className="font-medium text-white">
              {loanTypeLabel}
            </span>

          </div>

          <div className="flex justify-between">

            <span className="text-zinc-400">
              Requested Amount
            </span>

            <span className="font-medium text-white">
              ₹ {amount.toLocaleString()}
            </span>

          </div>

          <div className="flex justify-between">

            <span className="text-zinc-400">
              Repayment Period
            </span>

            <span className="font-medium text-white">
              {months} months
            </span>

          </div>

          <div className="flex justify-between">

            <span className="text-zinc-400">
              Estimated EMI
            </span>

            <span className="font-medium text-green-400">
              ₹ {emi.toLocaleString()}
            </span>

          </div>

        </div>

      </div>

      {/* ---------------- NAVIGATION ---------------- */}

      <div className="flex justify-between">

        <Button
          variant="outline"
          onClick={previousStep}
        >
          Previous
        </Button>

        <Button
          className="bg-cyan-500 text-black hover:bg-cyan-400"
          disabled={
  !loanType ||
  !purpose ||
  amount <= 0 ||
  months <= 0 ||
  (loanType === "PROPERTY" &&
    (
      !loan.propertyType ||
      loan.propertyValue <= 0 ||
      !loan.propertyAddress ||
      !loan.ownershipStatus
    )) ||
  (loanType === "GOLD" &&
    (
      loan.goldWeight <= 0 ||
      !loan.goldPurity ||
      loan.goldValue <= 0 ||
      !loan.goldOwnership
    ))
}
          onClick={handleContinue}
        >
          Continue to Documents
        </Button>

      </div>

    </div>
  );
}