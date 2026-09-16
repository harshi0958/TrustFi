"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import AdminSidebar from "@/components/admin/AdminSidebar";

const API = process.env.NEXT_PUBLIC_API_URL;

export default function AdminApprovalsPage() {
  const router = useRouter();

  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const [loans, setLoans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [selectedLoan, setSelectedLoan] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // =========================
  // AUTH CHECK
  // =========================

  useEffect(() => {
    const token = localStorage.getItem("adminToken");

    if (!token) {
      router.replace("/admin/login");
      return;
    }

    setIsAuthenticated(true);
    setIsCheckingAuth(false);
  }, [router]);

  // =========================
  // LOAD PENDING LOANS
  // =========================

  const loadLoans = async () => {
    try {
      setLoading(true);

      const res = await fetch(`${API}/api/loan`);

      if (!res.ok) {
        throw new Error("Failed to load loans");
      }

      const data = await res.json();

      setLoans(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Approvals error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadLoans();
    }
  }, [isAuthenticated]);

  // =========================
  // PENDING APPLICATIONS
  // =========================

  const pendingLoans = useMemo(() => {
    return loans.filter((loan) => {
      const isPending = loan.status === "PENDING";

      const searchText = search.toLowerCase();

      const matchesSearch =
        loan.fullName?.toLowerCase().includes(searchText) ||
        loan.email?.toLowerCase().includes(searchText) ||
        loan.phone?.includes(search);

      return isPending && matchesSearch;
    });
  }, [loans, search]);

  // =========================
  // STATS
  // =========================

  const totalPendingAmount = pendingLoans.reduce(
    (sum, loan) => sum + Number(loan.loanAmount || 0),
    0
  );

  const lowRiskCount = pendingLoans.filter(
    (loan) => loan.risk === "LOW"
  ).length;

  const mediumRiskCount = pendingLoans.filter(
    (loan) => loan.risk === "MEDIUM"
  ).length;

  const highRiskCount = pendingLoans.filter(
    (loan) => loan.risk === "HIGH"
  ).length;

  // =========================
  // APPROVE
  // =========================

  const approveLoan = async () => {
    if (!selectedLoan) return;

    try {
      setActionLoading(true);

      const res = await fetch(
        `${API}/api/loan/approve/${selectedLoan.id}`,
        {
          method: "PATCH",
        }
      );

      if (!res.ok) {
        throw new Error("Failed to approve loan");
      }

      setSelectedLoan(null);

      await loadLoans();
    } catch (error) {
      console.error("Approve error:", error);
    } finally {
      setActionLoading(false);
    }
  };

  // =========================
  // REJECT
  // =========================

  const rejectLoan = async () => {
    if (!selectedLoan) return;

    try {
      setActionLoading(true);

      const res = await fetch(
        `${API}/api/loan/reject/${selectedLoan.id}`,
        {
          method: "PATCH",
        }
      );

      if (!res.ok) {
        throw new Error("Failed to reject loan");
      }

      setSelectedLoan(null);

      await loadLoans();
    } catch (error) {
      console.error("Reject error:", error);
    } finally {
      setActionLoading(false);
    }
  };

  // =========================
  // LOGOUT
  // =========================

  const logout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminEmail");
    localStorage.removeItem("adminName");

    router.replace("/admin/login");
  };

  // =========================
  // AUTH LOADING
  // =========================

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-[#050816] flex items-center justify-center text-white">
        <div className="text-center">
          <div className="text-5xl mb-4 animate-pulse">
            🔐
          </div>

          <p className="text-gray-400">
            Checking admin authentication...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  // =========================
  // PAGE LOADING
  // =========================

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050816] text-white">

        <AdminSidebar />

        <div className="ml-64 min-h-screen flex items-center justify-center">

          <div className="text-center">

            <div className="text-5xl mb-4 animate-pulse">
              ✅
            </div>

            <p className="text-gray-400">
              Loading pending applications...
            </p>

          </div>

        </div>

      </div>
    );
  }

  // =========================
  // PAGE
  // =========================

  return (
    <div className="min-h-screen bg-[#050816] text-white">

      <AdminSidebar />

      <div className="ml-64">

        {/* ================= HEADER ================= */}

        <header className="border-b border-white/10 bg-[#080b1d]/80 backdrop-blur-xl">

          <div className="px-8 py-5 flex items-center justify-between">

            <div>

              <h1 className="text-2xl font-bold">

                <span className="text-cyan-400">
                  Trust
                </span>
                Fi

                <span className="text-gray-500 text-sm ml-3">
                  ADMIN
                </span>

              </h1>

              <p className="text-xs text-gray-500 mt-1">
                Loan Approval Center
              </p>

            </div>

            <div className="text-right">

              <p className="text-sm font-semibold">
                {localStorage.getItem("adminName") || "Admin"}
              </p>

              <p className="text-xs text-gray-500">
                Administrator
              </p>

            </div>

          </div>

        </header>


        {/* ================= MAIN ================= */}

        <main className="px-8 py-10">

          {/* TITLE */}

          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5 mb-8">

            <div>

              <div className="flex items-center gap-3">

                <h2 className="text-4xl font-bold">
                  Approvals
                </h2>

                <span className="rounded-full bg-yellow-500/10 border border-yellow-500/20 px-3 py-1 text-xs font-semibold text-yellow-400">
                  {pendingLoans.length} Pending
                </span>

              </div>

              <p className="text-gray-400 mt-2">
                Review and process pending loan applications.
              </p>

            </div>


            {/* SEARCH */}

            <div className="relative">

              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                🔍
              </span>

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search applicant..."
                className="w-full md:w-80 rounded-xl border border-white/10 bg-white/[0.04] py-3 pl-11 pr-4 text-sm text-white placeholder-gray-600 outline-none focus:border-cyan-500/40"
              />

            </div>

          </div>


          {/* ================= STATS ================= */}

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">

            <ApprovalStat
              title="Pending Applications"
              value={pendingLoans.length}
              icon="⏳"
            />

            <ApprovalStat
              title="Pending Amount"
              value={`₹${totalPendingAmount.toLocaleString("en-IN")}`}
              icon="💰"
            />

            <ApprovalStat
              title="Low Risk"
              value={lowRiskCount}
              icon="🟢"
            />

            <ApprovalStat
              title="Medium / High Risk"
              value={mediumRiskCount + highRiskCount}
              icon="⚠️"
            />

          </div>


          {/* ================= PENDING TABLE ================= */}

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden">

            <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between">

              <div>

                <h3 className="text-xl font-bold">
                  Pending Applications
                </h3>

                <p className="text-sm text-gray-500 mt-1">
                  Applications waiting for administrator approval
                </p>

              </div>

              <button
                onClick={loadLoans}
                className="rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-sm text-cyan-400 hover:bg-cyan-500/20 transition"
              >
                ↻ Refresh
              </button>

            </div>


            <div className="overflow-x-auto">

              <table className="min-w-[1150px] w-full">

                <thead className="bg-white/[0.03]">

                  <tr>

                    <th className="px-6 py-4 text-left text-xs uppercase tracking-wider text-gray-500">
                      Applicant
                    </th>

                    <th className="px-5 py-4 text-center text-xs uppercase tracking-wider text-gray-500">
                      Loan Type
                    </th>

                    <th className="px-5 py-4 text-center text-xs uppercase tracking-wider text-gray-500">
                      Amount
                    </th>

                    <th className="px-5 py-4 text-center text-xs uppercase tracking-wider text-gray-500">
                      Credit Score
                    </th>

                    <th className="px-5 py-4 text-center text-xs uppercase tracking-wider text-gray-500">
                      Risk
                    </th>

                    <th className="px-5 py-4 text-center text-xs uppercase tracking-wider text-gray-500">
                      Interest
                    </th>

                    <th className="px-5 py-4 text-center text-xs uppercase tracking-wider text-gray-500">
                      Action
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {pendingLoans.map((loan: any) => (

                    <tr
                      key={loan.id}
                      className="border-t border-white/10 hover:bg-cyan-500/[0.03] transition"
                    >

                      {/* APPLICANT */}

                      <td className="px-6 py-5">

                        <div className="flex items-center gap-3">

                          <div className="h-10 w-10 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 font-bold">
                            {loan.fullName?.charAt(0)?.toUpperCase() || "U"}
                          </div>

                          <div>

                            <p className="font-semibold">
                              {loan.fullName}
                            </p>

                            <p className="text-xs text-gray-500 mt-1">
                              {loan.email}
                            </p>

                          </div>

                        </div>

                      </td>


                      {/* TYPE */}

                      <td className="px-5 py-5 text-center">

                        <span className="rounded-lg border border-cyan-500/20 bg-cyan-500/10 px-3 py-1.5 text-xs text-cyan-400">
                          {loan.loanType}
                        </span>

                      </td>


                      {/* AMOUNT */}

                      <td className="px-5 py-5 text-center font-semibold">
                        ₹{Number(loan.loanAmount).toLocaleString("en-IN")}
                      </td>


                      {/* SCORE */}

                      <td className="px-5 py-5 text-center">

                        <span className="font-bold text-cyan-400">
                          {loan.creditScore}
                        </span>

                      </td>


                      {/* RISK */}

                      <td className="px-5 py-5 text-center">

                        <span
                          className={`rounded-full px-3 py-1.5 text-xs ${
                            loan.risk === "LOW"
                              ? "bg-green-500/10 text-green-400"
                              : loan.risk === "MEDIUM"
                              ? "bg-yellow-500/10 text-yellow-400"
                              : "bg-red-500/10 text-red-400"
                          }`}
                        >
                          {loan.risk}
                        </span>

                      </td>


                      {/* INTEREST */}

                      <td className="px-5 py-5 text-center">
                        {loan.interestRate}%
                      </td>


                      {/* ACTION */}

                      <td className="px-5 py-5 text-center">

                        <button
                          onClick={() => setSelectedLoan(loan)}
                          className="rounded-lg bg-cyan-500 px-4 py-2 text-xs font-semibold text-black hover:bg-cyan-400 transition"
                        >
                          Review
                        </button>

                      </td>

                    </tr>

                  ))}


                  {/* EMPTY */}

                  {pendingLoans.length === 0 && (

                    <tr>

                      <td
                        colSpan={7}
                        className="px-6 py-20 text-center"
                      >

                        <div className="text-5xl mb-4">
                          🎉
                        </div>

                        <p className="text-xl font-bold">
                          No Pending Applications
                        </p>

                        <p className="text-sm text-gray-500 mt-2">
                          All loan applications have been processed.
                        </p>

                      </td>

                    </tr>

                  )}

                </tbody>

              </table>

            </div>

          </div>

        </main>


        {/* ================= REVIEW MODAL ================= */}

        {selectedLoan && (

          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">

            <div className="w-full max-w-3xl max-h-[90vh] overflow-hidden rounded-2xl border border-white/10 bg-[#0b0f22] shadow-2xl">

              {/* HEADER */}

              <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">

                <div>

                  <p className="text-xs uppercase tracking-wider text-cyan-400">
                    Loan Application Review
                  </p>

                  <h3 className="text-2xl font-bold mt-1">
                    {selectedLoan.fullName}
                  </h3>

                  <p className="text-sm text-gray-500 mt-1">
                    {selectedLoan.email}
                  </p>

                </div>

                <button
                  onClick={() => setSelectedLoan(null)}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-gray-400 hover:bg-white/10 hover:text-white transition"
                >
                  ✕
                </button>

              </div>


              {/* BODY */}

              <div className="max-h-[calc(90vh-170px)] overflow-y-auto p-6">

                {/* LOAN INFO */}

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">

                  <ReviewItem
                    label="Loan Type"
                    value={selectedLoan.loanType}
                  />

                  <ReviewItem
                    label="Loan Amount"
                    value={`₹${Number(
                      selectedLoan.loanAmount
                    ).toLocaleString("en-IN")}`}
                  />

                  <ReviewItem
                    label="Tenure"
                    value={`${selectedLoan.loanMonths} Months`}
                  />

                  <ReviewItem
                    label="Credit Score"
                    value={selectedLoan.creditScore}
                  />

                  <ReviewItem
                    label="Interest Rate"
                    value={`${selectedLoan.interestRate}%`}
                  />

                  <ReviewItem
                    label="Risk Level"
                    value={selectedLoan.risk}
                  />

                </div>


                {/* APPLICANT */}

                <div className="mb-6">

                  <h4 className="text-lg font-bold mb-4">
                    Applicant Information
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    <ReviewItem
                      label="Full Name"
                      value={selectedLoan.fullName}
                    />

                    <ReviewItem
                      label="Email"
                      value={selectedLoan.email}
                    />

                    <ReviewItem
                      label="Phone"
                      value={selectedLoan.phone}
                    />

                    <ReviewItem
                      label="Monthly Income"
                      value={`₹${Number(
                        selectedLoan.monthlyIncome || 0
                      ).toLocaleString("en-IN")}`}
                    />

                  </div>

                </div>


                {/* PURPOSE */}

                <div className="mb-6">

                  <h4 className="text-lg font-bold mb-3">
                    Loan Purpose
                  </h4>

                  <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">

                    <p className="text-sm text-gray-300">
                      {selectedLoan.purpose || "Not provided"}
                    </p>

                  </div>

                </div>


                {/* AI DECISION */}

                <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/[0.05] p-5">

                  <div className="flex items-center justify-between">

                    <div>

                      <p className="text-xs uppercase tracking-wider text-gray-500">
                        AI Risk Assessment
                      </p>

                      <p className="text-lg font-bold mt-1">
                        {selectedLoan.risk} RISK
                      </p>

                    </div>

                    <div className="text-right">

                      <p className="text-xs text-gray-500">
                        Eligibility
                      </p>

                      <p className="text-2xl font-bold text-cyan-400">
                        {selectedLoan.eligibility}%
                      </p>

                    </div>

                  </div>

                </div>

              </div>


              {/* FOOTER */}

              <div className="border-t border-white/10 px-6 py-5 flex flex-col sm:flex-row gap-3 sm:justify-end">

                <button
                  onClick={() => setSelectedLoan(null)}
                  disabled={actionLoading}
                  className="rounded-xl border border-white/10 px-5 py-3 text-sm text-gray-400 hover:bg-white/5 hover:text-white transition"
                >
                  Cancel
                </button>

                <button
                  onClick={rejectLoan}
                  disabled={actionLoading}
                  className="rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-3 text-sm font-semibold text-red-400 hover:bg-red-500 hover:text-white transition disabled:opacity-50"
                >
                  {actionLoading ? "Processing..." : "❌ Reject Loan"}
                </button>

                <button
                  onClick={approveLoan}
                  disabled={actionLoading}
                  className="rounded-xl bg-green-500 px-5 py-3 text-sm font-semibold text-black hover:bg-green-400 transition disabled:opacity-50"
                >
                  {actionLoading ? "Processing..." : "✅ Approve Loan"}
                </button>

              </div>

            </div>

          </div>

        )}

      </div>

    </div>
  );
}


/* =========================================================
   APPROVAL STAT
========================================================= */

function ApprovalStat({
  title,
  value,
  icon,
}: {
  title: string;
  value: string | number;
  icon: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">

      <div className="flex items-center justify-between">

        <div>

          <p className="text-xs text-gray-500">
            {title}
          </p>

          <p className="text-2xl font-bold mt-2">
            {value}
          </p>

        </div>

        <div className="text-2xl">
          {icon}
        </div>

      </div>

    </div>
  );
}


/* =========================================================
   REVIEW ITEM
========================================================= */

function ReviewItem({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">

      <p className="text-xs uppercase tracking-wider text-gray-500">
        {label}
      </p>

      <p className="mt-2 text-sm font-semibold text-white">
        {value}
      </p>

    </div>
  );
}