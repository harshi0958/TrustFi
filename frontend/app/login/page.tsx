"use client";
    import { useRouter } from "next/navigation";
    import { useState } from "react";
    import Link from "next/link";
    import {
    ShieldCheck,
    Phone,
    ArrowRight,
    LockKeyhole,
    UserPlus,
    Sparkles,
    } from "lucide-react";

    const API = process.env.NEXT_PUBLIC_API_URL;

    export default function LoginPage() {
        const router = useRouter();
    const [phone, setPhone] = useState("");
    const [otp, setOtp] = useState("");
    const [otpSent, setOtpSent] = useState(false);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const handleSendOTP = async () => {

        setError("");
        setMessage("");

        const cleanPhone = phone.replace(/\s+/g, "");

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

        const response = await fetch(`${API}/api/auth/send-otp`, {
            method: "POST",
            headers: {
            "Content-Type": "application/json",
            },
            body: JSON.stringify({
            phone: normalizedPhone,
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
            data.message || "Failed to send OTP."
            );
        }

        console.log("OTP Request Response:", data);

        setOtpSent(true);
        setOtp("");
        setMessage(
      "OTP sent successfully. Please check the backend terminal for the test OTP."
    );

        } catch (err: any) {
        console.error("Send OTP Error:", err);

        setError(
            err.message || "Unable to send OTP. Please try again."
        );
        } finally {
        setLoading(false);
        }
    };

    const handleVerifyOTP = async () => {

        setError("");
        setMessage("");

        const cleanPhone = phone.replace(/\s+/g, "");

        const normalizedPhone = cleanPhone.startsWith("+91")
        ? cleanPhone
        : `+91${cleanPhone}`;

        const cleanOTP = otp.trim();

        if (!/^\d{6}$/.test(cleanOTP)) {
        setError("Please enter a valid 6-digit OTP.");
        return;
        }

        try {
        setLoading(true);

        const response = await fetch(`${API}/api/auth/verify-otp`, {
            method: "POST",
            headers: {
            "Content-Type": "application/json",
            },
            body: JSON.stringify({
            phone: normalizedPhone,
            otp: cleanOTP,
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
            data.message || "OTP verification failed."
            );
        }

        console.log("OTP Verification Response:", data);

        setMessage(
            `Welcome back, ${data.user?.name || "User"}! OTP verified successfully.`
        );

        setOtp("");

        setTimeout(() => {
          router.push("/dashboard");
        }, 1000);
        } catch (err: any) {
        console.error("Verify OTP Error:", err);

        setError(
            err.message || "Unable to verify OTP. Please try again."
        );
        } finally {
        setLoading(false);
        }
    };


    return (
        <main className="relative min-h-screen overflow-hidden bg-[#030712] text-white">

        {/* ================= BACKGROUND ================= */}

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

        {/* Curved shapes */}
        <div className="absolute -left-40 bottom-[-180px] h-[450px] w-[850px] rotate-[-12deg] rounded-[50%] border border-cyan-400/10 bg-gradient-to-t from-cyan-500/[0.06] to-transparent" />

        <div className="absolute -right-40 bottom-[-180px] h-[450px] w-[850px] rotate-[12deg] rounded-[50%] border border-cyan-400/10 bg-gradient-to-t from-cyan-500/[0.06] to-transparent" />

        {/* Stars */}
        <div className="absolute left-[25%] top-[22%] h-1 w-1 rounded-full bg-cyan-300 shadow-[0_0_12px_4px_rgba(34,211,238,0.45)]" />

        <div className="absolute right-[25%] top-[27%] h-1 w-1 rounded-full bg-cyan-300 shadow-[0_0_12px_4px_rgba(34,211,238,0.45)]" />

        <div className="absolute left-[20%] top-[60%] h-1 w-1 rounded-full bg-cyan-300 shadow-[0_0_12px_4px_rgba(34,211,238,0.45)]" />

        <div className="absolute right-[28%] top-[63%] h-1 w-1 rounded-full bg-cyan-300 shadow-[0_0_12px_4px_rgba(34,211,238,0.45)]" />

        {/* ================= NAVBAR ================= */}

        <div className="relative z-20 flex items-center justify-between px-6 py-6 md:px-12">

            {/* Logo */}

            <Link
            href="/"
            className="flex items-center gap-3"
            >

            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-400/10 shadow-[0_0_30px_rgba(34,211,238,0.12)]">

                <ShieldCheck
                size={25}
                className="text-cyan-400"
                />

            </div>

            <div>

                <h1 className="text-xl font-bold tracking-tight">

                <span className="text-cyan-400">
                    Trust
                </span>
                Fi

                </h1>

                <p className="text-[11px] text-gray-500">
                Private Finance. Real Possibilities.
                </p>

            </div>

            </Link>

            {/* Register */}

            <div className="hidden items-center gap-3 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2.5 backdrop-blur-xl sm:flex">

            <span className="text-sm text-gray-400">
                New to TrustFi?
            </span>

            <Link
                href="/register"
                className="flex items-center gap-2 rounded-full bg-cyan-400/10 px-4 py-2 text-sm font-medium text-cyan-400 transition hover:bg-cyan-400/20"
            >

                Register

                <ArrowRight size={15} />

            </Link>

            </div>

        </div>

        {/* ================= MAIN ================= */}

        <div className="relative z-10 mx-auto max-w-7xl px-5 pb-12 pt-8">

            {/* Heading */}

            <div className="mb-9 text-center">

            <div className="mb-3 flex items-center justify-center gap-3 text-[10px] font-medium uppercase tracking-[0.5em] text-gray-500">

                <span>Secure</span>

                <span className="text-cyan-400">
                •
                </span>

                <span>Private</span>

                <span className="text-cyan-400">
                •
                </span>

                <span>Simple</span>

            </div>

            <h2 className="text-4xl font-bold tracking-tight md:text-5xl">

                Welcome{" "}

                <span className="text-cyan-400">
                Back
                </span>

            </h2>

            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-gray-400 md:text-base">

                Login securely with your registered mobile
                number and continue your TrustFi journey.

            </p>

            </div>

            {/* ================= CONTENT GRID ================= */}

            <div className="grid items-center gap-10 lg:grid-cols-[1fr_520px_1fr]">

            {/* ================= LEFT ================= */}

            <div className="hidden lg:block">

                <div className="relative rounded-3xl border border-cyan-400/20 bg-[#071225]/70 p-6 shadow-[0_0_60px_rgba(6,182,212,0.07)] backdrop-blur-xl">

                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10">

                    <LockKeyhole
                    size={28}
                    className="text-cyan-400"
                    />

                </div>

                <h3 className="text-xl font-semibold">
                    Passwordless Login
                </h3>

                <p className="mt-2 text-sm leading-6 text-gray-400">

                    No passwords to remember. TrustFi uses
                    secure mobile OTP authentication to
                    protect your account.

                </p>

                <div className="mt-6 flex items-center gap-2 text-xs text-cyan-400">

                    <ShieldCheck size={14} />

                    Secure OTP authentication

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

            {/* ================= LOGIN CARD ================= */}

            <div className="relative">

                <div className="absolute -inset-3 rounded-[35px] bg-cyan-400/[0.04] blur-2xl" />

                <div className="relative rounded-[28px] border border-cyan-400/20 bg-[#07101f]/90 p-7 shadow-[0_20px_80px_rgba(0,0,0,0.45)] backdrop-blur-2xl md:p-8">

                {/* Top highlight */}

                <div className="absolute left-1/2 top-0 h-px w-1/2 -translate-x-1/2 bg-gradient-to-r from-transparent via-cyan-400/70 to-transparent" />

                {/* Header */}

                <div className="mb-7 flex items-start justify-between">

                    <div>

                    <h3 className="text-2xl font-bold">
                        Login to TrustFi
                    </h3>

                    <p className="mt-2 text-sm text-gray-500">
                        Enter your registered mobile number.
                    </p>

                    </div>

                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-400/10">

                    <LockKeyhole
                        size={23}
                        className="text-cyan-400"
                    />

                    </div>

                </div>

                {/* ================= FORM ================= */}

                <div>
                    <div className="space-y-5"></div>

                    {/* Mobile */}

                    <div>
                    <label className="mb-2 block text-sm font-medium text-gray-300">
                        Registered Mobile Number
                    </label>

                    <div className="relative">
                        <Phone
                        size={18}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                        />

                        <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="9876543210"
                        maxLength={13}
                        disabled={loading || otpSent}
                        className="w-full rounded-xl border border-white/10 bg-white/[0.045] py-3.5 pl-11 pr-4 text-white placeholder:text-gray-600 outline-none transition-all focus:border-cyan-400/50 focus:bg-cyan-400/[0.035] focus:shadow-[0_0_25px_rgba(34,211,238,0.07)] disabled:cursor-not-allowed disabled:opacity-60"
                        />
                    </div>

                    <p className="mt-2 text-xs text-gray-500">
                        We'll send a secure OTP to this number.
                    </p>
                    </div>

                    {/* OTP */}

                    {otpSent && (
                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-300">
                        Enter OTP
                        </label>

                        <input
                        type="text"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        value={otp}
                        onChange={(e) =>
                            setOtp(
                            e.target.value.replace(/\D/g, "").slice(0, 6)
                            )
                        }
                        placeholder="Enter 6-digit OTP"
                        maxLength={6}
                        disabled={loading}
                        className="w-full rounded-xl border border-cyan-400/20 bg-white/[0.045] px-4 py-3.5 text-center text-lg font-semibold tracking-[0.5em] text-white placeholder:text-gray-600 placeholder:tracking-normal outline-none transition-all focus:border-cyan-400/50 focus:bg-cyan-400/[0.035] focus:shadow-[0_0_25px_rgba(34,211,238,0.07)] disabled:cursor-not-allowed disabled:opacity-60"
                        />

                        <p className="mt-2 text-xs text-gray-500">
                        Enter the 6-digit OTP shown in the backend terminal.
                        </p>
                    </div>
                    )}

                    {/* Success */}

                    {message && (
                    <div className="rounded-xl border border-green-500/20 bg-green-500/10 px-4 py-3">
                        <p className="text-sm leading-5 text-green-400">
                        {message}
                        </p>
                    </div>
                    )}

                    {/* Error */}

                    {error && (
                    <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3">
                        <p className="text-sm leading-5 text-red-400">
                        {error}
                        </p>
                    </div>
                    )}

                    {/* Action */}

                    {!otpSent ? (
                    <button
                        type="button"
                        onClick={handleSendOTP}
                        disabled={loading}
                        className="group flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-400 py-3.5 font-semibold text-black shadow-[0_0_25px_rgba(34,211,238,0.12)] transition-all hover:bg-cyan-300 hover:shadow-[0_0_35px_rgba(34,211,238,0.22)] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {loading ? (
                        "Sending OTP..."
                        ) : (
                        <>
                            Send OTP

                            <ArrowRight
                            size={18}
                            className="transition-transform group-hover:translate-x-1"
                            />
                        </>
                        )}
                    </button>
                    ) : (
                    <button
                        type="button"
                        onClick={handleVerifyOTP}
                        disabled={loading || otp.length !== 6}
                        className="group flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-400 py-3.5 font-semibold text-black shadow-[0_0_25px_rgba(34,211,238,0.12)] transition-all hover:bg-cyan-300 hover:shadow-[0_0_35px_rgba(34,211,238,0.22)] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {loading ? (
                        "Verifying OTP..."
                        ) : (
                        <>
                            Verify OTP

                            <ShieldCheck
                            size={18}
                            className="transition-transform group-hover:scale-110"
                            />
                        </>
                        )}
                    </button>
                    )}

                    {/* Change Number */}

                    {otpSent && !loading && (
                    <button
                        type="button"
                        onClick={() => {
                        setOtpSent(false);
                        setOtp("");
                        setError("");
                        setMessage("");
                        }}
                        className="w-full text-center text-xs text-gray-500 transition hover:text-cyan-400"
                    >
                        ← Change mobile number
                    </button>
                    )}

                </div>

                {/* Divider */}

                <div className="my-6 flex items-center gap-4">

                    <div className="h-px flex-1 bg-white/10" />

                    <span className="text-xs text-gray-600">
                    OR
                    </span>

                    <div className="h-px flex-1 bg-white/10" />

                </div>

                {/* Register */}

                <div className="text-center">

                    <p className="text-sm text-gray-500">
                    Don't have a TrustFi account?
                    </p>

                    <Link
                    href="/register"
                    className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-cyan-400 transition hover:text-cyan-300"
                    >

                    <UserPlus size={15} />

                    Create an Account

                    <ArrowRight size={15} />

                    </Link>

                </div>

                {/* Security */}

                <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-600">

                    <ShieldCheck size={14} />

                    <span>
                    Secure OTP-based authentication
                    </span>

                </div>

                </div>

            </div>

            {/* ================= RIGHT ================= */}

            <div className="hidden lg:block">

                <div className="relative rounded-3xl border border-cyan-400/20 bg-[#071225]/70 p-6 shadow-[0_0_60px_rgba(6,182,212,0.07)] backdrop-blur-xl">

                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10">

                    <Sparkles
                    size={27}
                    className="text-cyan-400"
                    />

                </div>

                <h3 className="text-xl font-semibold">
                    Your Financial Journey
                </h3>

                <p className="mt-2 text-sm leading-6 text-gray-400">

                    Access your loan applications, AI
                    eligibility insights and secure lending
                    facilities from one place.

                </p>

                <div className="mt-6 flex items-center gap-2 text-xs text-cyan-400">

                    <Sparkles size={14} />

                    Personal • Property • Gold

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

                    <div className="absolute -inset-5 rounded-[45%] border border-cyan-400/10 rotate-[-18deg]" />

                </div>

                </div>

                <p className="mt-7 text-center text-[10px] tracking-[0.45em] text-gray-600">
                PRIVATE • SECURE • TRUSTED
                </p>

            </div>

            </div>

        </div>

        {/* ================= MOBILE REGISTER ================= */}

        <div className="relative z-20 pb-8 text-center sm:hidden">

            <p className="text-sm text-gray-500">
            Don't have a TrustFi account?
            </p>

            <Link
            href="/register"
            className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-cyan-400"
            >

            Create an Account

            <ArrowRight size={15} />

            </Link>

        </div>

        </main>
    );
    }