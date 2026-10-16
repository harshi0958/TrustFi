
"use client";

import { useLoanStore } from "@/store/loanStore";
import { LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Wallet,
  BrainCircuit,
  ChartCandlestick,
  FileText,
  FolderOpen,
  Bell,
  Settings,
  ShieldCheck,
} from "lucide-react";

const menuItems = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Credit Line", href: "/credit-line", icon: Wallet },
  { title: "AI Analysis", href: "/ai-analysis", icon: BrainCircuit },
  { title: "Markets", href: "/markets", icon: ChartCandlestick },
  { title: "Loan", href: "/loan", icon: FileText },
  { title: "Documents", href: "/documents", icon: FolderOpen },
  { title: "Notifications", href: "/notifications", icon: Bell },
  { title: "Settings", href: "/settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { personal } = useLoanStore();

 const handleLogout = async () => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/auth/logout`,
      {
        method: "POST",
        credentials: "include",
      }
    );

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || "Logout failed.");
    }

    router.replace("/login");
    router.refresh();
  } catch (error) {
    console.error("Logout error:", error);
    window.alert(
      "Could not confirm logout with the server. Please check your connection and try again."
    );
  }
};

  return (
    <aside className="flex h-screen w-72 flex-col border-r border-zinc-800 bg-[#09090B]">
      <div className="flex items-center gap-3 border-b border-zinc-800 p-6">
        <div className="rounded-xl bg-cyan-500 p-2">
          <ShieldCheck className="h-6 w-6 text-black" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">TrustFi</h1>
          <p className="text-xs text-zinc-500">Confidential Lending</p>
        </div>
      </div>

      <nav className="flex-1 space-y-2 overflow-y-auto p-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active =
            pathname === item.href ||
            pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 transition-all ${
                active
                  ? "bg-cyan-500 font-semibold text-black"
                  : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span>{item.title}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-zinc-800 p-4">
        <div className="rounded-xl bg-zinc-900 p-4">
          <p className="text-sm font-semibold text-white">
            {personal.fullName || "Welcome to TrustFi"}
          </p>
          <p className="mt-1 text-xs text-zinc-500">
            TrustFi Account
          </p>

          <button
            type="button"
            onClick={handleLogout}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-red-500/20 py-2 text-red-400 hover:bg-red-500/30"
          >
            <LogOut className="h-4 w-4" />
            Back to Login
          </button>
        </div>
      </div>
    </aside>
  );
}
