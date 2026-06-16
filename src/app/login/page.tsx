"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ShieldAlert, Key, Mail, ArrowLeft, Loader2, CheckCircle2, Send } from "lucide-react";
import Logo from "@/components/Logo";

type AuthStep = "email" | "otp";

export default function Login() {
  const router = useRouter();
  const [step, setStep] = useState<AuthStep>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);
  const [success, setSuccess] = useState(false);

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Clear any existing session on mount
  useEffect(() => {
    localStorage.removeItem("nexus_auth_token");
  }, []);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  // ── Send OTP ──────────────────────────────────────────────────────
  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email.trim() || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    setIsLoading(true);
    setError("");
    setDevOtp(null);

    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to send OTP.");
        setIsLoading(false);
        return;
      }

      // In dev mode (no SMTP), the OTP is logged to the console
      if (data.dev) {
        setDevOtp("Check the terminal console for your OTP.");
      }

      setStep("otp");
      setOtp(["", "", "", "", "", ""]);
      setCountdown(60);
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // ── Verify OTP ────────────────────────────────────────────────────
  const handleVerifyOtp = useCallback(async (otpValue?: string) => {
    const code = otpValue || otp.join("");
    if (code.length !== 6) {
      setError("Please enter the complete 6-digit OTP.");
      return;
    }
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), otp: code }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Invalid OTP.");
        setIsLoading(false);
        return;
      }

      // Success!
      setSuccess(true);
      localStorage.setItem("nexus_auth_token", data.token);
      localStorage.setItem("nexus_user_email", data.email);
      setTimeout(() => router.push("/dashboard"), 800);
    } catch {
      setError("Network error. Please try again.");
      setIsLoading(false);
    }
  }, [otp, email, router]);

  // ── OTP Input Handling ────────────────────────────────────────────
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; // only digits
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    setError("");

    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all 6 digits are filled
    if (value && index === 5) {
      const fullCode = newOtp.join("");
      if (fullCode.length === 6) {
        handleVerifyOtp(fullCode);
      }
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      const newOtp = pasted.split("");
      setOtp(newOtp);
      otpRefs.current[5]?.focus();
      handleVerifyOtp(pasted);
    }
  };

  // ── Guest Login ───────────────────────────────────────────────────
  const handleGuestLogin = () => {
    setIsLoading(true);
    setTimeout(() => {
      localStorage.setItem("nexus_auth_token", "nexus-guest-session");
      router.push("/dashboard");
    }, 500);
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-slate-950 overflow-hidden font-sans">
      {/* Dynamic Cyber Grid Overlay */}
      <div className="cyberspace-grid absolute inset-0 pointer-events-none" />

      {/* Ambient glow */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md p-8 rounded-3xl border border-slate-900 bg-slate-950/40 backdrop-blur-xl shadow-2xl shadow-indigo-600/5 flex flex-col gap-6">

        {/* Header */}
        <div className="flex flex-col items-center gap-2 text-center">
          <Logo size={48} />
          <h1 className="font-orbitron font-extrabold text-xl tracking-wider text-slate-100 mt-2">
            CAREER GROWTH
          </h1>
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-widest">
            {step === "email" ? "SECURE EMAIL VERIFICATION" : "ENTER VERIFICATION CODE"}
          </p>
        </div>

        {/* Success State */}
        {success && (
          <div className="flex flex-col items-center gap-3 py-6">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 animate-pulse" />
            <p className="text-emerald-400 font-bold text-lg font-orbitron">VERIFIED</p>
            <p className="text-slate-400 text-sm">Redirecting to dashboard...</p>
          </div>
        )}

        {/* ── Step 1: Email Input ──────────────────────────────────── */}
        {!success && step === "email" && (
          <form onSubmit={handleSendOtp} className="flex flex-col gap-4">
            {error && (
              <div className="flex gap-2 items-center p-3 rounded-lg border border-red-500/20 bg-red-500/10 text-xs font-bold text-red-400">
                <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex flex-col gap-1">
              <label className="text-xs uppercase font-extrabold text-slate-400 tracking-wider">
                Gmail Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="your.email@gmail.com"
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm font-semibold focus:outline-none focus:border-indigo-500 text-slate-200 transition-all placeholder-slate-600"
                  required
                  autoFocus
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 mt-2 rounded-xl font-bold uppercase tracking-wider font-orbitron bg-indigo-600 hover:bg-indigo-500 text-slate-50 shadow-lg border border-indigo-400/30 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {isLoading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Sending OTP...</>
              ) : (
                <><Send className="w-4 h-4" /> Send OTP</>
              )}
            </button>
          </form>
        )}

        {/* ── Step 2: OTP Input ────────────────────────────────────── */}
        {!success && step === "otp" && (
          <div className="flex flex-col gap-4">
            {error && (
              <div className="flex gap-2 items-center p-3 rounded-lg border border-red-500/20 bg-red-500/10 text-xs font-bold text-red-400">
                <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {devOtp && (
              <div className="flex gap-2 items-center p-3 rounded-lg border border-amber-500/20 bg-amber-500/10 text-xs font-bold text-amber-400">
                <Key className="w-4 h-4 flex-shrink-0" />
                <span>{devOtp}</span>
              </div>
            )}

            <p className="text-center text-sm text-slate-400">
              We sent a 6-digit code to <span className="text-indigo-400 font-semibold">{email}</span>
            </p>

            {/* OTP Digit Boxes */}
            <div className="flex justify-center gap-2.5" onPaste={handleOtpPaste}>
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={el => { otpRefs.current[i] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={e => handleOtpChange(i, e.target.value)}
                  onKeyDown={e => handleOtpKeyDown(i, e)}
                  className="w-12 h-14 text-center text-xl font-bold rounded-xl border border-slate-700 bg-slate-900/80 text-cyan-300 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all font-orbitron"
                />
              ))}
            </div>

            {/* Verify Button */}
            <button
              onClick={() => handleVerifyOtp()}
              disabled={isLoading || otp.join("").length < 6}
              className="w-full py-3.5 mt-1 rounded-xl font-bold uppercase tracking-wider font-orbitron bg-indigo-600 hover:bg-indigo-500 text-slate-50 shadow-lg border border-indigo-400/30 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {isLoading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Verifying...</>
              ) : (
                <><CheckCircle2 className="w-4 h-4" /> Verify OTP</>
              )}
            </button>

            {/* Timer + Resend + Back */}
            <div className="flex items-center justify-between text-xs mt-1">
              <button
                onClick={() => { setStep("email"); setError(""); setOtp(["","","","","",""]); }}
                className="flex items-center gap-1 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3 h-3" /> Change Email
              </button>

              {countdown > 0 ? (
                <span className="text-slate-500 font-semibold">
                  Resend in <span className="text-indigo-400">{countdown}s</span>
                </span>
              ) : (
                <button
                  onClick={() => handleSendOtp()}
                  className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors cursor-pointer"
                >
                  Resend OTP
                </button>
              )}
            </div>
          </div>
        )}

        {/* Divider */}
        {!success && (
          <>
            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-slate-900"></div>
              <span className="flex-shrink mx-3 text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">OR</span>
              <div className="flex-grow border-t border-slate-900"></div>
            </div>

            {/* Guest Login */}
            <button
              onClick={handleGuestLogin}
              disabled={isLoading}
              className="w-full py-3.5 rounded-xl font-bold uppercase tracking-wider font-orbitron border border-slate-800 bg-slate-950/20 hover:bg-slate-900/40 text-cyan-400 hover:text-cyan-300 hover:border-cyan-500/40 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Key className="w-4 h-4 text-cyan-400 animate-pulse" /> Connect as Guest
            </button>
          </>
        )}
      </div>
    </div>
  );
}
