"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

import {
  BrainCircuit,
  Lock,
  ShieldCheck,
  FileCheck,
  UserCheck,
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";

import { Progress } from "@/components/ui/progress";
import { useLoanStore } from "@/store/loanStore";
import { calculateLoanRisk } from "@/lib/api";

const steps = [
  "Preparing applicant financial data...",
  "Checking required documents...",
  "Validating applicant information...",
  "Preparing financial data for analysis...",
  "Running loan risk assessment...",
  "Evaluating repayment capability...",
  "Calculating loan eligibility...",
  "Generating assessment summary...",
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

const validRiskLevels = ["LOW", "MEDIUM", "HIGH"];

function isValidRiskResult(value: unknown): value is RiskResult {
  if (!value || typeof value !== "object") return false;

  const result = value as Record<string, unknown>;

  return (
    Number.isFinite(Number(result.score)) &&
    Number.isFinite(Number(result.eligibility)) &&
    Number.isFinite(Number(result.interestRate)) &&
    Number.isFinite(Number(result.eligibleAmount)) &&
    Number.isFinite(Number(result.emi)) &&
    typeof result.approved === "boolean" &&
    typeof result.risk === "string" &&
    Number(result.score) >= 0 &&
    Number(result.score) <= 1000 &&
    Number(result.eligibility) >= 0 &&
    Number(result.eligibility) <= 100 &&
    Number(result.interestRate) >= 0 &&
    Number(result.eligibleAmount) >= 0 &&
    Number(result.emi) >= 0
  );
}

export default function AIProcessing() {
  const {
    nextStep,
    personal,
    loan,
    documents,
    fraudAssessment,
    saveApprovedLoan,
  } = useLoanStore();

  const [progress, setProgress] = useState(0);
  const [current, setCurrent] = useState(0);
  const [riskResult, setRiskResult] = useState<RiskResult | null>(null);
  const [riskError, setRiskError] = useState("");
  const [isAssessing, setIsAssessing] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // Prevent duplicate requests without cancelling a request
  // whenever the component state changes.
  const assessmentStartedRef = useRef(false);
  const mountedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
    };
  }, []);

  // --------------------------------------------------
  // DOCUMENT FILE PRESENCE
  // File presence alone does not mean OCR verification.
  // --------------------------------------------------

  const aadhaarPresent = Boolean(
    documents.aadhaarFront && documents.aadhaarBack
  );

  const panPresent = Boolean(documents.pan);
  const salaryPresent = Boolean(documents.salarySlip);
  const bankPresent = Boolean(documents.passbook);
  const selfiePresent = Boolean(documents.selfie);

  const allDocumentsPresent = Boolean(
    aadhaarPresent &&
      panPresent &&
      salaryPresent &&
      bankPresent &&
      selfiePresent
  );

  // --------------------------------------------------
  // FRAUD ASSESSMENT DATA
  // This must be populated by the actual document
  // validation/fraud assessment workflow.
  // --------------------------------------------------

  const fraudScore = Number(fraudAssessment.fraudScore);
  const fraudRisk = fraudAssessment.fraudRisk;

  const fraudFlags = Array.isArray(fraudAssessment.fraudFlags)
    ? fraudAssessment.fraudFlags
    : [];

  const documentResults = fraudAssessment.documentResults ?? {};

  const isValidatedDocument = (keyParts: string[]): boolean => {
    const entry = Object.entries(documentResults).find(([key]) => {
      const normalizedKey = key.toLowerCase();
      return keyParts.every((part) => normalizedKey.includes(part));
    });

    if (!entry) return false;

    const result = entry[1];

    return (
      result.documentValid === true &&
      Number.isFinite(Number(result.confidence)) &&
      Number(result.confidence) >= 70 &&
      Number.isFinite(Number(result.fraudScore)) &&
      validRiskLevels.includes(result.fraudRisk)
    );
  };

  const aadhaarFrontValidated = isValidatedDocument([
    "aadhaar",
    "front",
  ]);

  const aadhaarBackValidated = isValidatedDocument([
    "aadhaar",
    "back",
  ]);

  const panValidated = isValidatedDocument(["pan"]);
  const salaryValidated = isValidatedDocument(["salary"]);

  const bankValidated =
    isValidatedDocument(["passbook"]) ||
    isValidatedDocument(["bank"]);

  const extraLoanDocumentValidated =
    loan.loanType === "PROPERTY"
      ? isValidatedDocument(["property"])
      : loan.loanType === "GOLD"
        ? isValidatedDocument(["gold"])
        : true;

  const allDocumentsValidated = Boolean(
    allDocumentsPresent &&
      aadhaarFrontValidated &&
      aadhaarBackValidated &&
      panValidated &&
      salaryValidated &&
      bankValidated &&
      extraLoanDocumentValidated
  );

  // A completed fraud assessment and validated required documents
  // are both required before this gate can pass.
  const fraudAssessmentCompleted = Boolean(
    fraudAssessment.assessmentCompleted === true &&
      allDocumentsValidated &&
      Number.isFinite(fraudScore) &&
      fraudScore >= 0 &&
      fraudScore <= 100 &&
      validRiskLevels.includes(fraudRisk)
  );

  // HIGH fraud risk must not be bypassed because a separate
  // document-validation gate is incomplete.
  const fraudBlocked =
    fraudAssessment.assessmentCompleted === true &&
    fraudRisk === "HIGH";

  // --------------------------------------------------
  // PROCESSING ANIMATION
  // --------------------------------------------------

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((previous) => {
        if (previous >= 90) {
          clearInterval(interval);
          return 90;
        }

        return Math.min(previous + 2, 90);
      });
    }, 120);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setCurrent(
      Math.min(steps.length - 1, Math.floor(progress / 13))
    );
  }, [progress]);

  // --------------------------------------------------
  // RUN LOAN RISK ASSESSMENT
  // This is separate from the fraud assessment.
  // --------------------------------------------------

  useEffect(() => {
    if (
      progress < 90 ||
      !allDocumentsValidated ||
      !fraudAssessmentCompleted ||
      fraudBlocked ||
      riskResult ||
      assessmentStartedRef.current
    ) {
      return;
    }

    assessmentStartedRef.current = true;

    const runAssessment = async () => {
      setIsAssessing(true);
      setRiskError("");

      try {
        const result = await calculateLoanRisk({
          monthlyIncome: Number(personal.monthlyIncome || 0),
          loanAmount: Number(loan.amount || 0),
          loanMonths: Number(loan.months || 0),

          // Placeholder until a genuine credit-score source
          // is integrated.
          creditScore: 0,

          occupation: personal.occupation || "",

          // Only validated documents should satisfy these flags.
          documentsVerified: allDocumentsValidated,
          bankVerified: bankValidated,

          // Forward the existing fraud assessment to the backend.
          fraudScore,
          fraudRisk,
          fraudFlags,
        });

        if (!mountedRef.current) return;

        if (!isValidRiskResult(result)) {
          throw new Error(
            "The loan risk API returned invalid or incomplete data."
          );
        }

        setRiskResult(result);

        saveApprovedLoan({
          amount: result.eligibleAmount,
          emi: result.emi,
          score: result.score,
          eligibility: result.eligibility,
          interestRate: result.interestRate,
          risk: result.risk,
          status: result.approved ? "PENDING" : "REJECTED",
        });

        setProgress(100);
      } catch (error: unknown) {
        if (!mountedRef.current) return;

        setRiskError(
          error instanceof Error
            ? error.message
            : "Loan risk assessment failed. Please try again."
        );

        // Allow the user to retry the request.
        assessmentStartedRef.current = false;
      } finally {
        if (mountedRef.current) {
          setIsAssessing(false);
        }
      }
    };

    void runAssessment();
  }, [
    progress,
    allDocumentsValidated,
    fraudAssessmentCompleted,
    fraudBlocked,
    riskResult,
    personal.monthlyIncome,
    personal.occupation,
    loan.amount,
    loan.months,
    bankValidated,
    fraudScore,
    fraudRisk,
    fraudFlags,
    saveApprovedLoan,
    retryCount,
  ]);

  // --------------------------------------------------
  // RETRY
  // --------------------------------------------------

  const retryAssessment = () => {
    if (isAssessing) return;

    assessmentStartedRef.current = false;
    setRiskError("");
    setRiskResult(null);
    setProgress(90);
    setRetryCount((previous) => previous + 1);
  };

  // --------------------------------------------------
  // CONTINUE GATE
  // --------------------------------------------------

  const canContinue = Boolean(
    progress === 100 &&
      riskResult &&
      allDocumentsValidated &&
      fraudAssessmentCompleted &&
      !fraudBlocked
  );

  useEffect(() => {
    if (!canContinue) return;

    const timer = setTimeout(() => {
      nextStep();
    }, 1000);

    return () => clearTimeout(timer);
  }, [canContinue, nextStep]);

  // --------------------------------------------------
  // DISPLAY STATUS
  // --------------------------------------------------

  const processingIndicator =
    progress < 40
      ? 35
      : progress < 70
        ? 65
        : progress < 100
          ? 85
          : 100;

  const riskStatus = !allDocumentsPresent
    ? "Documents Required"
    : !allDocumentsValidated
      ? "Document Verification Required"
      : !fraudAssessmentCompleted
        ? "Fraud Assessment Required"
        : fraudBlocked
          ? "Manual Review Required"
          : riskResult
            ? "Loan Risk Assessment Complete"
            : "Assessment In Progress";

  const riskStatusColor = fraudBlocked
    ? "text-red-400"
    : !fraudAssessmentCompleted ||
        !allDocumentsPresent ||
        !allDocumentsValidated
      ? "text-yellow-400"
      : riskResult
        ? "text-green-400"
        : "text-cyan-400";

  return (
    <div className="space-y-8">
      {/* HEADER */}

      <div className="text-center">
        <BrainCircuit
          size={60}
          className="mx-auto animate-pulse text-cyan-400"
        />

        <h2 className="mt-4 text-2xl font-bold text-white">
          AI Underwriting Analysis
        </h2>

        <p className="mt-3 text-zinc-400">
          TrustFi is evaluating the supplied financial information
          and loan application.
        </p>
      </div>

      {/* APPLICATION SUMMARY */}

      <div className="rounded-2xl border border-cyan-500/20 bg-zinc-900 p-6">
        <h3 className="mb-4 text-lg font-semibold text-cyan-400">
          Application Summary
        </h3>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <SummaryItem
            label="Applicant"
            value={personal.fullName || "Applicant"}
          />

          <SummaryItem
            label="Loan Type"
            value={loan.loanType || "Not selected"}
          />

          <SummaryItem
            label="Requested Amount"
            value={`₹${Number(loan.amount || 0).toLocaleString("en-IN")}`}
          />
        </div>
      </div>

      {/* DOCUMENT FILES */}

      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        <VerificationCard
          label="Aadhaar"
          verified={aadhaarPresent}
          validated={aadhaarFrontValidated && aadhaarBackValidated}
        />

        <VerificationCard
          label="PAN"
          verified={panPresent}
          validated={panValidated}
        />

        <VerificationCard
          label="Selfie"
          verified={selfiePresent}
        />

        <VerificationCard
          label="Salary"
          verified={salaryPresent}
          validated={salaryValidated}
        />

        <VerificationCard
          label="Bank"
          verified={bankPresent}
          validated={bankValidated}
        />
      </div>

      {!allDocumentsValidated && allDocumentsPresent && (
        <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-4 text-sm text-yellow-300">
          Document files are present, but all required OCR validation
          results have not passed yet. Complete the document validation
          workflow before proceeding.
        </div>
      )}

      {/* PROGRESS */}

      <div className="rounded-2xl border border-cyan-500/20 bg-zinc-900 p-6">
        <div className="mb-4 flex items-center justify-between">
          <span className="text-sm text-zinc-400">
            Assessment Processing
          </span>

          <span className="font-semibold text-cyan-400">
            {progress}%
          </span>
        </div>

        <Progress value={progress} className="h-3" />

        <p className="mt-4 text-lg text-cyan-300">
          {!allDocumentsPresent
            ? "Complete the required document uploads..."
            : !allDocumentsValidated
              ? "Waiting for required document verification..."
              : !fraudAssessmentCompleted
                ? "Waiting for completed fraud assessment..."
                : fraudBlocked
                  ? "High fraud risk requires manual review..."
                  : riskError
                    ? "Assessment needs attention..."
                    : isAssessing
                      ? "Calculating loan risk and eligibility..."
                      : riskResult
                        ? "Loan risk calculation completed."
                        : steps[current]}
        </p>

        {!allDocumentsPresent && (
          <p className="mt-2 text-sm text-yellow-400">
            All required document files must be present before the
            loan risk calculation can proceed.
          </p>
        )}
      </div>

      {/* LOAN RISK RESULTS */}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <RiskCard
          title="Credit Score"
          value={riskResult ? String(riskResult.score) : "Pending"}
          description="Score returned by the loan risk API"
        />

        <RiskCard
          title="Loan Risk"
          value={riskResult ? riskResult.risk : "Pending"}
          description="Loan risk assessment result"
        />

        <RiskCard
          title="Eligibility"
          value={riskResult ? `${riskResult.eligibility}%` : "Pending"}
          description="Estimated eligibility percentage"
        />

        <RiskCard
          title="Interest Rate"
          value={
            riskResult ? `${riskResult.interestRate}%` : "Pending"
          }
          description="Rate returned by the API"
        />

        <RiskCard
          title="Estimated EMI"
          value={
            riskResult
              ? `₹${Number(riskResult.emi).toLocaleString("en-IN")}`
              : "Pending"
          }
          description="Estimated monthly repayment"
        />

        <RiskCard
          title="Eligible Amount"
          value={
            riskResult
              ? `₹${Number(riskResult.eligibleAmount).toLocaleString("en-IN")}`
              : "Pending"
          }
          description="Amount returned by the API"
        />
      </div>

      {/* FRAUD STATUS */}

      <div
        className={`rounded-2xl border p-6 ${
          fraudBlocked
            ? "border-red-500/30 bg-red-500/10"
            : !fraudAssessmentCompleted
              ? "border-yellow-500/30 bg-yellow-500/10"
              : fraudRisk === "MEDIUM"
                ? "border-yellow-500/30 bg-yellow-500/10"
                : "border-green-500/20 bg-green-500/10"
        }`}
      >
        <div className="flex items-center gap-3">
          {fraudBlocked || !fraudAssessmentCompleted ? (
            <AlertTriangle
              className={
                fraudBlocked ? "text-red-400" : "text-yellow-400"
              }
              size={24}
            />
          ) : (
            <ShieldCheck className="text-green-400" size={24} />
          )}

          <div>
            <h3 className="text-lg font-semibold text-white">
              Fraud Assessment
            </h3>

            <p className="mt-1 text-sm text-zinc-400">
              Fraud status must come from the actual document-fraud
              assessment, not from the credit-risk result.
            </p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <SummaryItem
            label="Fraud Score"
            value={
              fraudAssessmentCompleted
                ? `${fraudScore}/100`
                : "Not assessed"
            }
          />

          <SummaryItem
            label="Fraud Risk Level"
            value={
              fraudAssessmentCompleted
                ? fraudRisk
                : fraudBlocked
                  ? "HIGH — Manual review required"
                  : "Assessment required"
            }
          />
        </div>

        {fraudFlags.length > 0 && (
          <div className="mt-5">
            <p className="mb-2 font-medium text-white">
              Detected Flags
            </p>

            <ul className="space-y-2">
              {fraudFlags.map((flag, index) => (
                <li
                  key={`${flag}-${index}`}
                  className="flex items-start gap-2 text-sm text-zinc-300"
                >
                  <AlertTriangle
                    size={16}
                    className="mt-0.5 shrink-0 text-yellow-400"
                  />
                  <span>{flag}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {!fraudAssessmentCompleted && !fraudBlocked && (
          <p className="mt-4 text-sm text-yellow-300">
            Fraud assessment is not confirmed as complete. The
            application will not automatically advance until a
            successful fraud result and required document validations
            are saved.
          </p>
        )}

        {fraudBlocked && (
          <p className="mt-4 text-sm font-medium text-red-300">
            High fraud risk detected. Automatic progression is blocked
            pending further review.
          </p>
        )}

        {fraudAssessmentCompleted && fraudRisk === "MEDIUM" && (
          <p className="mt-4 text-sm text-yellow-300">
            Medium fraud risk detected. Follow the required review
            policy before making a lending decision.
          </p>
        )}
      </div>

      {/* STATUS CARDS */}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <StatusCard
          icon={<BrainCircuit />}
          title="Processing Progress"
          value={`${processingIndicator}%`}
          description="Interface progress indicator, not AI confidence."
        />

        <StatusCard
          icon={<ShieldCheck />}
          title="Verification Status"
          value={riskStatus}
          description="Reflects document and assessment requirements."
          valueClass={riskStatusColor}
        />

        <StatusCard
          icon={<CreditCard />}
          title="Loan Assessment"
          value={`${loan.loanType || "Loan"} Application`}
          description="Loan risk and eligibility calculation."
          valueClass="text-yellow-400"
        />

        <StatusCard
          icon={<Lock />}
          title="Privacy Layer"
          value="Implementation dependent"
          description="FHE execution must be verified separately."
          valueClass="text-purple-400"
        />
      </div>

      {/* API ERROR */}

      {riskError && (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-5">
          <div className="flex items-center gap-3">
            <AlertTriangle className="text-red-400" />

            <h3 className="font-semibold text-red-400">
              Loan Risk Assessment Failed
            </h3>
          </div>

          <p className="mt-2 text-sm text-red-300">{riskError}</p>

          <button
            type="button"
            onClick={retryAssessment}
            disabled={
              isAssessing ||
              !allDocumentsValidated ||
              !fraudAssessmentCompleted ||
              fraudBlocked
            }
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-red-500/20 px-4 py-2 text-sm font-medium text-red-200 hover:bg-red-500/30 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw size={16} />
            Retry Assessment
          </button>
        </div>
      )}

      {/* ANALYSIS ACTIVITIES */}

      <div className="space-y-4">
        <AnalysisItem
          icon={<FileCheck />}
          title="Required Document Files"
          description="Checking whether required document files are present."
          completed={allDocumentsPresent}
        />

        <AnalysisItem
          icon={<UserCheck />}
          title="Document OCR Validation"
          description="Requires passing validation results for each required document."
          completed={allDocumentsValidated}
        />

        <AnalysisItem
          icon={<CreditCard />}
          title="Financial Analysis"
          description="Evaluating income, requested amount and repayment capability."
          completed={Boolean(riskResult)}
        />

        <AnalysisItem
          icon={<Lock />}
          title="Privacy Processing"
          description="FHE completion is not inferred from this interface."
          completed={false}
        />

        <AnalysisItem
          icon={<ShieldCheck />}
          title="Fraud Assessment"
          description="Requires a completed, valid fraud-assessment result."
          completed={fraudAssessmentCompleted}
        />
      </div>

      {/* LIVE STATUS */}

      <div className="rounded-2xl border border-cyan-500/20 bg-zinc-900 p-5">
        <h2 className="text-lg font-semibold text-cyan-400">
          Live Assessment Status
        </h2>

        <p className="mt-2 text-zinc-300">
          {riskError
            ? "The loan risk calculation failed and needs attention."
            : !allDocumentsPresent
              ? "Complete all required document uploads."
              : !allDocumentsValidated
                ? "Required document OCR validation is incomplete."
                : !fraudAssessmentCompleted && !fraudBlocked
                  ? "Fraud assessment must be completed separately."
                  : fraudBlocked
                    ? "High fraud risk requires review before proceeding."
                    : riskResult
                      ? "Loan risk calculation completed. All required gates passed."
                      : "Evaluating the financial information."}
        </p>

        {riskResult &&
          fraudAssessmentCompleted &&
          !fraudBlocked && (
            <div className="mt-4 flex items-center gap-2 text-green-400">
              <CheckCircle2 size={20} />
              <span>Required assessment gates are satisfied.</span>
            </div>
          )}
      </div>
    </div>
  );
}

/* -----------------------------------------
 * SUMMARY ITEM
 * ----------------------------------------- */

function SummaryItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-sm text-zinc-500">{label}</p>
      <p className="mt-1 break-words font-medium text-white">
        {value}
      </p>
    </div>
  );
}

/* -----------------------------------------
 * RISK CARD
 * ----------------------------------------- */

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
      <p className="text-sm text-zinc-400">{title}</p>

      <h2 className="mt-2 break-words text-2xl font-bold text-cyan-400">
        {value}
      </h2>

      <p className="mt-1 text-xs text-zinc-500">{description}</p>
    </div>
  );
}

