import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function CTASection() {
  return (
    <section className="py-24 bg-[#050816]">
      <div className="mx-auto max-w-5xl rounded-3xl border border-cyan-500/20 bg-cyan-500/10 p-12 text-center">

        <h2 className="text-5xl font-bold text-white">
          Ready to Borrow Privately?
        </h2>

        <p className="mt-6 text-zinc-300">
          Join the future of confidential decentralized lending powered by AI
          and Fully Homomorphic Encryption.
        </p>

        <Link href="/connect">
          <Button className="mt-10 bg-cyan-500 text-black hover:bg-cyan-400">
            Connect Wallet
          </Button>
        </Link>

      </div>
    </section>
  );
}