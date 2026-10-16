
"use client";

import Link from "next/link";
import { ShieldCheck, Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const closeMenu = () => setMobileOpen(false);

  return (
    <motion.header
      initial={{ y: -30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="sticky top-0 z-50 border-b border-cyan-500/10 bg-[#09090B]/90 backdrop-blur-xl"
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 md:h-20 md:px-6">
        <Link
          href="/"
          onClick={closeMenu}
          className="flex items-center gap-3"
        >
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

        <nav className="hidden items-center gap-8 text-sm md:flex">
          <Link href="/" className="text-zinc-300 hover:text-cyan-400">
            Home
          </Link>
          <Link href="/#features" className="text-zinc-300 hover:text-cyan-400">
            Features
          </Link>
          <Link href="/#how" className="text-zinc-300 hover:text-cyan-400">
            How It Works
          </Link>
          <Link href="/#faq" className="text-zinc-300 hover:text-cyan-400">
            FAQ
          </Link>
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/login"
            className="rounded-xl px-4 py-2 text-sm font-medium text-zinc-300 transition hover:text-cyan-400"
          >
            Login
          </Link>

          <Link href="/register">
            <Button className="rounded-xl bg-cyan-500 px-6 text-black hover:bg-cyan-400">
              Register
            </Button>
          </Link>
        </div>

        <button
          type="button"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((open) => !open)}
          className="rounded-lg p-2 text-white hover:bg-zinc-800 md:hidden"
        >
          {mobileOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden border-t border-cyan-500/10 bg-[#09090B] md:hidden"
          >
            <nav className="flex flex-col gap-5 px-5 py-6">
              <Link href="/" onClick={closeMenu} className="text-zinc-300 hover:text-cyan-400">
                Home
              </Link>
              <Link href="/#features" onClick={closeMenu} className="text-zinc-300 hover:text-cyan-400">
                Features
              </Link>
              <Link href="/#how" onClick={closeMenu} className="text-zinc-300 hover:text-cyan-400">
                How It Works
              </Link>
              <Link href="/#faq" onClick={closeMenu} className="text-zinc-300 hover:text-cyan-400">
                FAQ
              </Link>

              <div className="flex gap-3 pt-2">
                <Link href="/login" onClick={closeMenu} className="flex-1">
                  <Button variant="outline" className="w-full border-cyan-500/30 text-cyan-300">
                    Login
                  </Button>
                </Link>
                <Link href="/register" onClick={closeMenu} className="flex-1">
                  <Button className="w-full bg-cyan-500 text-black hover:bg-cyan-400">
                    Register
                  </Button>
                </Link>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
