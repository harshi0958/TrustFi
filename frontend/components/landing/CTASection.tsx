
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function CTASection() {
  return (
    <section className="bg-[#050816] py-24">
      <div className="mx-auto max-w-5xl rounded-3xl border border-cyan-500/20 bg-cyan-500/10 p-8 text-center sm:p-12">
        <h2 className="text-3xl font-bold text-white sm:text-5xl">
          Ready to Borrow Privately?
        </h2>

        <p className="mt-6 text-zinc-300">
          Explore AI-powered lending with privacy-focused financial technology.
          Register or sign in to get started.
        </p>

        <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
          <Link href="/register">
            <Button className="w-full bg-cyan-500 text-black hover:bg-cyan-400 sm:w-auto">
              Apply for a Loan
            </Button>
          </Link>

          <Link href="/login">
            <Button
              variant="outline"
              className="w-full border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/10 sm:w-auto"
            >
              Already Registered? Login
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
