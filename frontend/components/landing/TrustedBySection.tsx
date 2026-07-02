"use client";

import { motion } from "framer-motion";

const companies = [
  "Ethereum",
  "Polygon",
  "Zama FHE",
  "Chainlink",
  "OpenAI",
  "IPFS",
];

export default function TrustedBySection() {
  return (
    <section className="border-y border-white/10 bg-[#050816] py-12">
      <div className="mx-auto max-w-7xl px-6">

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="mb-10 text-center text-sm uppercase tracking-[0.35em] text-zinc-500"
        >
          Powered By Modern Technologies
        </motion.p>

        <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-6">
          {companies.map((company) => (
            <motion.div
              whileHover={{ scale: 1.05 }}
              key={company}
              className="rounded-2xl border border-white/10 bg-white/5 py-6 text-center text-lg font-semibold text-zinc-300 backdrop-blur"
            >
              {company}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}