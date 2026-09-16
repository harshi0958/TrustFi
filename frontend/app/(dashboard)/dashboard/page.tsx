"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import { useWalletStore } from "@/store/walletStore";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  BrainCircuit,
  ShieldCheck,
  Wallet,
  AlertTriangle,
  Clock3,
  XCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useLoanStore } from "@/store/loanStore";
import {
  getLoanByEmail,
  createPaymentOrder,
  verifyPayment,
} from "@/lib/api";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function DashboardPage() {
  const router = useRouter();

  const {
    personal,
    approvedLoan,
    saveApprovedLoan,
  } = useLoanStore();

  const { connected } = useWalletStore();
  const [loanId, setLoanId] = useState<string | null>(null);
const [isPaying, setIsPaying] = useState(false);

  useEffect(() => {
    const email =
      personal.email ||
      localStorage.getItem("loanEmail");

    if (!email) return;

    const emailString = email;

    async function loadLoan() {
      try {
        const loan = await getLoanByEmail(emailString);

        if (!loan) return;

setLoanId(loan.id);

const amount = loan.loanAmount;
        const months = loan.loanMonths || 12;
        const rate = loan.interestRate || 0;

        const monthlyRate = rate / 12 / 100;

        const emi =
          monthlyRate === 0
            ? Math.round(amount / months)
            : Math.round(
                (amount *
                  monthlyRate *
                  Math.pow(1 + monthlyRate, months)) /
                  (Math.pow(1 + monthlyRate, months) - 1)
              );

        saveApprovedLoan({
          amount,
          emi,
          score: loan.creditScore,
          eligibility: loan.eligibility,
          interestRate: loan.interestRate,
          risk: loan.risk,
          status: loan.status,
        });
      } catch (error) {
        console.error("Failed to load loan:", error);
      }
    }

    loadLoan();
  }, [personal.email, saveApprovedLoan]);

  const handlePayment = async () => {
  if (!loanId) {
    alert("Loan information not available.");
    return;
  }

  try {
    setIsPaying(true);

    const data = await createPaymentOrder(loanId);

    if (!data.success) {
      throw new Error(
        data.message || "Unable to create payment order."
      );
    }

    const options = {
      key: data.keyId,

      amount: data.order.amount,

      currency: data.order.currency,

      name: "TrustFi",

      description: "TrustFi Loan Processing Fee",

      order_id: data.order.id,

    handler: async function (response: any) {
  try {
    console.log(
      "Razorpay Payment Response:",
      response
    );

    const result = await verifyPayment({
      loanId: loanId,

      razorpay_order_id:
        response.razorpay_order_id,

      razorpay_payment_id:
        response.razorpay_payment_id,

      razorpay_signature:
        response.razorpay_signature,
    });

    if (!result.success) {
      throw new Error(
        result.message ||
          "Payment verification failed."
      );
    }

    alert(
      "Payment verified successfully! Loan activated ✅"
    );

    window.location.reload();

  } catch (error: any) {
    console.error(
      "Payment Verification Error:",
      error
    );

    alert(
      error.message ||
        "Payment verification failed."
    );

  } finally {
    setIsPaying(false);
  }
},

      prefill: {
        name: personal.fullName,
        email: personal.email,
        contact: personal.phone,
      },

      theme: {
        color: "#06b6d4",
      },

      modal: {
        ondismiss: function () {
          setIsPaying(false);
        },
      },
    };

    const razorpay =
      new window.Razorpay(options);

    razorpay.open();

  } catch (error: any) {
    console.error(
      "Payment Error:",
      error
    );

    alert(
      error.message ||
        "Unable to start payment."
    );

    setIsPaying(false);
  }
};
const loanStatus = approvedLoan.status || "PENDING";

const isApproved = loanStatus === "APPROVED";
const isRejected = loanStatus === "REJECTED";
const isActive = loanStatus === "ACTIVE";

  return (
    <div className="min-h-screen bg-[#050816] p-10">
      <Script
      src="https://checkout.razorpay.com/v1/checkout.js"
      strategy="afterInteractive"
    />

      {/* HEADER */}
      <div className="flex items-center justify-between">

        <div>
          <h1 className="text-4xl font-bold text-white">
            TrustFi Dashboard
          </h1>

          <p className="mt-2 text-zinc-400">
            Welcome, {personal.fullName || "User"}
          </p>
        </div>

        <Button
          className="bg-cyan-500 text-black hover:bg-cyan-400"
          onClick={() => router.push("/loan")}
        >
          Apply New Loan
        </Button>

      </div>

      {/* LOAN STATUS */}
      <div className="mt-8 rounded-3xl border border-green-500/20 bg-zinc-900 p-8">

        <div className="flex items-center gap-4">

          {isRejected ? (
            <XCircle
              size={50}
              className="text-red-400"
            />
          ) : isApproved ? (
            <CheckCircle2
              size={50}
              className="text-green-400"
            />
          ) : (
            <Clock3
              size={50}
              className="text-yellow-400"
            />
          )}

          <div className="flex items-center gap-4">

            <h2 className="text-3xl font-bold text-white">
              Loan Status
            </h2>

            {isActive ? (

  <span className="rounded-full bg-cyan-500/20 px-4 py-2 font-semibold text-cyan-400">
    🚀 ACTIVE
  </span>

) : isApproved ? (

  <span className="rounded-full bg-green-500/20 px-4 py-2 font-semibold text-green-400">
    ✅ APPROVED
  </span>

) : isRejected ? (

  <span className="rounded-full bg-red-500/20 px-4 py-2 font-semibold text-red-400">
    ❌ REJECTED
  </span>

) : (

  <span className="rounded-full bg-yellow-500/20 px-4 py-2 font-semibold text-yellow-400">
    ⏳ PENDING
  </span>

)}

          </div>

        </div>

        {/* LOAN CARDS */}
        <div className="mt-8 grid grid-cols-2 gap-6 lg:grid-cols-3">

          <Card
            title="Approved Amount"
            value={`₹ ${approvedLoan.amount.toLocaleString()}`}
            icon={<Wallet className="text-green-400" />}
          />

          <Card
            title="Monthly EMI"
            value={`₹ ${approvedLoan.emi.toLocaleString()}`}
            icon={<Wallet className="text-cyan-400" />}
          />

          <Card
            title="Credit Score"
            value={approvedLoan.score}
            icon={<BrainCircuit className="text-cyan-400" />}
          />

          <Card
            title="Eligibility"
            value={`${approvedLoan.eligibility}%`}
            icon={<CheckCircle2 className="text-green-400" />}
          />

          <Card
            title="Interest Rate"
            value={`${approvedLoan.interestRate}%`}
            icon={<Wallet className="text-yellow-400" />}
          />

          <Card
            title="Risk"
            value={approvedLoan.risk}
            icon={<AlertTriangle className="text-red-400" />}
          />

        </div>

      </div>

      {/* APPLICATION PROGRESS */}
      <div className="mt-8 rounded-3xl border border-cyan-500/20 bg-zinc-900 p-8">

        <div className="flex items-center gap-3">

          <Clock3 className="text-cyan-400" />

          <div>
            <h2 className="text-2xl font-bold text-white">
              Application Progress
            </h2>

            <p className="mt-1 text-sm text-zinc-400">
              Track your loan application journey
            </p>
          </div>

        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">

          <ProgressStep
            number="01"
            title="Application Submitted"
            description="Loan application received"
            status="completed"
          />

          <ProgressStep
            number="02"
            title="Verification"
            description="KYC, documents & bank verified"
            status="completed"
          />

          <ProgressStep
            number="03"
            title="AI Risk Assessment"
            description="Credit score & risk evaluated"
            status="completed"
          />

          <ProgressStep
            number="04"
            title="Admin Approval"
            description={
  isActive
    ? "Loan activated after payment"
    : isApproved
    ? "Loan approved successfully"
    : isRejected
    ? "Application rejected"
    : "Waiting for administrator"
}
           status={
  isActive || isApproved
    ? "completed"
    : isRejected
    ? "rejected"
    : "current"
}
          />

        </div>

        {/* FUTURE PAYMENT / DISBURSEMENT */}
        {isApproved && (
          <div className="mt-6 rounded-2xl border border-green-500/20 bg-green-500/5 p-5">
            <Button
  className="mt-5 bg-cyan-500 text-black hover:bg-cyan-400"
  onClick={handlePayment}
  disabled={isPaying || !loanId}
>
  {isPaying
    ? "Opening Payment..."
    : "Pay ₹999 & Activate Loan"}
</Button>

            <div className="flex items-center gap-3">

              <CheckCircle2 className="text-green-400" />

              <div>
                <h3 className="font-semibold text-green-400">
                  Loan Approved
                </h3>

                <p className="mt-1 text-sm text-zinc-400">
  Your loan has been approved. Complete the
  processing fee payment to activate your loan.
</p>
              </div>

            </div>

          </div>
        )}

        {loanStatus === "PENDING" && (
          <div className="mt-6 rounded-2xl border border-yellow-500/20 bg-yellow-500/5 p-5">

            <div className="flex items-center gap-3">

              <Clock3 className="text-yellow-400" />

              <div>
                <h3 className="font-semibold text-yellow-400">
                  Awaiting Admin Approval
                </h3>

                <p className="mt-1 text-sm text-zinc-400">
                  Your application has been submitted and is
                  waiting for administrator review.
                </p>
              </div>

            </div>

          </div>
        )}

        {isRejected && (
          <div className="mt-6 rounded-2xl border border-red-500/20 bg-red-500/5 p-5">

            <div className="flex items-center gap-3">

              <XCircle className="text-red-400" />

              <div>
                <h3 className="font-semibold text-red-400">
                  Application Rejected
                </h3>

                <p className="mt-1 text-sm text-zinc-400">
                  Your loan application was not approved by the
                  administrator.
                </p>
              </div>

            </div>

          </div>
        )}

      </div>

      {isActive && (
  <div className="mt-6 rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-5">

    <div className="flex items-center gap-3">

      <CheckCircle2 className="text-cyan-400" />

      <div>
        <h3 className="font-semibold text-cyan-400">
          Loan Activated
        </h3>

        <p className="mt-1 text-sm text-zinc-400">
          Your payment has been verified successfully
          and your loan is now active.
        </p>
      </div>

    </div>

  </div>
)}

      {/* AI DECISION SUMMARY */}
      <div className="mt-8 rounded-3xl border border-cyan-500/20 bg-zinc-900 p-6">

        <div className="flex items-center gap-3">

          <BrainCircuit className="text-cyan-400" />

          <h2 className="text-xl font-bold text-cyan-300">
            AI Decision Summary
          </h2>

        </div>

        <ul className="mt-5 space-y-2 text-zinc-300">

          <li>✅ Aadhaar Verified</li>
          <li>✅ PAN Verified</li>
          <li>✅ Salary Verified</li>
          <li>✅ Bank Verified</li>
          <li>✅ OCR Extraction Completed</li>
          <li>✅ AI Repayment Prediction Generated</li>

        </ul>

      </div>

      {/* FHE */}
      <div className="mt-8 rounded-3xl border border-green-500/20 bg-green-500/10 p-6">

        <div className="flex items-center gap-3">

          <ShieldCheck className="text-green-400" />

          <div>

            <h2 className="font-bold text-green-400">
              Fully Homomorphic Encryption
            </h2>

            <p className="mt-2 text-zinc-300">
              All financial information remained encrypted during
              AI computation. No sensitive data was exposed.
            </p>

          </div>

        </div>

      </div>

    </div>
  );
}

