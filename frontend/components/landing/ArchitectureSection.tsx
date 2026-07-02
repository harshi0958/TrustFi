export default function ArchitectureSection() {
  return (
    <section
      id="ai"
      className="bg-[#050816] py-24"
    >
      <div className="mx-auto max-w-7xl px-6">

        <h2 className="text-center text-5xl font-bold text-white">
          AI + FHE Secure Architecture
        </h2>

        <p className="mt-5 text-center text-zinc-400">
          Every decision is made while keeping your financial data encrypted.
        </p>

        <div className="mt-20 flex flex-wrap items-center justify-center gap-6">

          <div className="rounded-2xl border border-cyan-500/20 bg-white/5 px-8 py-6">
            👤 User
          </div>

          <div>→</div>

          <div className="rounded-2xl border border-cyan-500/20 bg-white/5 px-8 py-6">
            📄 Upload Documents
          </div>

          <div>→</div>

          <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 px-8 py-6">
            🔐 FHE Encryption
          </div>

          <div>→</div>

          <div className="rounded-2xl border border-cyan-500/20 bg-white/5 px-8 py-6">
            🤖 AI Credit Engine
          </div>

          <div>→</div>

          <div className="rounded-2xl border border-green-500/20 bg-green-500/10 px-8 py-6">
            ✅ Loan Decision
          </div>

        </div>
      </div>
    </section>
  );
}