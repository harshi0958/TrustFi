"use client";

import { useWalletStore } from "@/store/walletStore";

export default function SettingsPage() {
  const { wallet } = useWalletStore();

  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-bold text-white">
        Settings
      </h1>

      {/* Wallet */}
      <div className="rounded-2xl border border-white/10 bg-zinc-900 p-8">
        <h2 className="text-xl font-bold text-white">
          Connected Wallet
        </h2>

        <p className="mt-4 rounded-xl bg-cyan-500/10 p-4 text-cyan-400 break-all">
          {wallet || "Wallet Not Connected"}
        </p>
      </div>

      {/* Theme */}
      <div className="rounded-2xl border border-white/10 bg-zinc-900 p-8">
        <h2 className="text-xl font-bold text-white">
          Theme
        </h2>

        <p className="mt-4 text-zinc-400">
          Dark Mode Enabled 🌙
        </p>
      </div>

      {/* Version */}
      <div className="rounded-2xl border border-white/10 bg-zinc-900 p-8">
        <h2 className="text-xl font-bold text-white">
          Version
        </h2>

        <p className="mt-3 text-zinc-400">
          TrustFi v1.0
        </p>
      </div>
    </div>
  );
}