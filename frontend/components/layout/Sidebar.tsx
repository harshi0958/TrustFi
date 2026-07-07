"use client";

import { useWalletStore } from "@/store/walletStore";
import { useLoanStore } from "@/store/loanStore";
import { LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Credit Line",
    href: "/credit-line",
    icon: Wallet,
  },
  {
    title: "AI Analysis",
    href: "/ai-analysis",
    icon: BrainCircuit,
  },
  {
    title: "Markets",
    href: "/markets",
    icon: ChartCandlestick,
  },
  {
    title: "Loan",
    href: "/loan",
    icon: FileText,
  },
  {
    title: "Documents",
    href: "/documents",
    icon: FolderOpen,
  },
  {
    title: "Notifications",
    href: "/notifications",
    icon: Bell,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  const { wallet, disconnect } = useWalletStore();
const { personal } = useLoanStore();
  return (
    <aside className="flex h-screen w-72 flex-col border-r border-zinc-800 bg-[#09090B]">
      {/* Logo */}
      <div className="flex items-center gap-3 border-b border-zinc-800 p-6">
        <div className="rounded-xl bg-cyan-500 p-2">
          <ShieldCheck className="h-6 w-6 text-black" />
        </div>

        <div>
          <h1 className="text-xl font-bold text-white">TrustFi</h1>
          <p className="text-xs text-zinc-500">
            Confidential Lending
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2 p-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 transition-all ${
                active
                  ? "bg-cyan-500 text-black font-semibold"
                  : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span>{item.title}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Card */}
     <div className="border-t border-zinc-800 p-4">

  <div className="rounded-xl bg-zinc-900 p-4">

    <p className="text-sm font-semibold text-white">
      {personal.fullName || "Welcome 👋"}
    </p>

    <p className="mt-1 text-xs text-zinc-500">
      Connected Wallet
    </p>

    <div className="mt-3 rounded-lg bg-cyan-500/10 px-3 py-2 text-xs text-cyan-400 break-all">
      {wallet
        ? `${wallet.slice(0, 6)}...${wallet.slice(-4)}`
        : "Not Connected"}
    </div>

    <button
      onClick={() => {
        disconnect();
        window.location.href = "/";
      }}
      className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-red-500/20 py-2 text-red-400 hover:bg-red-500/30"
    >
      <LogOut className="h-4 w-4" />
      Logout
    </button>

  </div>

</div>
    </aside>
  );
}