/* -----------------------------------------
 * VERIFICATION CARD
 * ----------------------------------------- */

function VerificationCard({
  label,
  verified,
  validated,
}: {
  label: string;
  verified: boolean;
  validated?: boolean;
}) {
  const borderClass = validated
    ? "border-green-500/20 bg-green-500/10"
    : verified
      ? "border-yellow-500/20 bg-yellow-500/10"
      : "border-zinc-700 bg-zinc-900";

  const statusText = !verified
    ? "Pending"
    : validated
      ? "OCR Verified"
      : "File Present";

  const statusColor = !verified
    ? "text-zinc-400"
    : validated
      ? "text-green-400"
      : "text-yellow-400";

  return (
    <div className={`rounded-xl border p-4 ${borderClass}`}>
      <div className="flex items-center gap-2">
        {validated ? (
          <CheckCircle2 size={18} className="text-green-400" />
        ) : verified ? (
          <AlertTriangle size={18} className="text-yellow-400" />
        ) : (
          <ShieldCheck size={18} className="text-zinc-500" />
        )}

        <span className="text-sm text-white">{label}</span>
      </div>

      <p className={`mt-2 text-xs ${statusColor}`}>{statusText}</p>
    </div>
  );
}

/* -----------------------------------------
 * STATUS CARD
 * ----------------------------------------- */

