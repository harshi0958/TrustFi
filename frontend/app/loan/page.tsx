import LoanLayout from "@/components/loan/LoanLayout";

export default function LoanPage() {
  return (
    <LoanLayout>

      <h1 className="text-4xl font-bold text-white">
        Loan Application
      </h1>

      <p className="mt-3 text-zinc-400">
        Complete all required steps to submit your loan application.
      </p>

    </LoanLayout>
  );
}