/* CARD COMPONENT */

function Card({
  title,
  value,
  icon,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#111827] p-5">

      <div className="flex items-center justify-between">

        <p className="text-zinc-400">
          {title}
        </p>

        {icon}

      </div>

      <h2 className="mt-4 text-3xl font-bold text-white">
        {value}
      </h2>

    </div>
  );
}

/* PROGRESS COMPONENT */

function ProgressStep({
  number,
  title,
  description,
  status,
}: {
  number: string;
  title: string;
  description: string;
  status: "completed" | "current" | "rejected";
}) {
  const completed = status === "completed";
  const current = status === "current";
  const rejected = status === "rejected";

  return (
    <div
      className={`rounded-2xl border p-5 transition ${
        completed
          ? "border-green-500/20 bg-green-500/5"
          : current
          ? "border-yellow-500/20 bg-yellow-500/5"
          : rejected
          ? "border-red-500/20 bg-red-500/5"
          : "border-white/10 bg-[#111827]"
      }`}
    >

      <div className="flex items-start gap-4">

        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-bold ${
            completed
              ? "bg-green-500/20 text-green-400"
              : current
              ? "bg-yellow-500/20 text-yellow-400"
              : rejected
              ? "bg-red-500/20 text-red-400"
              : "bg-white/10 text-zinc-400"
          }`}
        >
          {completed ? (
            <CheckCircle2 size={20} />
          ) : rejected ? (
            <XCircle size={20} />
          ) : current ? (
            <Clock3 size={20} />
          ) : (
            number
          )}
        </div>

        <div>
          <h3 className="font-semibold text-white">
            {title}
          </h3>

          <p className="mt-1 text-sm text-zinc-400">
            {description}
          </p>
        </div>

      </div>

    </div>
  );
}