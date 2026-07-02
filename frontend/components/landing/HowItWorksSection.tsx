"use client";

import {
  Wallet,
  FileCheck,
  BrainCircuit,
  ShieldCheck,
  BadgeCheck,
} from "lucide-react";

const steps = [
  {
    icon: Wallet,
    title: "Connect Wallet",
    desc: "Securely connect your Web3 wallet.",
  },
  {
    icon: FileCheck,
    title: "Upload Documents",
    desc: "Salary slips, Aadhaar, PAN & Bank Statement.",
  },
  {
    icon: BrainCircuit,
    title: "AI Verification",
    desc: "AI evaluates your financial profile.",
  },
  {
    icon: ShieldCheck,
    title: "FHE Encryption",
    desc: "Data remains encrypted during processing.",
  },
  {
    icon: BadgeCheck,
    title: "Loan Approved",
    desc: "Receive your confidential credit line.",
  },
];

export default function HowItWorksSection() {
  return (
    <section id="how" className="bg-[#050816] py-24">
      <div className="mx-auto max-w-7xl px-6">

        <h2 className="text-center text-5xl font-bold text-white">
          How TrustFi Works
        </h2>

        <p className="mt-5 text-center text-zinc-400">
          Complete your loan application in five secure steps.
        </p>

        <div className="mt-20 grid gap-8 lg:grid-cols-5">
          {steps.map((step, index) => {
            const Icon = step.icon;

            return (
              <div
                key={index}
                className="rounded-3xl border border-cyan-500/20 bg-white/5 p-8 text-center"
              >
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-cyan-500/10">
                  <Icon className="h-8 w-8 text-cyan-400" />
                </div>

                <h3 className="mt-8 text-xl font-semibold text-white">
                  {step.title}
                </h3>

                <p className="mt-4 text-zinc-400">
                  {step.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}