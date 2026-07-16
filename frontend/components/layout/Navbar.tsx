"use client";

import Link from "next/link";
import { ShieldCheck, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
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

const [mobileOpen, setMobileOpen] = useState(false);
useEffect(() => {

  loadWallet();

}, []);
  return (
    <motion.header
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="sticky top-0 z-50 border-b border-cyan-500/10 bg-[#09090B]/60 backdrop-blur-xl"
    >
      <div className="mx-auto flex h-16 md:h-20 max-w-7xl items-center justify-between px-6">
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
        {mobileOpen && (
  <motion.div
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0 }}
    className="md:hidden border-t border-cyan-500/10 bg-[#09090B]/95 backdrop-blur-xl"
  >
    <div className="flex flex-col gap-5 px-4 sm:px-6 py-6">

      <Link href="/" onClick={() => setMobileOpen(false)}>
        Home
      </Link>

      <Link href="#features" onClick={() => setMobileOpen(false)}>
        Features
      </Link>

      <Link href="#how" onClick={() => setMobileOpen(false)}>
        How It Works
      </Link>

      <Link href="#faq" onClick={() => setMobileOpen(false)}>
        FAQ
      </Link>

      <Button
        className="w-full rounded-xl bg-cyan-500 text-black"
        onClick={async () => {
          const address = await connectWallet();

          if (address) connect(address);

          setMobileOpen(false);
        }}
      >
        {wallet
          ? `${wallet.slice(0, 6)}...${wallet.slice(-4)}`
          : "Connect Wallet"}
      </Button>

    </div>
  </motion.div>
)}
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
  <button
  onClick={() => setMobileOpen(!mobileOpen)}
  className="md:hidden text-white"
>
  {mobileOpen ? (
    <X className="w-7 h-7" />
  ) : (
    <Menu className="w-7 h-7" />
  )}
</button>
}
