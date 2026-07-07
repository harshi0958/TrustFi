"use client";

import Link from "next/link";
import { useEffect } from "react";
import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useWalletStore } from "@/store/walletStore";
import { connectWallet } from "@/lib/wallet";


export default function Navbar() {
 const {
  wallet,
  connect,
  loadWallet,
} = useWalletStore();

useEffect(() => {

  loadWallet();

}, []);
  return (
    <motion.header
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="sticky top-0 z-50 border-b border-cyan-500/10 bg-background/60 backdrop-blur-xl"
    >
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <div className="rounded-xl bg-cyan-500 p-2 text-black">
            <ShieldCheck className="h-6 w-6" />
          </div>

          <div>
            <h1 className="text-xl font-bold text-white">
              Trust<span className="text-cyan-400">Fi</span>
            </h1>

            <p className="text-xs text-zinc-400">
              Confidential Lending
            </p>
          </div>
        </Link>

        {/* Menu */}
        <nav className="hidden items-center gap-8 text-sm md:flex">
          <Link href="/" className="text-zinc-300 hover:text-cyan-400">
            Home
          </Link>

          <Link href="#features" className="text-zinc-300 hover:text-cyan-400">
            Features
          </Link>

          <Link href="#how" className="text-zinc-300 hover:text-cyan-400">
            How It Works
          </Link>

          <Link href="#faq" className="text-zinc-300 hover:text-cyan-400">
            FAQ
          </Link>
        </nav>

        {/* Button */}
        <Button
  className="rounded-xl bg-cyan-500 px-6 text-black hover:bg-cyan-400"
  onClick={async () => {
    const address = await connectWallet();

    if (address) {
      connect(address);
    }
  }}
>
  {wallet
    ? `${wallet.slice(0, 6)}...${wallet.slice(-4)}`
    : "Connect Wallet"}
</Button>
      </div>
    </motion.header>
  );
}