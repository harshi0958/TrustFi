"use client";

import { motion } from "framer-motion";
import {
  BrainCircuit,
  ShieldCheck,
  LockKeyhole,
  Wallet,
} from "lucide-react";

const features = [
  {
    icon: BrainCircuit,
    title: "AI Credit Intelligence",
    description:
      "Advanced AI evaluates income, repayment behaviour and employment history to generate a fair credit score.",
  },
  {
    icon: LockKeyhole,
    title: "Fully Homomorphic Encryption",
    description:
      "Financial data stays encrypted throughout computation. No lender ever sees your raw documents.",
  },
  {
    icon: ShieldCheck,
    title: "Privacy First",
    description:
      "Your salary slips, Aadhaar, PAN and bank statements remain confidential at every step.",
  },
  {
    icon: Wallet,
    title: "Blockchain Lending",
    description:
      "Transparent smart contracts automate loan approvals, repayments and trustless transactions.",
  },
];

export default function FeaturesSection() {
  return (
    <section
      id="features"
      className="bg-[#050816] py-24"
    >
      <div className="mx-auto max-w-7xl px-6">

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="text-cyan-400 font-semibold uppercase tracking-widest">
            FEATURES
          </p>

          <h2 className="mt-4 text-5xl font-bold text-white">
            Built for Secure Digital Lending
          </h2>

          <p className="mt-6 max-w-3xl text-zinc-400 text-lg">
            TrustFi combines Artificial Intelligence, Blockchain and
            Fully Homomorphic Encryption to make undercollateralized
            lending secure, transparent and private.
          </p>
        </motion.div>

        <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-4">

          {features.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <motion.div
                key={index}
                whileHover={{ y: -8 }}
                className="rounded-3xl border border-cyan-500/20 bg-white/5 p-8 backdrop-blur-xl transition"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-500/10">
                  <Icon className="h-8 w-8 text-cyan-400" />
                </div>

                <h3 className="mt-8 text-2xl font-semibold text-white">
                  {feature.title}
                </h3>

                <p className="mt-4 text-zinc-400 leading-7">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}