
export default function SettingsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-white">Settings</h1>
        <p className="mt-2 text-zinc-400">
          Manage your TrustFi account and preferences.
        </p>
      </div>

      <section className="rounded-2xl border border-white/10 bg-zinc-900 p-8">
        <h2 className="text-xl font-bold text-white">Account</h2>
        <p className="mt-3 text-zinc-400">
          Your registered account details will be displayed here after
          authenticated account-session integration is completed.
        </p>
      </section>

      <section className="rounded-2xl border border-white/10 bg-zinc-900 p-8">
        <h2 className="text-xl font-bold text-white">Privacy & Security</h2>
        <p className="mt-3 text-zinc-400">
          TrustFi uses mobile OTP verification for account sign-in.
        </p>
        <p className="mt-2 text-sm text-zinc-500">
          Session management and account security controls are being integrated.
        </p>
      </section>

      <section className="rounded-2xl border border-white/10 bg-zinc-900 p-8">
        <h2 className="text-xl font-bold text-white">Appearance</h2>
        <p className="mt-3 text-zinc-400">Dark mode</p>
      </section>

      <section className="rounded-2xl border border-white/10 bg-zinc-900 p-8">
        <h2 className="text-xl font-bold text-white">Version</h2>
        <p className="mt-3 text-zinc-400">TrustFi v1.0</p>
      </section>
    </div>
  );
}
