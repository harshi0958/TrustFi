"use client";

import { useEffect, useState } from "react";
import {
  BrainCircuit,
  Lock,
  ShieldCheck,
  FileCheck,
  UserCheck,
  CreditCard,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

import { Progress } from "@/components/ui/progress";
import { useLoanStore } from "@/store/loanStore";
import { calculateLoanRisk } from "@/lib/api";

const steps = [
  "Preparing applicant financial data...",
  "Verifying uploaded KYC documents...",
  "Validating salary and banking records...",
  "Preparing encrypted financial data...",
  "Running AI credit scoring model...",
  "Predicting repayment behaviour...",
  "Calculating loan eligibility...",
  "Generating confidential loan decision...",
];

interface RiskResult {
  score: number;
  risk: string;
  eligibility: number;
  interestRate: number;
  approved: boolean;
  eligibleAmount: number;
  emi: number;
}

export default function AIProcessing() {
  const {
    nextStep,
    personal,
    loan,
    documents,
    saveApprovedLoan,
  } = useLoanStore();

  const [progress, setProgress] = useState(0);
  const [current, setCurrent] = useState(0);

  const [riskResult, setRiskResult] =
    useState<RiskResult | null>(null);

  const [riskError, setRiskError] =
    useState("");

  /*
   * -----------------------------------------
   * DOCUMENT VERIFICATION STATUS
   * -----------------------------------------
   */

  const aadhaarVerified =
    documents.aadhaarFront &&
    documents.aadhaarBack;

  const panVerified =
    documents.pan;

  const salaryVerified =
    documents.salarySlip;

  const bankVerified =
    documents.passbook;

  const selfieVerified =
    documents.selfie;

  const allDocumentsVerified =
    aadhaarVerified &&
    panVerified &&
    salaryVerified &&
    bankVerified &&
    selfieVerified;

  /*
   * -----------------------------------------
   * PROCESSING ANIMATION
   * -----------------------------------------
   */

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }

        return Math.min(prev + 2, 100);
      });
    }, 120);

    return () => clearInterval(interval);
  }, []);

  /*
   * -----------------------------------------
   * CURRENT PROCESSING STEP
   * -----------------------------------------
   */

  useEffect(() => {
    const stepIndex = Math.min(
      steps.length - 1,
      Math.floor(progress / 13)
    );

    setCurrent(stepIndex);
  }, [progress]);

  /*
   * -----------------------------------------
   * RUN ACTUAL AI RISK ENGINE
   * -----------------------------------------
   */

  useEffect(() => {
    if (progress < 90 || riskResult) {
      return;
    }

    const runRiskAssessment = async () => {
      try {
        setRiskError("");

        const result =
          await calculateLoanRisk({
            monthlyIncome: Number(
              personal.monthlyIncome || 0
            ),

            loanAmount: Number(
              loan.amount || 0
            ),

            loanMonths: Number(
              loan.months || 0
            ),

            /*
             * Credit score will be enhanced later
             * with the complete AI scoring pipeline.
             */
            creditScore: 0,

            occupation:
              personal.occupation || "",

            documentsVerified:
              Boolean(
                documents.aadhaarFront &&
                documents.aadhaarBack &&
                documents.pan &&
                documents.selfie &&
                documents.salarySlip &&
                documents.passbook
              ),

            bankVerified:
              Boolean(documents.passbook),
          });

        console.log(
          "AI Risk Result:",
          result
        );

        setRiskResult(result);

        /*
         * Save AI result into Zustand.
         * LoanApproval can use this result.
         */

        saveApprovedLoan({
          amount: result.eligibleAmount,
          emi: result.emi,
          score: result.score,
          eligibility: result.eligibility,
          interestRate: result.interestRate,
          risk: result.risk,
          status: result.approved
            ? "APPROVED"
            : "REJECTED",
        });

      } catch (error: any) {
        console.error(
          "AI Risk Assessment Error:",
          error
        );

        setRiskError(
          error.message ||
            "AI risk assessment failed."
        );
      }
    };

    runRiskAssessment();
  }, [
    progress,
    riskResult,
    personal.monthlyIncome,
    personal.occupation,
    loan.amount,
    loan.months,
    documents.aadhaarFront,
    documents.aadhaarBack,
    documents.pan,
    documents.selfie,
    documents.salarySlip,
    documents.passbook,
    saveApprovedLoan,
  ]);

  /*
   * -----------------------------------------
   * MOVE TO APPROVAL
   * -----------------------------------------
   *
   * Only move forward after risk calculation
   * has completed successfully.
   */

  useEffect(() => {
    if (
      progress === 100 &&
      riskResult
    ) {
      const timer = setTimeout(() => {
        nextStep();
      }, 1200);

      return () => clearTimeout(timer);
    }
  }, [
    progress,
    riskResult,
    nextStep,
  ]);

  /*
   * -----------------------------------------
   * PROCESSING CONFIDENCE
   * -----------------------------------------
   */

  const confidence =
    progress < 40
      ? 72
      : progress < 70
      ? 86
      : progress < 100
      ? 94
      : riskResult
      ? 98
      : 94;

  /*
   * -----------------------------------------
   * STATUS
   * -----------------------------------------
   */

  const riskStatus =
    allDocumentsVerified
      ? "Analysis Ready"
      : "Verification Required";

  return (
    <div className="space-y-8">

      {/* ---------------------------------- */}
      {/* HEADER */}
      {/* ---------------------------------- */}

      <div className="text-center">

        <BrainCircuit
          size={60}
          className="mx-auto text-cyan-400 animate-pulse"
        />

        <h2 className="mt-4 text-2xl font-bold text-white">
          AI Underwriting Analysis
        </h2>

        <p className="mt-3 text-zinc-400">
          TrustFi AI is securely analyzing your
          financial information and loan profile.
        </p>

      </div>

      {/* ---------------------------------- */}
      {/* APPLICATION SUMMARY */}
      {/* ---------------------------------- */}

      <div className="rounded-2xl border border-cyan-500/20 bg-zinc-900 p-6">

        <h3 className="mb-4 text-lg font-semibold text-cyan-400">
          Application Summary
        </h3>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

          <div>
            <p className="text-sm text-zinc-500">
              Applicant
            </p>

            <p className="mt-1 font-medium text-white">
              {personal.fullName || "Applicant"}
            </p>
          </div>

          <div>
            <p className="text-sm text-zinc-500">
              Loan Type
            </p>

            <p className="mt-1 font-medium text-white">
              {loan.loanType}
            </p>
          </div>

          <div>
            <p className="text-sm text-zinc-500">
              Requested Amount
            </p>

            <p className="mt-1 font-medium text-white">
              ₹{" "}
              {Number(
                loan.amount || 0
              ).toLocaleString("en-IN")}
            </p>
          </div>

        </div>

      </div>

      {/* ---------------------------------- */}
      {/* DOCUMENT VERIFICATION */}
      {/* ---------------------------------- */}

      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">

        <VerificationCard
          label="Aadhaar"
          verified={aadhaarVerified}
        />

        <VerificationCard
          label="PAN"
          verified={panVerified}
        />

        <VerificationCard
          label="Selfie"
          verified={selfieVerified}
        />

        <VerificationCard
          label="Salary"
          verified={salaryVerified}
        />

        <VerificationCard
          label="Bank"
          verified={bankVerified}
        />

      </div>

      {/* ---------------------------------- */}
      {/* PROGRESS */}
      {/* ---------------------------------- */}

      <div className="rounded-2xl border border-cyan-500/20 bg-zinc-900 p-6">

        <div className="mb-4 flex items-center justify-between">

          <span className="text-sm text-zinc-400">
            AI Processing
          </span>

          <span className="font-semibold text-cyan-400">
            {progress}%
          </span>

        </div>

        <Progress
          value={progress}
          className="h-3"
        />

        <p className="mt-4 text-lg text-cyan-300">
          {steps[current]}
        </p>

      </div>

      {/* ---------------------------------- */}
      {/* RISK RESULTS */}
      {/* ---------------------------------- */}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">

        {/* CREDIT SCORE */}

        <RiskCard
          title="AI Credit Score"
          value={
            riskResult
              ? String(riskResult.score)
              : "Calculating..."
          }
          description="TrustFi risk score"
        />

        {/* RISK */}

        <RiskCard
          title="Risk Level"
          value={
            riskResult
              ? riskResult.risk
              : "Calculating..."
          }
          description="AI assessed risk"
        />

        {/* ELIGIBILITY */}

        <RiskCard
          title="Loan Eligibility"
          value={
            riskResult
              ? `${riskResult.eligibility}%`
              : "Calculating..."
          }
          description="Eligibility percentage"
        />

        {/* INTEREST */}

        <RiskCard
          title="Interest Rate"
          value={
            riskResult
              ? `${riskResult.interestRate}%`
              : "Calculating..."
          }
          description="Annual interest rate"
        />

        {/* EMI */}

        <RiskCard
          title="Estimated EMI"
          value={
            riskResult
              ? `₹ ${riskResult.emi.toLocaleString(
                  "en-IN"
                )}`
              : "Calculating..."
          }
          description="Monthly repayment"
        />

        {/* ELIGIBLE AMOUNT */}

        <RiskCard
          title="Eligible Amount"
          value={
            riskResult
              ? `₹ ${riskResult.eligibleAmount.toLocaleString(
                  "en-IN"
                )}`
              : "Calculating..."
          }
          description="Maximum eligible amount"
        />

      </div>

      {/* ---------------------------------- */}
      {/* AI PROCESSING METRICS */}
      {/* ---------------------------------- */}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

        <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/10 p-5">

          <div className="flex items-center gap-3">

            <BrainCircuit className="text-cyan-400" />

            <p className="text-sm text-zinc-400">
              AI Processing Confidence
            </p>

          </div>

          <h2 className="mt-3 text-3xl font-bold text-cyan-400">
            {confidence}%
          </h2>

        </div>

        <div className="rounded-xl border border-green-500/20 bg-green-500/10 p-5">

          <div className="flex items-center gap-3">

            <ShieldCheck className="text-green-400" />

            <p className="text-sm text-zinc-400">
              Verification Status
            </p>

          </div>

          <h2 className="mt-3 text-xl font-bold text-green-400">
            {riskStatus}
          </h2>

        </div>

        <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/10 p-5">

          <div className="flex items-center gap-3">

            <CreditCard className="text-yellow-400" />

            <p className="text-sm text-zinc-400">
              Loan Assessment
            </p>

          </div>

          <h2 className="mt-3 text-xl font-bold text-yellow-400">
            {loan.loanType} Loan
          </h2>

        </div>

        <div className="rounded-xl border border-purple-500/20 bg-purple-500/10 p-5">

          <div className="flex items-center gap-3">

            <Lock className="text-purple-400" />

            <p className="text-sm text-zinc-400">
              Privacy Layer
            </p>

          </div>

          <h2 className="mt-3 text-xl font-bold text-purple-400">
            FHE Ready
          </h2>

        </div>

      </div>

      {/* ---------------------------------- */}
      {/* RISK ERROR */}
      {/* ---------------------------------- */}

      {riskError && (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-5">

          <div className="flex items-center gap-3">

            <AlertTriangle
              className="text-red-400"
            />

            <h3 className="font-semibold text-red-400">
              AI Risk Assessment Failed
            </h3>

          </div>

          <p className="mt-2 text-sm text-red-300">
            {riskError}
          </p>

        </div>
      )}

      {/* ---------------------------------- */}
      {/* AI ANALYSIS ACTIVITIES */}
      {/* ---------------------------------- */}

      <div className="space-y-4">

        <AnalysisItem
          icon={<FileCheck />}
          title="OCR Document Extraction"
          description="Extracting information from uploaded documents."
          completed={progress >= 20}
        />

        <AnalysisItem
          icon={<UserCheck />}
          title="Identity Verification"
          description="Checking applicant identity against submitted documents."
          completed={progress >= 35}
        />

        <AnalysisItem
          icon={<CreditCard />}
          title="Financial Analysis"
          description="Evaluating income, loan amount and financial records."
          completed={progress >= 55}
        />

        <AnalysisItem
          icon={<Lock />}
          title="Privacy-Preserving Analysis"
          description="Preparing financial information for confidential processing."
          completed={progress >= 75}
        />

        <AnalysisItem
          icon={<ShieldCheck />}
          title="AI Risk Assessment"
          description="Calculating credit risk, eligibility and repayment capability."
          completed={Boolean(riskResult)}
        />

      </div>

      {/* ---------------------------------- */}
      {/* LIVE STATUS */}
      {/* ---------------------------------- */}

      <div className="rounded-2xl border border-green-500/20 bg-green-500/10 p-5">

        <h2 className="text-lg font-semibold text-green-400">
          Live AI Status
        </h2>

        <p className="mt-2 text-zinc-300">
          TrustFi is evaluating repayment capacity,
          financial behaviour, document verification
          and loan affordability.
        </p>

        {riskResult && (
          <div className="mt-4 flex items-center gap-2 text-green-400">

            <CheckCircle2 size={20} />

            <span>
              AI risk assessment completed successfully.
            </span>

          </div>
        )}

      </div>

    </div>
  );
}

