"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ShieldCheck,
  Mail,
  Phone,
  User,
  ArrowRight,
  BarChart3,
  LockKeyhole,
  UserPlus,
  Sparkles,
} from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL;

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.replace(/\s+/g, "");

    if (!cleanName || !cleanEmail || !cleanPhone) {
      setError("Please fill in all required fields.");
      return;
    }

    const normalizedPhone = cleanPhone.startsWith("+91")
      ? cleanPhone
      : `+91${cleanPhone}`;

    const phoneRegex = /^\+91[6-9]\d{9}$/;

    if (!phoneRegex.test(normalizedPhone)) {
      setError("Please enter a valid 10-digit Indian mobile number.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: cleanName,
          email: cleanEmail,
          phone: normalizedPhone,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed.");
      }

      setSuccess("Account created successfully! Redirecting to login...");

      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#030712] text-white">

      {/* ================= BACKGROUND ================= */}

      {/* Main gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(6,182,212,0.10),transparent_35%),radial-gradient(circle_at_10%_80%,rgba(14,165,233,0.12),transparent_35%),radial-gradient(circle_at_90%_70%,rgba(6,182,212,0.10),transparent_35%)]" />

      {/* Grid */}
      <div
        className="absolute inset-0 opacity-[0.16]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)",
          backgroundSize: "70px 70px",
        }}
      />

      {/* Left glow */}
      <div className="absolute -left-40 top-1/3 h-[500px] w-[500px] rounded-full bg-cyan-500/10 blur-[120px]" />

      {/* Right glow */}
      <div className="absolute -right-40 top-1/2 h-[500px] w-[500px] rounded-full bg-blue-500/10 blur-[120px]" />

      {/* Curved light shapes */}
      <div className="absolute -left-40 bottom-[-180px] h-[450px] w-[850px] rotate-[-12deg] rounded-[50%] border border-cyan-400/10 bg-gradient-to-t from-cyan-500/[0.06] to-transparent blur-[1px]" />

      <div className="absolute -right-40 bottom-[-180px] h-[450px] w-[850px] rotate-[12deg] rounded-[50%] border border-cyan-400/10 bg-gradient-to-t from-cyan-500/[0.06] to-transparent" />

      {/* Stars */}
      <div className="absolute left-[25%] top-[22%] h-1 w-1 rounded-full bg-cyan-300 shadow-[0_0_12px_4px_rgba(34,211,238,0.45)]" />
      <div className="absolute right-[25%] top-[27%] h-1 w-1 rounded-full bg-cyan-300 shadow-[0_0_12px_4px_rgba(34,211,238,0.45)]" />
      <div className="absolute left-[20%] top-[60%] h-1 w-1 rounded-full bg-cyan-300 shadow-[0_0_12px_4px_rgba(34,211,238,0.45)]" />
      <div className="absolute right-[28%] top-[63%] h-1 w-1 rounded-full bg-cyan-300 shadow-[0_0_12px_4px_rgba(34,211,238,0.45)]" />

      {/* ================= NAVBAR ================= */}

      <div className="relative z-20 flex items-center justify-between px-6 py-6 md:px-12">

        {/* Logo */}
        <div className="flex items-center gap-3">

          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-400/10 shadow-[0_0_30px_rgba(34,211,238,0.12)]">
            <ShieldCheck
              size={25}
              className="text-cyan-400"
            />
          </div>

          <div>
            <h1 className="text-xl font-bold tracking-tight">
              <span className="text-cyan-400">Trust</span>Fi
            </h1>

            <p className="text-[11px] text-gray-500">
              Private Finance. Real Possibilities.
            </p>
          </div>

        </div>

        {/* Login */}
        <div className="hidden items-center gap-3 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2.5 backdrop-blur-xl sm:flex">

          <span className="text-sm text-gray-400">
            Already have an account?
          </span>

          <Link
            href="/login"
            className="flex items-center gap-2 rounded-full bg-cyan-400/10 px-4 py-2 text-sm font-medium text-cyan-400 transition hover:bg-cyan-400/20"
          >
            Login
            <ArrowRight size={15} />
          </Link>

        </div>

      </div>

      {/* ================= MAIN ================= */}

      <div className="relative z-10 mx-auto max-w-7xl px-5 pb-12 pt-4">

        {/* Heading */}

        <div className="mb-8 text-center">

          <div className="mb-3 flex items-center justify-center gap-3 text-[10px] font-medium uppercase tracking-[0.5em] text-gray-500">
            <span>Secure</span>
            <span className="text-cyan-400">•</span>
            <span>Private</span>
            <span className="text-cyan-400">•</span>
            <span>Transparent</span>
          </div>

          <h2 className="text-4xl font-bold tracking-tight md:text-5xl">
            Join the Future of{" "}
            <span className="text-cyan-400">
              Lending
            </span>
          </h2>

          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-gray-400 md:text-base">
            Create your account and unlock a smarter,
            more secure way to access financial opportunities.
          </p>

        </div>

        {/* ================= CONTENT GRID ================= */}

        <div className="grid items-center gap-10 lg:grid-cols-[1fr_560px_1fr]">

          {/* ================= LEFT CARD ================= */}

          <div className="hidden lg:block">

            <div className="relative rounded-3xl border border-cyan-400/20 bg-[#071225]/70 p-6 shadow-[0_0_60px_rgba(6,182,212,0.07)] backdrop-blur-xl">

              <div className="absolute -inset-px rounded-3xl bg-gradient-to-r from-cyan-400/10 to-transparent opacity-50" />

              <div className="relative">

                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10">
                  <BarChart3
                    size={28}
                    className="text-cyan-400"
                  />
                </div>

                <h3 className="text-xl font-semibold">
                  Smarter Loans
                </h3>

                <p className="mt-2 text-sm leading-6 text-gray-400">
                  AI-powered eligibility assessment
                  designed to make lending faster
                  and more accessible.
                </p>

                <div className="mt-6 flex items-center gap-2 text-xs text-cyan-400">
                  <Sparkles size={14} />
                  AI-powered decisioning
                </div>

              </div>

            </div>

            {/* Decorative text */}

            <div className="mt-14 px-5">

              <p className="font-serif text-4xl italic text-cyan-100/40">
                Finance
              </p>

              <p className="-mt-2 ml-10 font-serif text-4xl italic text-cyan-100/40">
                with Trust
              </p>

              <div className="ml-12 mt-2 h-[2px] w-32 bg-gradient-to-r from-cyan-400/60 to-transparent" />

            </div>

          </div>

          {/* ================= REGISTER CARD ================= */}

          <div className="relative">

            {/* Glow */}
            <div className="absolute -inset-3 rounded-[35px] bg-cyan-400/[0.04] blur-2xl" />

            <div className="relative rounded-[28px] border border-cyan-400/20 bg-[#07101f]/90 p-7 shadow-[0_20px_80px_rgba(0,0,0,0.45)] backdrop-blur-2xl md:p-8">

              {/* top highlight */}
              <div className="absolute left-1/2 top-0 h-px w-1/2 -translate-x-1/2 bg-gradient-to-r from-transparent via-cyan-400/70 to-transparent" />

              {/* Header */}

              <div className="mb-6 flex items-start justify-between">

                <div>

                  <h3 className="text-2xl font-bold">
                    Create Your Account
                  </h3>

                  <p className="mt-2 text-sm text-gray-500">
                    Get started with TrustFi in just a few steps.
                  </p>

                </div>

                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-400/10">
                  <UserPlus
                    size={23}
                    className="text-cyan-400"
                  />
                </div>

              </div>

              <form
                onSubmit={handleRegister}
                className="space-y-5"
              >

                {/* NAME */}

                <div>

                  <label className="mb-2 block text-sm font-medium text-gray-300">
                    Full Name
                  </label>

                  <div className="relative">

                    <User
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                    />

                    <input
                      type="text"
                      value={name}
                      onChange={(e) =>
                        setName(e.target.value)
                      }
                      placeholder="Enter your full name"
                      disabled={loading}
                      className="w-full rounded-xl border border-white/10 bg-white/[0.045] py-3.5 pl-11 pr-4 text-white placeholder:text-gray-600 outline-none transition-all focus:border-cyan-400/50 focus:bg-cyan-400/[0.035] focus:shadow-[0_0_25px_rgba(34,211,238,0.07)]"
                    />

                  </div>

                </div>

                {/* EMAIL */}

                <div>

                  <label className="mb-2 block text-sm font-medium text-gray-300">
                    Email Address
                  </label>

                  <div className="relative">

                    <Mail
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                    />

                    <input
                      type="email"
                      value={email}
                      onChange={(e) =>
                        setEmail(e.target.value)
                      }
                      placeholder="you@example.com"
                      disabled={loading}
                      className="w-full rounded-xl border border-white/10 bg-white/[0.045] py-3.5 pl-11 pr-4 text-white placeholder:text-gray-600 outline-none transition-all focus:border-cyan-400/50 focus:bg-cyan-400/[0.035] focus:shadow-[0_0_25px_rgba(34,211,238,0.07)]"
                    />

                  </div>

                </div>

                {/* PHONE */}

                <div>

                  <label className="mb-2 block text-sm font-medium text-gray-300">
                    Mobile Number
                  </label>

                  <div className="relative">

                    <Phone
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                    />

                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) =>
                        setPhone(e.target.value)
                      }
                      placeholder="9876543210"
                      maxLength={13}
                      disabled={loading}
                      className="w-full rounded-xl border border-white/10 bg-white/[0.045] py-3.5 pl-11 pr-4 text-white placeholder:text-gray-600 outline-none transition-all focus:border-cyan-400/50 focus:bg-cyan-400/[0.035] focus:shadow-[0_0_25px_rgba(34,211,238,0.07)]"
                    />

                  </div>

                  <p className="mt-2 text-xs text-gray-500">
                    We'll use this number for secure OTP login.
                  </p>

                </div>

                {/* ERROR */}

                {error && (
                  <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3">
                    <p className="text-sm text-red-400">
                      {error}
                    </p>
                  </div>
                )}

                {/* SUCCESS */}

                {success && (
                  <div className="rounded-xl border border-green-500/20 bg-green-500/10 px-4 py-3">
                    <p className="text-sm text-green-400">
                      {success}
                    </p>
                  </div>
                )}

                {/* BUTTON */}

                <button
                  type="submit"
                  disabled={loading}
                  className="group flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-400 py-3.5 font-semibold text-black shadow-[0_0_25px_rgba(34,211,238,0.12)] transition-all hover:bg-cyan-300 hover:shadow-[0_0_35px_rgba(34,211,238,0.22)] disabled:cursor-not-allowed disabled:opacity-50"
                >

                  {loading ? (
                    "Creating Account..."
                  ) : (
                    <>
                      Create Account

                      <ArrowRight
                        size={18}
                        className="transition-transform group-hover:translate-x-1"
                      />
                    </>
                  )}

                </button>

              </form>

              {/* Divider */}

              <div className="my-6 flex items-center gap-4">

                <div className="h-px flex-1 bg-white/10" />

                <span className="text-xs text-gray-600">
                  OR
                </span>

                <div className="h-px flex-1 bg-white/10" />

              </div>

              {/* Login */}

              <div className="text-center">

                <p className="text-sm text-gray-500">
                  Already have an account?
                </p>

                <Link
                  href="/login"
                  className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-cyan-400 transition hover:text-cyan-300"
                >
                  Login to TrustFi
                  <ArrowRight size={15} />
                </Link>

              </div>

              {/* Security */}

              <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-600">

                <ShieldCheck size={14} />

                <span>
                  Your information is securely protected
                </span>

              </div>

            </div>

          </div>

          {/* ================= RIGHT CARD ================= */}

          <div className="hidden lg:block">

            <div className="relative overflow-hidden rounded-3xl border border-cyan-400/20 bg-[#071225]/70 p-6 shadow-[0_0_60px_rgba(6,182,212,0.07)] backdrop-blur-xl">

              <div className="relative">

                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10">
                  <LockKeyhole
                    size={27}
                    className="text-cyan-400"
                  />
                </div>

                <h3 className="text-xl font-semibold">
                  Your Data, Your Privacy
                </h3>

                <p className="mt-2 text-sm leading-6 text-gray-400">
                  Your financial information is protected
                  using advanced encryption and blockchain
                  technology.
                </p>

                <div className="mt-6 flex items-center gap-2 text-xs text-cyan-400">
                  <ShieldCheck size={14} />
                  Privacy-first architecture
                </div>

              </div>

            </div>

            {/* Shield */}

            <div className="relative mt-10 flex justify-center">

              <div className="absolute top-10 h-40 w-40 rounded-full bg-cyan-400/10 blur-3xl" />

              <div className="relative">

                <div className="flex h-40 w-40 items-center justify-center rounded-[35px] border border-cyan-400/20 bg-gradient-to-br from-cyan-400/10 to-blue-500/5 shadow-[0_0_60px_rgba(34,211,238,0.10)]">

                  <div className="flex h-28 w-28 items-center justify-center rounded-[28px] border border-cyan-400/20 bg-[#06101f]">

                    <ShieldCheck
                      size={62}
                      strokeWidth={1.3}
                      className="text-cyan-400 drop-shadow-[0_0_12px_rgba(34,211,238,0.45)]"
                    />

                  </div>

                </div>

                {/* Orbit */}
                <div className="absolute -inset-5 rounded-[45%] border border-cyan-400/10 rotate-[-18deg]" />

              </div>

            </div>

            <p className="mt-7 text-center text-[10px] tracking-[0.45em] text-gray-600">
              BUILDING A MORE INCLUSIVE TOMORROW
            </p>

          </div>

        </div>

      </div>

      {/* Mobile bottom login */}

      <div className="relative z-20 pb-8 text-center sm:hidden">

        <p className="text-sm text-gray-500">
          Already have an account?
        </p>

        <Link
          href="/login"
          className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-cyan-400"
        >
          Login to TrustFi
          <ArrowRight size={15} />
        </Link>

      </div>

    </main>
  );
}