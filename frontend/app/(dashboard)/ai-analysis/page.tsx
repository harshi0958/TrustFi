"use client";

import {
  BrainCircuit,
  ScanSearch,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { useLoanStore } from "@/store/loanStore";

export default function AIAnalysisPage() {
  const { approvedLoan, fraudAssessment } = useLoanStore();

  const hasRiskAssessment = approvedLoan.score > 0;
  const risk = hasRiskAssessment
    ? approvedLoan.risk
    : "Pending";
  const passedDocumentChecks = Object.values(
    fraudAssessment.documentResults
  ).filter(
    (result) =>
      result.documentValid === true &&
      result.confidence >= 70
  ).length;
  const applicationStatus =
    approvedLoan.status === "APPROVED"
      ? "Approved by lender"
      : approvedLoan.status === "REJECTED"
        ? "Eligibility criteria not met"
        : approvedLoan.status === "PENDING"
          ? "Pending review"
          : "Not submitted";

  return (
    <div className="space-y-8">

      <h1 className="text-4xl font-bold text-white">
        AI Analysis
      </h1>

      {/* Score Cards */}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">

        <Card
          title="Loan Risk Score"
          value={hasRiskAssessment ? `${approvedLoan.score}` : "Pending"}
          color="text-cyan-400"
          icon={<BrainCircuit />}
        />

        <Card
          title="Eligibility"
          value={
            hasRiskAssessment ? `${approvedLoan.eligibility}%` : "Pending"
          }
          color="text-green-400"
          icon={<CheckCircle2 />}
        />

        <Card
          title="Risk Level"
          value={risk}
          color={
            risk === "LOW"
              ? "text-green-400"
              : risk === "MEDIUM"
              ? "text-yellow-400"
              : risk === "HIGH"
                ? "text-red-400"
                : "text-zinc-400"
          }
          icon={<AlertTriangle />}
        />

        <Card
          title="OCR Status"
          value={
            passedDocumentChecks > 0
              ? `${passedDocumentChecks} type check(s) passed`
              : "Pending"
          }
          color="text-cyan-400"
          icon={<ScanSearch />}
        />

      </div>

      {/* AI Decision */}
      <div className="rounded-3xl border border-cyan-500/20 bg-zinc-900 p-8">

        <div className="flex items-center gap-3">

          <BrainCircuit className="text-cyan-400" size={30} />

          <h2 className="text-2xl font-bold text-white">
            AI Decision Summary
          </h2>

        </div>

        <div className="mt-6 space-y-4 text-zinc-300">

          <p>
            Loan risk assessment:{" "}
            {hasRiskAssessment ? "Result received from the risk service." : "Pending."}
          </p>
          <p>
            Document OCR: {passedDocumentChecks} document-type check(s) passed.
            This does not confirm authenticity or identity.
          </p>
          <p>
            Fraud assessment:{" "}
            {fraudAssessment.assessmentCompleted
              ? `${fraudAssessment.fraudRisk} risk`
              : "Incomplete"}
          </p>
          <p>Application status: {applicationStatus}.</p>

        </div>

      </div>

      <div className="rounded-3xl border border-yellow-500/20 bg-yellow-500/10 p-8">

        <div className="flex items-center gap-3">

          <AlertTriangle
            className="text-yellow-400"
            size={30}
          />

          <h2 className="text-2xl font-bold text-yellow-300">
            Privacy Processing
          </h2>

        </div>

        <p className="mt-6 text-zinc-300 leading-8">

          Fully Homomorphic Encryption execution is not integrated or
          verified in this application flow.

        </p>

      </div>

    </div>
  );
}

function Card({
  title,
  value,
  color,
  icon,
}: {
  title: string;
  value: string;
  color: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-zinc-900 p-6">

      <div className="flex items-center justify-between">

        <p className="text-zinc-400">
          {title}
        </p>

        <div className={color}>
          {icon}
        </div>

      </div>

      <h2 className={`mt-5 text-3xl font-bold ${color}`}>
        {value}
      </h2>

    </div>
  );
}