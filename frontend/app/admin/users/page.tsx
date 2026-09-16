"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import AdminSidebar from "@/components/admin/AdminSidebar";

const API = process.env.NEXT_PUBLIC_API_URL;

export default function AdminUsersPage() {
  const router = useRouter();

  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<any>(null);

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
  // LOAD USERS
  // =========================

  const loadUsers = async () => {
    try {
      setLoading(true);

      const res = await fetch(`${API}/api/admin/users`);

      if (!res.ok) {
        throw new Error("Failed to load users");
      }

      const data = await res.json();

      setUsers(data.users || []);
    } catch (error) {
      console.error("Users error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadUsers();
    }
  }, [isAuthenticated]);

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
              👥
            </div>

            <p className="text-gray-400">
              Loading users...
            </p>

          </div>

        </div>

      </div>
    );
  }

  // =========================
  // SEARCH
  // =========================

  const filteredUsers = users.filter((user) => {

    const searchText = search.toLowerCase();

    return (
      user.fullName?.toLowerCase().includes(searchText) ||
      user.email?.toLowerCase().includes(searchText) ||
      user.phone?.includes(search)
    );

  });

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
                User Management
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

              <h2 className="text-4xl font-bold">
                Users
              </h2>

              <p className="text-gray-400 mt-2">
                Manage registered applicants and their loan activity.
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
                placeholder="Search name, email or phone..."
                className="w-full md:w-80 rounded-xl border border-white/10 bg-white/[0.04] py-3 pl-11 pr-4 text-sm text-white placeholder-gray-600 outline-none focus:border-cyan-500/40"
              />

            </div>

          </div>


          {/* ================= USER COUNT ================= */}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">

              <p className="text-sm text-gray-500">
                Total Users
              </p>

              <p className="text-3xl font-bold mt-2">
                {users.length}
              </p>

            </div>


            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">

              <p className="text-sm text-gray-500">
                Showing
              </p>

              <p className="text-3xl font-bold mt-2">
                {filteredUsers.length}
              </p>

            </div>


            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">

              <p className="text-sm text-gray-500">
                Active Search
              </p>

              <p className="text-lg font-semibold mt-3 text-cyan-400">
                {search ? `"${search}"` : "All Users"}
              </p>

            </div>

          </div>


          {/* ================= USERS TABLE ================= */}

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden">

            <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between">

              <div>

                <h3 className="text-xl font-bold">
                  All Users
                </h3>

                <p className="text-sm text-gray-500 mt-1">
                  Unique applicants registered on TrustFi
                </p>

              </div>

              <button
                onClick={loadUsers}
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
                      User
                    </th>

                    <th className="px-6 py-4 text-left text-xs uppercase tracking-wider text-gray-500">
                      Phone
                    </th>

                    <th className="px-6 py-4 text-center text-xs uppercase tracking-wider text-gray-500">
                      Applications
                    </th>

                    <th className="px-6 py-4 text-center text-xs uppercase tracking-wider text-gray-500">
                      Requested Amount
                    </th>

                    <th className="px-6 py-4 text-center text-xs uppercase tracking-wider text-gray-500">
                      Loan Status
                    </th>

                    <th className="px-6 py-4 text-center text-xs uppercase tracking-wider text-gray-500">
                      Action
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {filteredUsers.map((user: any) => (

                    <tr
                      key={user.email}
                      className="border-t border-white/10 hover:bg-cyan-500/[0.03] transition"
                    >

                      {/* USER */}

                      <td className="px-6 py-5">

                        <div className="flex items-center gap-3">

                          <div className="h-10 w-10 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 font-bold">
                            {user.fullName?.charAt(0)?.toUpperCase() || "U"}
                          </div>

                          <div>

                            <p className="font-semibold">
                              {user.fullName}
                            </p>

                            <p className="text-xs text-gray-500 mt-1">
                              {user.email}
                            </p>

                          </div>

                        </div>

                      </td>


                      {/* PHONE */}

                      <td className="px-6 py-5 text-sm text-gray-300">
                        {user.phone}
                      </td>


                      {/* APPLICATIONS */}

                      <td className="px-6 py-5 text-center">

                        <span className="rounded-lg bg-cyan-500/10 px-3 py-1.5 text-cyan-400 font-semibold">
                          {user.totalApplications}
                        </span>

                      </td>


                      {/* AMOUNT */}

                      <td className="px-6 py-5 text-center font-semibold">
                        ₹{user.totalRequestedAmount.toLocaleString("en-IN")}
                      </td>


                      {/* STATUS */}

                      <td className="px-6 py-5">

                        <div className="flex justify-center gap-2 flex-wrap">

                          {user.approvedLoans > 0 && (
                            <span className="rounded-full bg-green-500/10 px-2.5 py-1 text-xs text-green-400">
                              ✓ {user.approvedLoans}
                            </span>
                          )}

                          {user.pendingLoans > 0 && (
                            <span className="rounded-full bg-yellow-500/10 px-2.5 py-1 text-xs text-yellow-400">
                              ⏳ {user.pendingLoans}
                            </span>
                          )}

                          {user.rejectedLoans > 0 && (
                            <span className="rounded-full bg-red-500/10 px-2.5 py-1 text-xs text-red-400">
                              ✕ {user.rejectedLoans}
                            </span>
                          )}

                        </div>

                      </td>


                      {/* ACTION */}

                      <td className="px-6 py-5 text-center">

                        <button
  onClick={() => setSelectedUser(user)}
  className="rounded-lg border border-cyan-500/20 bg-cyan-500/10 px-4 py-2 text-xs text-cyan-400 hover:bg-cyan-500 hover:text-white transition"
>
  View Details
</button>

                      </td>

                    </tr>

                  ))}


                  {/* EMPTY */}

                  {filteredUsers.length === 0 && (

                    <tr>

                      <td
                        colSpan={6}
                        className="px-6 py-16 text-center"
                      >

                        <div className="text-4xl mb-3">
                          🔍
                        </div>

                        <p className="font-semibold">
                          No users found
                        </p>

                        <p className="text-sm text-gray-500 mt-1">
                          Try searching with a different name or email.
                        </p>

                      </td>

                    </tr>

                  )}

                </tbody>

              </table>

            </div>

          </div>

        </main>
                {/* ================= USER DETAILS MODAL ================= */}

        {selectedUser && (

          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">

            <div className="w-full max-w-5xl max-h-[90vh] overflow-hidden rounded-2xl border border-white/10 bg-[#0b0f22] shadow-2xl">

              {/* ================= MODAL HEADER ================= */}

              <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">

                <div className="flex items-center gap-4">

                  <div className="flex h-12 w-12 items-center justify-center rounded-full border border-cyan-500/20 bg-cyan-500/10 text-lg font-bold text-cyan-400">
                    {selectedUser.fullName?.charAt(0)?.toUpperCase() || "U"}
                  </div>

                  <div>

                    <h3 className="text-xl font-bold">
                      {selectedUser.fullName}
                    </h3>

                    <p className="text-sm text-gray-500">
                      {selectedUser.email}
                    </p>

                  </div>

                </div>

                <button
                  onClick={() => setSelectedUser(null)}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-gray-400 hover:bg-white/10 hover:text-white transition"
                >
                  ✕
                </button>

              </div>


              {/* ================= MODAL BODY ================= */}

              <div className="max-h-[calc(90vh-90px)] overflow-y-auto p-6">

                {/* USER INFORMATION */}

                <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">

                  <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">

                    <p className="text-xs uppercase tracking-wider text-gray-500">
                      Email
                    </p>

                    <p className="mt-2 text-sm font-medium">
                      {selectedUser.email}
                    </p>

                  </div>


                  <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">

                    <p className="text-xs uppercase tracking-wider text-gray-500">
                      Phone
                    </p>

                    <p className="mt-2 text-sm font-medium">
                      {selectedUser.phone}
                    </p>

                  </div>

                </div>


                {/* ================= USER STATS ================= */}

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">

                  <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">

                    <p className="text-xs text-gray-500">
                      Applications
                    </p>

                    <p className="mt-2 text-2xl font-bold">
                      {selectedUser.totalApplications}
                    </p>

                  </div>


                  <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">

                    <p className="text-xs text-gray-500">
                      Requested Amount
                    </p>

                    <p className="mt-2 text-xl font-bold text-cyan-400">
                      ₹{selectedUser.totalRequestedAmount.toLocaleString("en-IN")}
                    </p>

                  </div>


                  <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">

                    <p className="text-xs text-gray-500">
                      Approved
                    </p>

                    <p className="mt-2 text-2xl font-bold text-green-400">
                      {selectedUser.approvedLoans}
                    </p>

                  </div>


                  <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">

                    <p className="text-xs text-gray-500">
                      Rejected
                    </p>

                    <p className="mt-2 text-2xl font-bold text-red-400">
                      {selectedUser.rejectedLoans}
                    </p>

                  </div>

                </div>


                {/* ================= LOAN HISTORY ================= */}

                <div>

                  <div className="mb-4">

                    <h4 className="text-lg font-bold">
                      Loan History
                    </h4>

                    <p className="text-sm text-gray-500">
                      Complete application history of this user
                    </p>

                  </div>


                  <div className="overflow-x-auto rounded-xl border border-white/10">

                    <table className="min-w-full">

                      <thead className="bg-white/[0.03]">

                        <tr>

                          <th className="px-5 py-4 text-left text-xs uppercase tracking-wider text-gray-500">
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
                            Status
                          </th>

                        </tr>

                      </thead>


                      <tbody>

                        {selectedUser.applications?.map((loan: any) => (

                          <tr
                            key={loan.id}
                            className="border-t border-white/10 hover:bg-white/[0.02]"
                          >

                            {/* TYPE */}

                            <td className="px-5 py-4">

                              <span className="rounded-lg border border-cyan-500/20 bg-cyan-500/10 px-3 py-1.5 text-xs text-cyan-400">
                                {loan.loanType}
                              </span>

                            </td>


                            {/* AMOUNT */}

                            <td className="px-5 py-4 text-center font-semibold">
                              ₹{loan.loanAmount.toLocaleString("en-IN")}
                            </td>


                            {/* CREDIT */}

                            <td className="px-5 py-4 text-center">

                              <span className="font-bold text-cyan-400">
                                {loan.creditScore}
                              </span>

                            </td>


                            {/* RISK */}

                            <td className="px-5 py-4 text-center">

                              <span
                                className={`rounded-full px-3 py-1 text-xs ${
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

                            <td className="px-5 py-4 text-center text-sm">
                              {loan.interestRate}%
                            </td>


                            {/* STATUS */}

                            <td className="px-5 py-4 text-center">

                              {loan.status === "APPROVED" ? (

                                <span className="text-sm text-green-400">
                                  ✅ Approved
                                </span>

                              ) : loan.status === "REJECTED" ? (

                                <span className="text-sm text-red-400">
                                  ❌ Rejected
                                </span>

                              ) : (

                                <span className="text-sm text-yellow-400">
                                  ⏳ Pending
                                </span>

                              )}

                            </td>

                          </tr>

                        ))}

                      </tbody>

                    </table>

                  </div>

                </div>

              </div>

            </div>

          </div>

        )}

      </div>

    </div>
  );
}

