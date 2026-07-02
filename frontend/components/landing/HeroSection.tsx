"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck, Lock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-[#050816]">
      {/* Background Glow */}
      <div className="absolute inset-0">
        <div className="absolute left-1/2 top-20 h-96 w-96 -translate-x-1/2 rounded-full bg-cyan-500/20 blur-[140px]" />
      </div>

      <div className="relative mx-auto flex min-h-[90vh] max-w-7xl items-center px-6 py-20">

        <div className="grid w-full items-center gap-16 lg:grid-cols-2">

          {/* Left */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-2 text-sm text-cyan-300">
              <Sparkles size={16} />
              AI + FHE Powered Lending
            </span>

            <h1 className="mt-8 text-5xl font-extrabold leading-tight text-white md:text-7xl">
              Borrow Money
              <br />
              <span className="text-cyan-400">
                Without Exposing
              </span>
              <br />
              Your Financial Data
            </h1>

            <p className="mt-8 max-w-xl text-lg leading-8 text-zinc-400">
              TrustFi combines Artificial Intelligence, Fully Homomorphic
              Encryption and Blockchain to provide secure
              undercollateralized lending while keeping your personal
              financial information completely private.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <Button
                size="lg"
                className="rounded-xl bg-cyan-500 px-8 text-black hover:bg-cyan-400"
                asChild
              >
                <Link href="/connect">
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>

              {/* <Button
                size="lg"
                variant="outline"
                className="rounded-xl border-cyan-500/30 text-white hover:bg-cyan-500/10"
              >
                Watch Demo
              </Button> */}
            </div>

            <div className="mt-12 flex flex-wrap gap-8 text-sm text-zinc-400">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-cyan-400" />
                Privacy First
              </div>

              <div className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-cyan-400" />
                End-to-End Encryption
              </div>
            </div>
          </motion.div>

          {/* Right */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="rounded-3xl border border-cyan-500/20 bg-white/5 p-8 backdrop-blur-xl">

              <h2 className="text-2xl font-bold text-white">
                AI Credit Decision
              </h2>

              <div className="mt-8 space-y-6">

                <div className="rounded-xl bg-black/40 p-5">
                  <p className="text-sm text-zinc-400">
                    Monthly Income
                  </p>

                  <h3 className="mt-2 text-3xl font-bold text-cyan-400">
                    ₹72,500
                  </h3>
                </div>

                <div className="rounded-xl bg-black/40 p-5">
                  <p className="text-sm text-zinc-400">
                    AI Credit Score
                  </p>

                  <h3 className="mt-2 text-3xl font-bold text-green-400">
                    91 / 100
                  </h3>
                </div>

                <div className="rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 p-5">

                  <p className="text-sm text-white/80">
                    Eligible Loan Amount
                  </p>

                  <h3 className="mt-2 text-4xl font-bold text-white">
                    ₹5,00,000
                  </h3>

                </div>

              </div>
            </div>
          </motion.div>

        </div>

      </div>
    </section>
  );
}