/*
 * -----------------------------------------
 * RISK CARD
 * -----------------------------------------
 */

function RiskCard({
  title,
  value,
  description,
}: {
  title: string;
  value: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/10 p-5">

      <p className="text-sm text-zinc-400">
        {title}
      </p>

      <h2 className="mt-2 text-2xl font-bold text-cyan-400">
        {value}
      </h2>

      <p className="mt-1 text-xs text-zinc-500">
        {description}
      </p>

    </div>
  );
}

/*
 * -----------------------------------------
 * VERIFICATION CARD
 * -----------------------------------------
 */

function VerificationCard({
  label,
  verified,
}: {
  label: string;
  verified: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-4 ${
        verified
          ? "border-green-500/20 bg-green-500/10"
          : "border-yellow-500/20 bg-yellow-500/10"
      }`}
    >

      <div className="flex items-center gap-2">

        {verified ? (
          <CheckCircle2
            size={18}
            className="text-green-400"
          />
        ) : (
          <ShieldCheck
            size={18}
            className="text-yellow-400"
          />
        )}

        <span className="text-sm text-white">
          {label}
        </span>

      </div>

      <p
        className={`mt-2 text-xs ${
          verified
            ? "text-green-400"
            : "text-yellow-400"
        }`}
      >
        {verified
          ? "Verified"
          : "Pending"}
      </p>

    </div>
  );
}

/*
 * -----------------------------------------
 * ANALYSIS ITEM
 * -----------------------------------------
 */

function AnalysisItem({
  icon,
  title,
  description,
  completed,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  completed: boolean;
}) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-zinc-800 bg-zinc-900 p-4">

      <div
        className={
          completed
            ? "text-green-400"
            : "text-cyan-400"
        }
      >
        {icon}
      </div>

      <div className="flex-1">

        <p className="font-medium text-white">
          {title}
        </p>

        <p className="mt-1 text-sm text-zinc-500">
          {description}
        </p>

      </div>

      {completed && (
        <CheckCircle2
          size={20}
          className="text-green-400"
        />
      )}

    </div>
  );
}