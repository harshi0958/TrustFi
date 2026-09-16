"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Mail,
  Clock3,
  ArrowLeft,
  RefreshCw,
} from "lucide-react";

import {
  requestAdminOTP,
  verifyAdminOTP,
} from "@/lib/api";

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");

  const [otpSent, setOtpSent] = useState(false);

  const [seconds, setSeconds] = useState(0);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const [message, setMessage] = useState("");

  /*
   * -----------------------------------------
   * OTP COUNTDOWN
   * -----------------------------------------
   */

  useEffect(() => {
    if (!otpSent || seconds <= 0) {
      return;
    }

    const timer = setInterval(() => {
      setSeconds((previous) =>
        previous > 0 ? previous - 1 : 0
      );
    }, 1000);

    return () => clearInterval(timer);
  }, [otpSent, seconds]);

  /*
   * -----------------------------------------
   * SEND OTP
   * -----------------------------------------
   */

  const sendOTP = async () => {
    setError("");
    setMessage("");

    const cleanEmail = email.trim();

    if (!cleanEmail) {
      setError(
        "Please enter your registered email."
      );
      return;
    }

    try {
      setLoading(true);

      const result =
        await requestAdminOTP(
          cleanEmail
        );

      setEmail(cleanEmail);
      setOtp("");
      setOtpSent(true);

      /*
       * Start exactly 20 seconds.
       */

      setSeconds(20);

      setMessage(
        "OTP sent successfully to your email."
      );

      console.log(
        "OTP Request Response:",
        result
      );
    } catch (err: any) {
      console.error(
        "Send OTP Error:",
        err
      );

      setError(
        err.message ||
          "Failed to send OTP."
      );
    } finally {
      setLoading(false);
    }
  };

  /*
   * -----------------------------------------
   * VERIFY OTP
   * -----------------------------------------
   */

  const verifyOTP = async () => {
    setError("");
    setMessage("");

    if (otp.length !== 4) {
      setError(
        "Please enter the complete 4-digit OTP."
      );
      return;
    }

    if (seconds <= 0) {
      setError(
        "OTP has expired. Please resend a new code."
      );
      return;
    }

    try {
      setLoading(true);

      const result =
        await verifyAdminOTP(
          email.trim(),
          otp
        );

      console.log(
        "Admin Login Response:",
        result
      );

      /*
       * Store admin session information.
       */

      localStorage.setItem(
        "adminToken",
        result.token
      );

      localStorage.setItem(
        "adminEmail",
        result.admin.email
      );

      localStorage.setItem(
        "adminName",
        result.admin.name
      );

      /*
       * Go to Admin Dashboard.
       */

      router.push("/admin");
    } catch (err: any) {
      console.error(
        "OTP Verification Error:",
        err
      );

      setError(
        err.message ||
          "Invalid OTP. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  /*
   * -----------------------------------------
   * RESEND OTP
   * -----------------------------------------
   */

  const resendOTP = async () => {
    /*
     * Resend only after current OTP expires.
     */

    if (seconds > 0 || loading) {
      return;
    }

    await sendOTP();
  };

  /*
   * -----------------------------------------
   * CHANGE EMAIL
   * -----------------------------------------
   */

  const changeEmail = () => {
    setOtpSent(false);
    setOtp("");
    setSeconds(0);
    setError("");
    setMessage("");
  };

  /*
   * -----------------------------------------
   * FORMAT TIMER
   * -----------------------------------------
   */

  const formattedSeconds =
    String(seconds).padStart(2, "0");

  /*
   * -----------------------------------------
   * UI
   * -----------------------------------------
   */

  return (
    <div className="min-h-screen bg-[#050816] flex items-center justify-center p-6 text-white">

      <div className="w-full max-w-md">

        {/* -------------------------------- */}
        {/* LOGIN CARD */}
        {/* -------------------------------- */}

        <div className="rounded-2xl border border-cyan-500/20 bg-zinc-900 p-8 shadow-2xl">

          {/* Header */}

          <div className="text-center">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-500/10">

              <ShieldCheck
                size={34}
                className="text-cyan-400"
              />

            </div>

            <h1 className="mt-5 text-3xl font-bold">
              TrustFi Admin
            </h1>

            <p className="mt-2 text-zinc-400">
              Secure Admin Login
            </p>

          </div>

          {/* -------------------------------- */}
          {/* EMAIL STEP */}
          {/* -------------------------------- */}

          {!otpSent ? (

            <div className="mt-8 space-y-5">

              <div>

                <label className="text-sm font-medium text-zinc-300">
                  Registered Email
                </label>

                <div className="relative mt-2">

                  <Mail
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
                  />

                  <input
                    type="email"
                    value={email}
                    onChange={(e) =>
                      setEmail(
                        e.target.value
                      )
                    }
                    onKeyDown={(e) => {
                      if (
                        e.key === "Enter"
                      ) {
                        sendOTP();
                      }
                    }}
                    placeholder="admin@example.com"
                    className="w-full rounded-lg border border-white/10 bg-black/30 py-3 pl-11 pr-4 text-white placeholder:text-zinc-600 outline-none transition focus:border-cyan-400"
                  />

                </div>

                <p className="mt-2 text-xs text-zinc-500">
                  Enter the email registered
                  with TrustFi Admin.
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

              {/* Send OTP */}

              <button
                type="button"
                onClick={sendOTP}
                disabled={loading}
                className="w-full rounded-lg bg-cyan-500 py-3 font-semibold text-black transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
              >

                {loading
                  ? "Sending OTP..."
                  : "Send OTP"}

              </button>

              {/* Register */}

              <button
                type="button"
                onClick={() =>
                  router.push(
                    "/admin/register"
                  )
                }
                className="w-full text-sm text-zinc-400 transition hover:text-cyan-400"
              >
                New Admin?{" "}
                <span className="font-medium">
                  Register
                </span>
              </button>

            </div>

          ) : (

            /* -------------------------------- */
            /* OTP STEP */
            /* -------------------------------- */

            <div className="mt-8 space-y-5">

              {/* Email */}

              <div className="text-center">

                <p className="text-sm text-zinc-400">
                  OTP sent to
                </p>

                <p className="mt-1 break-all font-medium text-cyan-400">
                  {email}
                </p>

              </div>

              {/* OTP Input */}

              <div>

                <label className="text-sm font-medium text-zinc-300">
                  Enter 4-Digit OTP
                </label>

                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={4}
                  value={otp}
                  onChange={(e) =>
                    setOtp(
                      e.target.value.replace(
                        /\D/g,
                        ""
                      )
                    )
                  }
                  onKeyDown={(e) => {
                    if (
                      e.key === "Enter"
                    ) {
                      verifyOTP();
                    }
                  }}
                  placeholder="••••"
                  className="mt-2 w-full rounded-lg border border-white/10 bg-black/30 px-4 py-4 text-center text-3xl font-bold tracking-[0.8rem] text-white placeholder:text-zinc-700 outline-none transition focus:border-cyan-400"
                />

              </div>

              {/* Timer */}

              <div className="flex items-center justify-center gap-2">

                <Clock3
                  size={17}
                  className={
                    seconds > 0
                      ? "text-yellow-400"
                      : "text-red-400"
                  }
                />

                {seconds > 0 ? (

                  <p className="text-sm text-yellow-400">

                    OTP expires in{" "}

                    <span className="font-bold">
                      00:{formattedSeconds}
                    </span>

                  </p>

                ) : (

                  <p className="text-sm text-red-400">
                    OTP expired
                  </p>

                )}

              </div>

              {/* Success Message */}

              {message && (
                <div className="rounded-lg border border-green-500/20 bg-green-500/10 p-3">

                  <p className="text-center text-sm text-green-400">
                    {message}
                  </p>

                </div>
              )}

              {/* Error */}

              {error && (
                <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3">

                  <p className="text-center text-sm text-red-400">
                    {error}
                  </p>

                </div>
              )}

              {/* Verify */}

              <button
                type="button"
                onClick={verifyOTP}
                disabled={
                  loading ||
                  otp.length !== 4 ||
                  seconds <= 0
                }
                className="w-full rounded-lg bg-cyan-500 py-3 font-semibold text-black transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-40"
              >

                {loading
                  ? "Verifying..."
                  : "Verify OTP & Login"}

              </button>

              {/* Resend */}

              <button
                type="button"
                onClick={resendOTP}
                disabled={
                  loading ||
                  seconds > 0
                }
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/10 py-3 text-zinc-300 transition hover:border-cyan-400 hover:text-cyan-400 disabled:cursor-not-allowed disabled:opacity-40"
              >

                <RefreshCw size={16} />

                Resend Code

              </button>

              {/* Change Email */}

              <button
                type="button"
                onClick={changeEmail}
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 text-sm text-zinc-500 transition hover:text-zinc-300"
              >

                <ArrowLeft size={15} />

                Change Email

              </button>

            </div>

          )}

        </div>

        {/* -------------------------------- */}
        {/* SECURITY INFO */}
        {/* -------------------------------- */}

        <div className="mt-5 rounded-xl border border-white/10 bg-zinc-900/60 p-4">

          <div className="flex gap-3">

            <ShieldCheck
              size={20}
              className="mt-0.5 text-cyan-400"
            />

            <div>

              <p className="text-sm font-medium text-zinc-300">
                Secure Admin Access
              </p>

              <p className="mt-1 text-xs leading-5 text-zinc-500">
                A 4-digit one-time password is
                sent to your registered email.
                Each OTP is valid for only
                20 seconds.
              </p>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}