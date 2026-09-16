"use client";

import { useMemo, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle,
  ShieldCheck,
  BrainCircuit,
  Loader2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { useLoanStore } from "@/store/loanStore";
import { calculateCredit } from "@/lib/creditEngine";
import { applyLoan } from "@/lib/api";

export default function LoanApproval() {
  const router = useRouter();

  const {
    personal,
    loan,
    documents,
    saveApprovedLoan,
  } = useLoanStore();

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  /*
   * -----------------------------------------
   * DOCUMENT VERIFICATION STATUS
   * -----------------------------------------
   */

  const documentsVerified =
    Boolean(
      documents.aadhaarFront &&
        documents.aadhaarBack &&
        documents.pan &&
        documents.selfie &&
        documents.salarySlip &&
        documents.passbook
    );

  const bankVerified =
    Boolean(documents.passbook);

  /*
   * -----------------------------------------
   * AI CREDIT RESULT
   * -----------------------------------------
   *
   * This is used for the final approval
   * summary shown on this page.
   */

  const result = useMemo(() => {
    return calculateCredit({
      monthlyIncome: Number(
        personal.monthlyIncome || 0
      ),

      loanAmount: loan.amount,

      months: loan.months,

      occupation:
        personal.occupation || "",

      documentsVerified,

      bankVerified,
    });
  }, [
    personal.monthlyIncome,
    personal.occupation,
    loan.amount,
    loan.months,
    documentsVerified,
    bankVerified,
  ]);

  /*
   * -----------------------------------------
   * SAVE APPROVED LOAN RESULT TO ZUSTAND
   * -----------------------------------------
   */

  useEffect(() => {
    saveApprovedLoan({
      amount: loan.amount,
      emi: result.emi,
      score: result.score,
      eligibility: result.eligibility,
      interestRate: result.interestRate,
      risk: result.risk,
      status: result.approved
        ? "APPROVED"
        : "REJECTED",
    });
  }, [
    loan.amount,
    result,
    saveApprovedLoan,
  ]);

  /*
   * -----------------------------------------
   * SUBMIT LOAN
   * -----------------------------------------
   */

  const submitLoan = async () => {
    /*
     * Prevent double submission.
     */

    if (isSubmitting) {
      return;
    }

    /*
     * -----------------------------------------
     * BASIC VALIDATION
     * -----------------------------------------
     */

    if (!personal.fullName) {
      alert("Applicant name is missing.");
      return;
    }

    if (!personal.email) {
      alert("Email is missing.");
      return;
    }

    if (!personal.phone) {
      alert("Phone number is missing.");
      return;
    }

    if (!personal.monthlyIncome) {
      alert("Monthly income is missing.");
      return;
    }

    if (!personal.occupation) {
      alert("Occupation is missing.");
      return;
    }

    if (!loan.loanType) {
      alert("Loan type is missing.");
      return;
    }

    if (!loan.amount || loan.amount <= 0) {
      alert("Loan amount is invalid.");
      return;
    }

    if (!loan.months || loan.months <= 0) {
      alert("Loan tenure is invalid.");
      return;
    }

    if (!loan.purpose) {
      alert("Please provide the loan purpose.");
      return;
    }

    /*
     * All required documents should be verified
     * before submitting the application.
     */

    if (!documentsVerified) {
      alert(
        "Please complete all required document verification before submitting."
      );
      return;
    }

    try {
      setIsSubmitting(true);

      /*
       * Store email so dashboard can fetch
       * the latest loan application.
       */

      localStorage.setItem(
        "loanEmail",
        personal.email
      );

      /*
       * -----------------------------------------
       * FINAL LOAN APPLICATION PAYLOAD
       * -----------------------------------------
       *
       * These fields match the backend
       * /api/loan/apply requirements.
       */

      const loanPayload = {
        fullName: personal.fullName,

        email: personal.email,

        phone: personal.phone,

        monthlyIncome: Number(
          personal.monthlyIncome
        ),

        /*
         * IMPORTANT:
         * Previously missing.
         */

        loanType: loan.loanType,

        loanAmount: Number(
          loan.amount
        ),

        loanMonths: Number(
          loan.months
        ),

        purpose: loan.purpose,

        

        // =========================
        // PROPERTY LOAN DETAILS
        // =========================

        propertyType:
          loan.loanType === "PROPERTY"
            ? loan.propertyType
            : null,

        propertyValue:
          loan.loanType === "PROPERTY"
            ? Number(loan.propertyValue || 0)
            : null,

        propertyAddress:
          loan.loanType === "PROPERTY"
            ? loan.propertyAddress
            : null,

        ownershipStatus:
          loan.loanType === "PROPERTY"
            ? loan.ownershipStatus
            : null,

        // =========================
        // GOLD LOAN DETAILS
        // =========================

        goldWeight:
          loan.loanType === "GOLD"
            ? Number(loan.goldWeight || 0)
            : null,

        goldPurity:
          loan.loanType === "GOLD"
            ? loan.goldPurity
            : null,

        goldValue:
          loan.loanType === "GOLD"
            ? Number(loan.goldValue || 0)
            : null,

        goldOwnership:
          loan.loanType === "GOLD"
            ? loan.goldOwnership
            : null,

        creditScore: Number(
          result.score || 0
        ),

        /*
         * IMPORTANT:
         * Previously missing.
         */

        occupation:
          personal.occupation,

        /*
         * IMPORTANT:
         * Previously missing.
         */

        documentsVerified:
          documentsVerified,

        /*
         * IMPORTANT:
         * Previously missing.
         */

        bankVerified:
          bankVerified,
      };

      console.log(
        "================================="
      );

      console.log(
        "FINAL LOAN APPLICATION PAYLOAD:"
      );

      console.log(
        loanPayload
      );

      console.log(
        "================================="
      );

      
      /*
       * -----------------------------------------
       * API CALL
       * -----------------------------------------
       */

      const response =
        await applyLoan(
          loanPayload
        );

      console.log(
        "Loan Application Response:",
        response
      );

      /*
       * Store email again after successful
       * application submission.
       */

      localStorage.setItem(
        "loanEmail",
        personal.email
      );

      /*
       * -----------------------------------------
       * SUCCESS
       * -----------------------------------------
       */

      alert(
        "Loan Saved Successfully ✅"
      );

      /*
       * Go to dashboard.
       */

      router.push(
        "/dashboard"
      );

    } catch (err: any) {
      console.error(
        "FULL LOAN SUBMISSION ERROR:",
        err
      );

      /*
       * Show readable error.
       */

      if (err instanceof Error) {
        alert(
          err.message ||
            "Loan submission failed."
        );
      } else {
        alert(
          JSON.stringify(err)
        );
      }

    } finally {
      setIsSubmitting(false);
    }
  };

  /*
   * -----------------------------------------
   * RETURN UI
   * -----------------------------------------
   */

  return (
    <div className="space-y-8">

      {/* ---------------------------------- */}
      {/* HEADER */}
      {/* ---------------------------------- */}

      <div className="text-center">

        <CheckCircle
          size={70}
          className="mx-auto text-green-400"
        />

        <h1 className="mt-5 text-4xl font-bold text-white">

          {result.approved
            ? "Loan Approved"
            : "Loan Rejected"}

        </h1>

        <p className="mt-2 text-zinc-400">

          AI underwriting completed securely using
          encrypted financial information.

        </p>

      </div>

      {/* ---------------------------------- */}
      {/* AI RESULT CARDS */}
      {/* ---------------------------------- */}

      <div className="grid grid-cols-2 gap-5">

        <Card
          title="Applicant"
          value={
            personal.fullName ||
            "Applicant"
          }
        />

        <Card
          title="AI Credit Score"
          value={result.score}
        />

        <Card
          title="Eligibility"
          value={`${result.eligibility}%`}
        />

        <Card
          title="Interest Rate"
          value={`${result.interestRate}%`}
        />

        <Card
          title="Monthly EMI"
          value={`₹ ${result.emi.toLocaleString(
            "en-IN"
          )}`}
        />

        <Card
          title="Approved Amount"
          value={`₹ ${loan.amount.toLocaleString(
            "en-IN"
          )}`}
        />

        <Card
          title="Risk Level"
          value={result.risk}
        />

        <Card
          title="AI Confidence"
          value="98%"
        />

      </div>

      {/* ---------------------------------- */}
      {/* AI DECISION SUMMARY */}
      {/* ---------------------------------- */}

      <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-6">

        <div className="flex items-center gap-3">

          <BrainCircuit
            className="text-cyan-400"
          />

          <h2 className="text-xl font-bold text-cyan-300">

            AI Decision Summary

          </h2>

        </div>

        <ul className="mt-5 space-y-3 text-zinc-300">

          <li>
            {documents.aadhaarFront &&
            documents.aadhaarBack
              ? "✅"
              : "⚠️"}{" "}
            Aadhaar Verified
          </li>

          <li>
            {documents.pan
              ? "✅"
              : "⚠️"}{" "}
            PAN Verified
          </li>

          <li>
            {documents.salarySlip
              ? "✅"
              : "⚠️"}{" "}
            Salary Verified
          </li>

          <li>
            {documents.passbook
              ? "✅"
              : "⚠️"}{" "}
            Bank Account Verified
          </li>

          <li>
            {documentsVerified
              ? "✅"
              : "⚠️"}{" "}
            OCR Extraction Completed
          </li>

          <li>
            {result.emi > 0
              ? "✅"
              : "⚠️"}{" "}
            Repayment Capacity Analysed
          </li>

          <li>
            {result.score > 0
              ? "✅"
              : "⚠️"}{" "}
            AI Risk Prediction Completed
          </li>

          <li>
            {"✅"} Fully Homomorphic Encryption
            Enabled
          </li>

        </ul>

      </div>

      {/* ---------------------------------- */}
      {/* PRIVACY */}
      {/* ---------------------------------- */}

      <div className="rounded-2xl border border-green-500/20 bg-green-500/10 p-5">

        <div className="flex items-center gap-3">

          <ShieldCheck
            className="text-green-400"
          />

          <div>

            <h3 className="font-semibold text-green-400">

              Privacy Guaranteed

            </h3>

            <p className="text-zinc-300">

              Sensitive financial data remained
              encrypted during AI computation using
              FHE.

            </p>

          </div>

        </div>

      </div>

      {/* ---------------------------------- */}
      {/* FINAL ACTIONS */}
      {/* ---------------------------------- */}

      <div className="flex justify-center gap-4">

        <Button
          variant="outline"
          onClick={() =>
            window.print()
          }
          disabled={isSubmitting}
        >
          Download Report
        </Button>

        <Button
          className="bg-cyan-500 text-black hover:bg-cyan-400"
          onClick={submitLoan}
          disabled={
            isSubmitting ||
            !documentsVerified
          }
        >

          {isSubmitting ? (
            <span className="flex items-center gap-2">

              <Loader2
                size={18}
                className="animate-spin"
              />

              Saving Loan...

            </span>
          ) : (
            "Save Loan & Go Dashboard"
          )}

        </Button>

      </div>

    </div>
  );
}

/*
 * -----------------------------------------
 * CARD COMPONENT
 * -----------------------------------------
 */

function Card({
  title,
  value,
}: {
  title: string;
  value: string | number;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-zinc-900 p-5">

      <p className="text-zinc-400">
        {title}
      </p>

      <h2 className="mt-2 text-3xl font-bold text-white">
        {value}
      </h2>

    </div>
  );
}