"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { registerAdmin } from "@/lib/api";

export default function AdminRegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const handleRegister = async () => {
    setError("");

    if (!name.trim()) {
      setError(
        "Please enter admin name."
      );
      return;
    }

    if (!email.trim()) {
      setError(
        "Please enter admin email."
      );
      return;
    }

    try {
      setLoading(true);

      await registerAdmin(
        name.trim(),
        email.trim()
      );

      alert(
        "Admin registered successfully ✅"
      );

      router.push(
        "/admin/login"
      );
    } catch (err: any) {
      console.error(
        "Admin Registration Error:",
        err
      );

      setError(
        err.message ||
          "Admin registration failed."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050816] flex items-center justify-center p-6 text-white">

      <div className="w-full max-w-md rounded-2xl border border-cyan-500/20 bg-zinc-900 p-8 shadow-2xl">

        {/* Logo / Header */}

        <div className="text-center">

          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-500/10 text-3xl">
            🔐
          </div>

          <h1 className="mt-5 text-3xl font-bold">
            TrustFi Admin
          </h1>

          <p className="mt-2 text-zinc-400">
            Create Admin Account
          </p>

        </div>

        {/* Form */}

        <div className="mt-8 space-y-5">

          {/* Name */}

          <div>

            <label className="text-sm font-medium text-zinc-300">
              Admin Name
            </label>

            <input
              type="text"
              value={name}
              onChange={(e) =>
                setName(e.target.value)
              }
              placeholder="Enter admin name"
              className="mt-2 w-full rounded-lg border border-white/10 bg-black/30 px-4 py-3 text-white placeholder:text-zinc-600 outline-none transition focus:border-cyan-400"
            />

          </div>

          {/* Email */}

          <div>

            <label className="text-sm font-medium text-zinc-300">
              Registered Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              placeholder="admin@example.com"
              className="mt-2 w-full rounded-lg border border-white/10 bg-black/30 px-4 py-3 text-white placeholder:text-zinc-600 outline-none transition focus:border-cyan-400"
            />

            <p className="mt-2 text-xs text-zinc-500">
              OTP login codes will be sent to
              this email.
            </p>

          </div>

          {/* Error */}

          {error && (
            <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3">

              <p className="text-sm text-red-400">
                {error}
              </p>

            </div>
          )}

          {/* Register Button */}

          <button
            type="button"
            onClick={handleRegister}
            disabled={loading}
            className="w-full rounded-lg bg-cyan-500 py-3 font-semibold text-black transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
          >

            {loading
              ? "Creating Account..."
              : "Register Admin"}

          </button>

          {/* Login */}

          <button
            type="button"
            onClick={() =>
              router.push(
                "/admin/login"
              )
            }
            className="w-full text-sm text-zinc-400 transition hover:text-cyan-400"
          >
            Already registered?{" "}
            <span className="font-medium">
              Login
            </span>
          </button>

        </div>

        {/* Security Information */}

        <div className="mt-8 rounded-xl border border-white/10 bg-black/20 p-4">

          <div className="flex gap-3">

            <span className="text-lg">
              🛡️
            </span>

            <div>

              <p className="text-sm font-medium text-zinc-300">
                Secure Admin Access
              </p>

              <p className="mt-1 text-xs leading-5 text-zinc-500">
                Admin login requires a
                one-time 4-digit OTP sent
                to the registered email.
              </p>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}