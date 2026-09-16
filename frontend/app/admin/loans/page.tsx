"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import AdminSidebar from "@/components/admin/AdminSidebar";

const API = process.env.NEXT_PUBLIC_API_URL;

export default function AdminLoansPage() {
  const router = useRouter();

  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const [loans, setLoans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [loanType, setLoanType] = useState("ALL");
  const [status, setStatus] = useState("ALL");
  const [risk, setRisk] = useState("ALL");

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
  // LOAD LOANS
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
      console.error("Loans error:", error);
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
  // APPROVE LOAN
  // =========================

  const approveLoan = async (id: string) => {
    try {
      const res = await fetch(`${API}/api/loan/approve/${id}`, {
        method: "PATCH",
      });

      if (!res.ok) {
        throw new Error("Failed to approve loan");
      }

      await loadLoans();
    } catch (error) {
      console.error("Approve error:", error);
    }
  };

  // =========================
  // REJECT LOAN
  // =========================

  const rejectLoan = async (id: string) => {
    try {
      const res = await fetch(`${API}/api/loan/reject/${id}`, {
        method: "PATCH",
      });

      if (!res.ok) {
        throw new Error("Failed to reject loan");
      }

      await loadLoans();
    } catch (error) {
      console.error("Reject error:", error);
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
  // FILTER LOANS
  // =========================

  const filteredLoans = useMemo(() => {
    return loans.filter((loan) => {
      const searchText = search.toLowerCase();

      const matchesSearch =
        loan.fullName?.toLowerCase().includes(searchText) ||
        loan.email?.toLowerCase().includes(searchText) ||
        loan.phone?.includes(search);

      const matchesLoanType =
        loanType === "ALL" ||
        loan.loanType === loanType;

      const matchesStatus =
        status === "ALL" ||
        loan.status === status;

      const matchesRisk =
        risk === "ALL" ||
        loan.risk === risk;

      return (
        matchesSearch &&
        matchesLoanType &&
        matchesStatus &&
        matchesRisk
      );
    });
  }, [loans, search, loanType, status, risk]);

  // =========================
  // STATS
  // =========================

  const totalAmount = loans.reduce(
    (sum, loan) => sum + Number(loan.loanAmount || 0),
    0
  );

  const approvedCount = loans.filter(
    (loan) => loan.status === "APPROVED"
  ).length;

  const pendingCount = loans.filter(
    (loan) => loan.status === "PENDING"
  ).length;

  const rejectedCount = loans.filter(
    (loan) => loan.status === "REJECTED"
  ).length;

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
              📋
            </div>

            <p className="text-gray-400">
              Loading loan applications...
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
                Loan Management
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

          <div className="mb-8">

            <h2 className="text-4xl font-bold">
              All Loans
            </h2>

            <p className="text-gray-400 mt-2">
              View and manage all TrustFi loan applications.
            </p>

          </div>


          {/* ================= STATS ================= */}

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4 mb-8">

            <MiniStat
              title="Applications"
              value={loans.length}
              icon="📋"
            />

            <MiniStat
              title="Total Amount"
              value={`₹${totalAmount.toLocaleString("en-IN")}`}
              icon="💰"
            />

            <MiniStat
              title="Approved"
              value={approvedCount}
              icon="✅"
            />

            <MiniStat
              title="Pending"
              value={pendingCount}
              icon="⏳"
            />

            <MiniStat
              title="Rejected"
              value={rejectedCount}
              icon="❌"
            />

          </div>


          {/* ================= FILTERS ================= */}

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 mb-6">

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">

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
                  className="w-full rounded-xl border border-white/10 bg-white/[0.04] py-3 pl-11 pr-4 text-sm text-white placeholder-gray-600 outline-none focus:border-cyan-500/40"
                />

              </div>


              {/* LOAN TYPE */}

              <select
                value={loanType}
                onChange={(e) => setLoanType(e.target.value)}
                className="rounded-xl border border-white/10 bg-[#101426] px-4 py-3 text-sm text-white outline-none focus:border-cyan-500/40"
              >

                <option value="ALL">
                  All Loan Types
                </option>

                <option value="PERSONAL">
                  Personal Loan
                </option>

                <option value="PROPERTY">
                  Property Loan
                </option>

                <option value="GOLD">
                  Gold Loan
                </option>

              </select>


              {/* STATUS */}

              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="rounded-xl border border-white/10 bg-[#101426] px-4 py-3 text-sm text-white outline-none focus:border-cyan-500/40"
              >

                <option value="ALL">
                  All Status
                </option>

                <option value="APPROVED">
                  Approved
                </option>

                <option value="PENDING">
                  Pending
                </option>

                <option value="REJECTED">
                  Rejected
                </option>

              </select>


              {/* RISK */}

              <select
                value={risk}
                onChange={(e) => setRisk(e.target.value)}
                className="rounded-xl border border-white/10 bg-[#101426] px-4 py-3 text-sm text-white outline-none focus:border-cyan-500/40"
              >

                <option value="ALL">
                  All Risk Levels
                </option>

                <option value="LOW">
                  Low Risk
                </option>

                <option value="MEDIUM">
                  Medium Risk
                </option>

                <option value="HIGH">
                  High Risk
                </option>

              </select>

            </div>


            {/* FILTER INFO */}

            <div className="mt-4 flex items-center justify-between">

              <p className="text-xs text-gray-500">
                Showing{" "}
                <span className="text-cyan-400 font-semibold">
                  {filteredLoans.length}
                </span>{" "}
                of{" "}
                <span className="text-white">
                  {loans.length}
                </span>{" "}
                applications
              </p>


              <button
                onClick={() => {
                  setSearch("");
                  setLoanType("ALL");
                  setStatus("ALL");
                  setRisk("ALL");
                }}
                className="text-xs text-gray-500 hover:text-cyan-400 transition"
              >
                Clear Filters
              </button>

            </div>

          </div>


          {/* ================= LOANS TABLE ================= */}

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden">

            <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between">

              <div>

                <h3 className="text-xl font-bold">
                  Loan Applications
                </h3>

                <p className="text-sm text-gray-500 mt-1">
                  Complete application records
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

              <table className="min-w-[1100px] w-full">

                <thead className="bg-white/[0.03]">

                  <tr>

                    <th className="px-6 py-4 text-left text-xs uppercase tracking-wider text-gray-500">
                      Applicant
                    </th>

                    <th className="px-5 py-4 text-center text-xs uppercase tracking-wider text-gray-500">
                      Type
                    </th>

                    <th className="px-5 py-4 text-center text-xs uppercase tracking-wider text-gray-500">
                      Amount
                    </th>

                    <th className="px-5 py-4 text-center text-xs uppercase tracking-wider text-gray-500">
                      Score
                    </th>

                    <th className="px-5 py-4 text-center text-xs uppercase tracking-wider text-gray-500">
                      Risk
                    </th>

                    <th className="px-5 py-4 text-center text-xs uppercase tracking-wider text-gray-500">
                      Interest
                    </th>

                    <th className="px-5 py-4 text-center text-xs uppercase tracking-wider text-gray-500">
                      Status
                    </th>

                    <th className="px-5 py-4 text-center text-xs uppercase tracking-wider text-gray-500">
                      Action
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {filteredLoans.map((loan: any) => (

                    <tr
                      key={loan.id}
                      className="border-t border-white/10 hover:bg-cyan-500/[0.03] transition"
                    >

                      {/* APPLICANT */}

                      <td className="px-6 py-5">

                        <p className="font-semibold">
                          {loan.fullName}
                        </p>

                        <p className="text-xs text-gray-500 mt-1">
                          {loan.email}
                        </p>

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

                        <RiskBadge risk={loan.risk} />

                      </td>


                      {/* INTEREST */}

                      <td className="px-5 py-5 text-center">
                        {loan.interestRate}%
                      </td>


                      {/* STATUS */}

                      <td className="px-5 py-5 text-center">

                        <StatusBadge status={loan.status} />

                      </td>


                      {/* ACTION */}

                      <td className="px-5 py-5 text-center">

                        {loan.status === "PENDING" ? (

                          <div className="flex justify-center gap-2">

                            <button
                              onClick={() => approveLoan(loan.id)}
                              className="rounded-lg border border-green-500/20 bg-green-500/10 px-3 py-2 text-xs text-green-400 hover:bg-green-500 hover:text-white transition"
                            >
                              Approve
                            </button>

                            <button
                              onClick={() => rejectLoan(loan.id)}
                              className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-400 hover:bg-red-500 hover:text-white transition"
                            >
                              Reject
                            </button>

                          </div>

                        ) : loan.status === "APPROVED" ? (

                          <span className="text-xs text-green-400">
                            Approved
                          </span>

                        ) : (

                          <span className="text-xs text-red-400">
                            Rejected
                          </span>

                        )}

                      </td>

                    </tr>

                  ))}


                  {/* EMPTY */}

                  {filteredLoans.length === 0 && (

                    <tr>

                      <td
                        colSpan={8}
                        className="px-6 py-16 text-center"
                      >

                        <div className="text-4xl mb-3">
                          🔍
                        </div>

                        <p className="font-semibold">
                          No applications found
                        </p>

                        <p className="text-sm text-gray-500 mt-1">
                          Try changing your search or filters.
                        </p>

                      </td>

                    </tr>

                  )}

                </tbody>

              </table>

            </div>

          </div>

        </main>

      </div>

    </div>
  );
}


/* =========================================================
   MINI STAT
========================================================= */

function MiniStat({
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
   RISK BADGE
========================================================= */

function RiskBadge({
  risk,
}: {
  risk: string;
}) {
  return (
    <span
      className={`rounded-full px-3 py-1.5 text-xs ${
        risk === "LOW"
          ? "bg-green-500/10 text-green-400"
          : risk === "MEDIUM"
          ? "bg-yellow-500/10 text-yellow-400"
          : "bg-red-500/10 text-red-400"
      }`}
    >
      {risk}
    </span>
  );
}


/* =========================================================
   STATUS BADGE
========================================================= */

function StatusBadge({
  status,
}: {
  status: string;
}) {
  if (status === "APPROVED") {
    return (
      <span className="text-sm text-green-400">
        ✅ Approved
      </span>
    );
  }

  if (status === "REJECTED") {
    return (
      <span className="text-sm text-red-400">
        ❌ Rejected
      </span>
    );
  }

  return (
    <span className="text-sm text-yellow-400">
      ⏳ Pending
    </span>
  );
}