function StatusCard({
  icon,
  title,
  value,
  description,
  valueClass = "text-cyan-400",
}: {
  icon: ReactNode;
  title: string;
  value: string;
  description: string;
  valueClass?: string;
}) {
  return (
    <div className="rounded-xl border border-cyan-500/20 bg-zinc-900 p-5">
      <div className="flex items-center gap-3">
        <span className="text-cyan-400">{icon}</span>
        <p className="text-sm text-zinc-400">{title}</p>
      </div>

      <h2 className={`mt-3 break-words text-xl font-bold ${valueClass}`}>
        {value}
      </h2>

      <p className="mt-1 text-xs text-zinc-500">{description}</p>
    </div>
  );
}

/* -----------------------------------------
 * ANALYSIS ITEM
 * ----------------------------------------- */

function AnalysisItem({
  icon,
  title,
  description,
  completed,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  completed: boolean;
}) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-zinc-800 bg-zinc-900 p-4">
      <div className={completed ? "text-green-400" : "text-cyan-400"}>
        {icon}
      </div>

      <div className="flex-1">
        <p className="font-medium text-white">{title}</p>
        <p className="mt-1 text-sm text-zinc-500">{description}</p>
      </div>

      {completed && (
        <CheckCircle2 size={20} className="text-green-400" />
      )}
    </div>
  );
}
