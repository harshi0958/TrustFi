"use client";

import { usePathname, useRouter } from "next/navigation";

export default function AdminSidebar() {
  const router = useRouter();
  const pathname = usePathname();

  const menuItems = [
    {
      name: "Dashboard",
      icon: "📊",
      path: "/admin",
    },
    {
      name: "Users",
      icon: "👥",
      path: "/admin/users",
    },
    {
      name: "All Loans",
      icon: "📋",
      path: "/admin/loans",
    },
    {
      name: "Approvals",
      icon: "✅",
      path: "/admin/approvals",
    },
  ];

  const logout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminEmail");
    localStorage.removeItem("adminName");

    router.replace("/admin/login");
  };

  return (
    <aside className="fixed left-0 top-0 z-50 h-screen w-64 border-r border-white/10 bg-[#080b1d]">

      {/* LOGO */}

      <div className="border-b border-white/10 px-6 py-6">

        <h1 className="text-2xl font-bold">
          <span className="text-cyan-400">
            Trust
          </span>
          Fi
        </h1>

        <p className="mt-1 text-xs tracking-widest text-gray-500">
          ADMIN PANEL
        </p>

      </div>


      {/* NAVIGATION */}

      <nav className="px-4 py-6">

        <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-gray-600">
          Management
        </p>

        <div className="space-y-2">

          {menuItems.map((item) => {

            const active =
              pathname === item.path;

            return (
              <button
                key={item.path}
                onClick={() => router.push(item.path)}
                className={`w-full rounded-xl px-4 py-3 text-left transition flex items-center gap-3 ${
                  active
                    ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                    : "text-gray-400 hover:bg-white/[0.04] hover:text-white"
                }`}
              >

                <span className="text-lg">
                  {item.icon}
                </span>

                <span className="text-sm font-medium">
                  {item.name}
                </span>

              </button>
            );

          })}

        </div>

      </nav>


      {/* BOTTOM */}

      <div className="absolute bottom-0 left-0 right-0 border-t border-white/10 p-4">

        <div className="mb-3 rounded-xl bg-white/[0.03] px-4 py-3">

          <p className="text-sm font-semibold text-white">
            {typeof window !== "undefined"
              ? localStorage.getItem("adminName") || "Admin"
              : "Admin"}
          </p>

          <p className="mt-1 text-xs text-gray-500">
            Administrator
          </p>

        </div>


        <button
          onClick={logout}
          className="w-full rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-400 transition hover:bg-red-500 hover:text-white"
        >
          🚪 Logout
        </button>

      </div>

    </aside>
  );
}