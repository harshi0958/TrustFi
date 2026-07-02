export default function AISidePanel() {
  return (
    <div className="space-y-5">

      <div className="rounded-2xl border border-cyan-500/20 bg-zinc-900 p-5">

        <h2 className="text-xl font-bold text-white">
          AI Assistant
        </h2>

        <p className="mt-3 text-zinc-400">
          Waiting for your documents...
        </p>

      </div>

      <div className="rounded-2xl border border-white/10 bg-zinc-900 p-5">

        <h2 className="font-bold text-white">
          Privacy Score
        </h2>

        <div className="mt-4 text-5xl font-black text-cyan-400">
          100%
        </div>

        <p className="mt-3 text-zinc-400">
          All uploaded financial data will remain encrypted using Fully Homomorphic Encryption.
        </p>

      </div>

      <div className="rounded-2xl border border-white/10 bg-zinc-900 p-5">

        <h2 className="font-bold text-white">
          Encrypted Fields
        </h2>

        <ul className="mt-4 space-y-2 text-zinc-300">

          <li>✓ Aadhaar Number</li>

          <li>✓ PAN Number</li>

          <li>✓ Salary</li>

          <li>✓ Bank Statement</li>

          <li>✓ Credit Score</li>

        </ul>

      </div>

    </div>
  );
}