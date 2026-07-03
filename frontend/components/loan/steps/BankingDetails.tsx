"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLoanStore } from "@/store/loanStore";

export default function BankingDetails() {
  const { nextStep, previousStep } = useLoanStore();

  const [bankName, setBankName] = useState("");
  const [holderName, setHolderName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [confirmAccountNumber, setConfirmAccountNumber] = useState("");
  const [ifsc, setIfsc] = useState("");
  const [branch, setBranch] = useState("");
  const [accountType, setAccountType] = useState("");

  const accountMatched =
    accountNumber !== "" &&
    accountNumber === confirmAccountNumber;

  const validIFSC =
  /^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc);

const validAccount =
  accountNumber.length >= 9 &&
  accountNumber.length <= 18;

const formValid =
  bankName &&
  holderName &&
  accountMatched &&
  validAccount &&
  validIFSC &&
  branch &&
  accountType;

  return (
    <div className="space-y-8">

      <div>
        <h1 className="text-3xl font-bold text-white">
          Banking Details
        </h1>

        <p className="mt-2 text-zinc-400">
          Enter your bank account information.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-5">

        <div>
          <Label className="text-white">Bank Name</Label>
          <Input
            className="text-white"
            value={bankName}
            onChange={(e) => setBankName(e.target.value)}
          />
        </div>

        <div>
          <Label className="text-white">Account Holder Name</Label>
          <Input
            className="text-white"
            value={holderName}
            onChange={(e) => setHolderName(e.target.value)}
          />
        </div>

        <div>
          <Label className="text-white">Account Number</Label>
          <Input
  className="text-white"
  inputMode="numeric"
  maxLength={18}
  value={accountNumber}
  onChange={(e) =>
    setAccountNumber(
      e.target.value.replace(/\D/g, "").slice(0, 18)
    )
  }
/>

{accountNumber !== "" &&
 accountNumber.length < 9 && (
  <p className="mt-1 text-sm text-red-400">
    Account Number must be 9–18 digits.
  </p>
)}
        </div>

        <div>
          <Label className="text-white">Confirm Account Number</Label>
          <Input
  className="text-white"
  inputMode="numeric"
  maxLength={18}
  value={confirmAccountNumber}
  onChange={(e) =>
    setConfirmAccountNumber(
      e.target.value.replace(/\D/g, "").slice(0, 18)
    )
  }
/>
        </div>

        <div>
          <Label className="text-white">IFSC Code</Label>
          <Input
            className="text-white"
            value={ifsc}
            onChange={(e) => setIfsc(e.target.value.toUpperCase())}
          /><Input
  className="text-white uppercase"
  maxLength={11}
  value={ifsc}
  onChange={(e) =>
    setIfsc(
      e.target.value
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, "")
        .slice(0, 11)
    )
  }
/>

{ifsc !== "" &&
 !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc) && (
  <p className="mt-1 text-sm text-red-400">
    Invalid IFSC Code.
  </p>
)}
        </div>

        <div>
          <Label className="text-white">Branch</Label>
          <Input
            className="text-white"
            value={branch}
            onChange={(e) => setBranch(e.target.value)}
          />
        </div>

        <div>
          <Label className="text-white">Account Type</Label>
          <Input
            className="text-white"
            placeholder="Savings / Current"
            value={accountType}
            onChange={(e) => setAccountType(e.target.value)}
          />
        </div>

      </div>

      {!accountMatched &&
        confirmAccountNumber !== "" && (
          <div className="rounded-xl border border-red-500 bg-red-500/10 p-4">
            <p className="text-red-400 font-semibold">
              Account numbers do not match.
            </p>
          </div>
        )}

      {accountMatched && (
        <div className="rounded-xl border border-green-500 bg-green-500/10 p-4">
          <p className="text-green-400 font-semibold">
            ✓ Account Verified
          </p>
        </div>
      )}

      <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-5">
        <h3 className="font-semibold text-cyan-300">
          AI Bank Verification
        </h3>

        <p className="mt-2 text-sm text-zinc-300">
          After uploading your passbook, TrustFi AI will verify:
        </p>

        <ul className="mt-3 space-y-2 text-sm text-zinc-400">
          <li>✓ Account Holder Name</li>
          <li>✓ IFSC Validation</li>
          <li>✓ Bank Account Status</li>
          <li>✓ Fraud Detection</li>
        </ul>
      </div>

      <div className="flex justify-between">

        <Button
          variant="outline"
          onClick={previousStep}
        >
          Previous
        </Button>

        <Button
          disabled={!formValid}
          className="bg-cyan-500 text-black hover:bg-cyan-400"
          onClick={nextStep}
        >
          Save & Continue
        </Button>

      </div>

    </div>
  );
}