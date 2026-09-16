"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";

const API = process.env.NEXT_PUBLIC_API_URL;

export default function AdminPage() {
  const router = useRouter();

  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const [dashboard, setDashboard] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
  // LOAD DASHBOARD
  // =========================
  const loadDashboard = async () => {
    try {
      setLoading(true);

      const res = await fetch(`${API}/api/admin/dashboard`);

      if (!res.ok) {
        throw new Error("Failed to load dashboard");
      }

      const data = await res.json();

      setDashboard(data);
    } catch (error) {
      console.error("Dashboard error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadDashboard();
    }
  }, [isAuthenticated]);

  // =========================
  // APPROVE
  // =========================
  const approveLoan = async (id: string) => {
    try {
      await fetch(`${API}/api/loan/approve/${id}`, {
        method: "PATCH",
      });

      loadDashboard();
    } catch (error) {
      console.error("Approve error:", error);
    }
  };

  // =========================
  // REJECT
  // =========================
  const rejectLoan = async (id: string) => {
    try {
      await fetch(`${API}/api/loan/reject/${id}`, {
        method: "PATCH",
      });

      loadDashboard();
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
  // DASHBOARD LOADING
  // =========================
  if (loading || !dashboard) {
    return (
      <div className="min-h-screen bg-[#050816] flex items-center justify-center text-white">
        <div className="text-center">
          <div className="text-5xl mb-4 animate-pulse">
            📊
          </div>

          <p className="text-gray-400">
            Loading TrustFi Admin Dashboard...
          </p>
        </div>
      </div>
    );
  }

  const stats = dashboard.statistics;
  const loanTypes = dashboard.loanTypes;
  const recentApplications = dashboard.recentApplications;

  // =========================
  // DASHBOARD
  // =========================
  return (
    <div className="min-h-screen bg-[#050816] text-white">
        <AdminSidebar />
          <div className="ml-64">
      {/* ================= HEADER ================= */}
      <header className="border-b border-white/10 bg-[#080b1d]/80 backdrop-blur-xl">

        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">

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
              Lending Management Platform
            </p>
          </div>

          <div className="flex items-center gap-4">

            <div className="hidden sm:block text-right">
              <p className="text-sm font-semibold">
                {localStorage.getItem("adminName") || "Admin"}
              </p>

              <p className="text-xs text-gray-500">
                Administrator
              </p>
            </div>

            

          </div>

        </div>

      </header>

      {/* ================= MAIN ================= */}
      <main className="max-w-7xl mx-auto px-6 py-10">

        {/* TITLE */}

        <div className="mb-8">

          <h2 className="text-4xl font-bold">
            Dashboard
          </h2>

          <p className="text-gray-400 mt-2">
            Monitor TrustFi lending activity and loan applications.
          </p>

        </div>


        {/* ================= STATS ================= */}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">

          {/* USERS */}
          <StatCard
            icon="👥"
            title="Total Users"
            value={stats.totalUsers}
            description="Unique applicants"
          />

          {/* LOANS */}
          <StatCard
            icon="📋"
            title="Total Applications"
            value={stats.totalLoans}
            description="Loan applications"
          />

          {/* AMOUNT */}
          <StatCard
            icon="💰"
            title="Total Loan Amount"
            value={`₹${(stats.totalLoanAmount / 100000).toFixed(1)}L`}
            description="Requested amount"
          />

          {/* APPROVED */}
          <StatCard
            icon="✅"
            title="Approved Loans"
            value={stats.approvedLoans}
            description="Successfully approved"
          />

          {/* PENDING */}
          <StatCard
            icon="⏳"
            title="Pending Loans"
            value={stats.pendingLoans}
            description="Waiting for approval"
          />

          {/* REJECTED */}
          <StatCard
            icon="❌"
            title="Rejected Loans"
            value={stats.rejectedLoans}
            description="Rejected applications"
          />

        </div>


        {/* ================= ANALYTICS ================= */}

        <div className="grid lg:grid-cols-2 gap-6 mb-10">

          {/* LOAN TYPES */}

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">

            <div className="mb-6">

              <h3 className="text-xl font-bold">
                Loan Distribution
              </h3>

              <p className="text-sm text-gray-500">
                Applications by loan type
              </p>

            </div>

            <LoanTypeRow
              icon="👤"
              name="Personal Loan"
              count={loanTypes.personal.count}
              amount={loanTypes.personal.amount}
            />

            <LoanTypeRow
              icon="🏠"
              name="Property Loan"
              count={loanTypes.property.count}
              amount={loanTypes.property.amount}
            />

            <LoanTypeRow
              icon="🪙"
              name="Gold Loan"
              count={loanTypes.gold.count}
              amount={loanTypes.gold.amount}
            />

          </div>


          {/* APPLICATION STATUS */}

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">

            <div className="mb-6">

              <h3 className="text-xl font-bold">
                Application Status
              </h3>

              <p className="text-sm text-gray-500">
                Current loan application status
              </p>

            </div>

            <StatusRow
              label="Approved"
              count={stats.approvedLoans}
            />

            <StatusRow
              label="Pending"
              count={stats.pendingLoans}
            />

            <StatusRow
              label="Rejected"
              count={stats.rejectedLoans}
            />

            <div className="mt-6 pt-5 border-t border-white/10 flex justify-between">

              <span className="text-gray-400">
                Total Applications
              </span>

              <span className="font-bold">
                {stats.totalLoans}
              </span>

            </div>

          </div>

        </div>


        {/* ================= RECENT APPLICATIONS ================= */}

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden">

          <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between">

            <div>

              <h3 className="text-xl font-bold">
                Recent Applications
              </h3>

              <p className="text-sm text-gray-500 mt-1">
                Latest loan applications
              </p>

            </div>

            <button
              onClick={loadDashboard}
              className="rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-sm text-cyan-400 hover:bg-cyan-500/20 transition"
            >
              ↻ Refresh
            </button>

          </div>


          <div className="overflow-x-auto">

            <table className="min-w-full">

              <thead className="bg-white/[0.03]">

                <tr>

                  <th className="px-6 py-4 text-left text-xs uppercase tracking-wider text-gray-500">
                    Applicant
                  </th>

                  <th className="px-6 py-4 text-center text-xs uppercase tracking-wider text-gray-500">
                    Loan Type
                  </th>

                  <th className="px-6 py-4 text-center text-xs uppercase tracking-wider text-gray-500">
                    Amount
                  </th>

                  <th className="px-6 py-4 text-center text-xs uppercase tracking-wider text-gray-500">
                    Credit Score
                  </th>

                  <th className="px-6 py-4 text-center text-xs uppercase tracking-wider text-gray-500">
                    Risk
                  </th>

                  <th className="px-6 py-4 text-center text-xs uppercase tracking-wider text-gray-500">
                    Status
                  </th>

                  <th className="px-6 py-4 text-center text-xs uppercase tracking-wider text-gray-500">
                    Action
                  </th>

                </tr>

              </thead>


              <tbody>

                {recentApplications.map((loan: any) => (

                  <tr
                    key={loan.id}
                    className="border-t border-white/10 hover:bg-cyan-500/[0.03] transition"
                  >

                    {/* APPLICANT */}

                    <td className="px-6 py-5">

                      <div className="font-semibold">
                        {loan.fullName}
                      </div>

                      <div className="text-xs text-gray-500 mt-1">
                        {loan.email}
                      </div>

                    </td>


                    {/* TYPE */}

                    <td className="px-6 py-5 text-center">

                      <span className="rounded-lg bg-cyan-500/10 border border-cyan-500/20 px-3 py-1.5 text-xs text-cyan-400">
                        {loan.loanType}
                      </span>

                    </td>


                    {/* AMOUNT */}

                    <td className="px-6 py-5 text-center font-semibold">
                      ₹{loan.loanAmount.toLocaleString("en-IN")}
                    </td>


                    {/* CREDIT */}

                    <td className="px-6 py-5 text-center">

                      <span className="font-bold text-cyan-400">
                        {loan.creditScore}
                      </span>

                    </td>


                    {/* RISK */}

                    <td className="px-6 py-5 text-center">

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


                    {/* STATUS */}

                    <td className="px-6 py-5 text-center">

                      {loan.status === "APPROVED" ? (

                        <span className="text-green-400 text-sm">
                          ✅ Approved
                        </span>

                      ) : loan.status === "REJECTED" ? (

                        <span className="text-red-400 text-sm">
                          ❌ Rejected
                        </span>

                      ) : (

                        <span className="text-yellow-400 text-sm">
                          ⏳ Pending
                        </span>

                      )}

                    </td>


                    {/* ACTION */}

                    <td className="px-6 py-5 text-center">

                      {loan.status === "PENDING" && (

                        <div className="flex justify-center gap-2">

                          <button
                            onClick={() => approveLoan(loan.id)}
                            className="rounded-lg bg-green-500/10 border border-green-500/20 px-3 py-2 text-xs text-green-400 hover:bg-green-500 hover:text-white transition"
                          >
                            Approve
                          </button>

                          <button
                            onClick={() => rejectLoan(loan.id)}
                            className="rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2 text-xs text-red-400 hover:bg-red-500 hover:text-white transition"
                          >
                            Reject
                          </button>

                        </div>

                      )}

                      {loan.status === "APPROVED" && (
                        <span className="text-xs text-green-400">
                          Approved
                        </span>
                      )}

                      {loan.status === "REJECTED" && (
                        <span className="text-xs text-red-400">
                          Rejected
                        </span>
                      )}

                    </td>

                  </tr>

                ))}

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
   STAT CARD
========================================================= */

function StatCard({
  icon,
  title,
  value,
  description,
}: {
  icon: string;
  title: string;
  value: string | number;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 hover:border-cyan-500/30 transition">

      <div className="flex items-start justify-between">

        <div>

          <p className="text-sm text-gray-500">
            {title}
          </p>

          <p className="text-3xl font-bold mt-2">
            {value}
          </p>

          <p className="text-xs text-gray-600 mt-2">
            {description}
          </p>

        </div>

        <div className="text-3xl">
          {icon}
        </div>

      </div>

    </div>
  );
}


/* =========================================================
   LOAN TYPE ROW
========================================================= */

function LoanTypeRow({
  icon,
  name,
  count,
  amount,
}: {
  icon: string;
  name: string;
  count: number;
  amount: number;
}) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-white/10 last:border-0">

      <div className="flex items-center gap-3">

        <div className="text-2xl">
          {icon}
        </div>

        <div>

          <p className="font-medium">
            {name}
          </p>

          <p className="text-xs text-gray-500">
            {count} applications
          </p>

        </div>

      </div>

      <p className="font-semibold text-cyan-400">
        ₹{amount.toLocaleString("en-IN")}
      </p>

    </div>
  );
}


/* =========================================================
   STATUS ROW
========================================================= */

function StatusRow({
  label,
  count,
}: {
  label: string;
  count: number;
}) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-white/10">

      <span className="text-gray-300">
        {label}
      </span>

      <span className="font-bold text-lg">
        {count}
      </span>

    </div>
  );
}