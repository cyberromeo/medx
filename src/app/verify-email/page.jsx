"use client";

import { useState, useEffect, useCallback } from "react";
import { auth } from "@/lib/firebase";
import {
  onAuthStateChanged,
  sendEmailVerification,
  reload,
  signOut,
} from "firebase/auth";
import { useRouter } from "next/navigation";
import { emailVerifyActionCodeSettings } from "@/lib/auth-action-settings";
import { motion, AnimatePresence } from "framer-motion";
import {
  MailCheck,
  RefreshCw,
  Loader2,
  CheckCircle2,
  ArrowLeft,
  Send,
  LogOut,
} from "lucide-react";

export default function VerifyEmailPage() {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (!firebaseUser) {
        router.replace("/login");
        return;
      }
      if (firebaseUser.emailVerified) {
        setVerified(true);
        setTimeout(() => router.replace("/dashboard"), 1500);
      }
      setUser(firebaseUser);
      setChecking(false);
    });
    return () => unsubscribe();
  }, [router]);

  // Cooldown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((c) => c - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleResend = async () => {
    if (cooldown > 0 || !user) return;
    setResending(true);
    setError("");
    setResent(false);
    try {
      await sendEmailVerification(user, emailVerifyActionCodeSettings);
      setResent(true);
      setCooldown(60);
      setTimeout(() => setResent(false), 4000);
    } catch (err) {
      console.error(err);
      if (err.code === "auth/too-many-requests") {
        setError("Too many requests. Please wait a few minutes before trying again.");
        setCooldown(120);
      } else {
        setError("Failed to send verification email. Please try again.");
      }
    } finally {
      setResending(false);
    }
  };

  const handleCheckVerification = useCallback(async () => {
    if (!user || verifying) return;
    setVerifying(true);
    setError("");
    try {
      await reload(user);
      if (user.emailVerified) {
        setVerified(true);
        setTimeout(() => router.replace("/dashboard"), 1500);
      } else {
        setError("Email not yet verified. Please check your inbox and click the verification link.");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to check verification status.");
    } finally {
      setVerifying(false);
    }
  }, [user, verifying, router]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.replace("/login");
    } catch {
      /* noop */
    }
  };

  if (checking) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#f0f0f0]">
        <Loader2 size={24} className="animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f0f0f0] p-4">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="rounded-[2rem] border border-[rgba(30,50,90,0.05)] bg-white p-8 shadow-[0_4px_24px_rgba(0,0,0,0.04)] sm:p-10">
          {/* Header */}
          <div className="mb-8 text-center">
            <AnimatePresence mode="wait">
              {verified ? (
                <motion.div
                  key="verified"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 shadow-md"
                >
                  <CheckCircle2 size={28} className="text-emerald-600" />
                </motion.div>
              ) : (
                <motion.div
                  key="unverified"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 shadow-md"
                >
                  <MailCheck size={28} className="text-blue-600" />
                </motion.div>
              )}
            </AnimatePresence>

            <h1 className="mb-2 text-2xl font-bold tracking-tight text-gray-900">
              {verified ? "Email Verified!" : "Verify Your Email"}
            </h1>
            <p className="text-sm text-gray-500">
              {verified ? (
                "Redirecting you to the dashboard..."
              ) : (
                <>
                  We sent a verification link to{" "}
                  <span className="font-semibold text-gray-900">
                    {user?.email}
                  </span>
                </>
              )}
            </p>
          </div>

          {!verified && (
            <>
              {/* Instructions */}
              <div className="mb-6 rounded-xl border border-[rgba(30,50,90,0.06)] bg-gray-50 p-4">
                <div className="space-y-2.5 text-xs text-gray-500">
                  <div className="flex items-start gap-2.5">
                    <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-gray-200 text-[9px] font-bold text-gray-600">
                      1
                    </span>
                    <span>Check your email inbox (and spam folder)</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-gray-200 text-[9px] font-bold text-gray-600">
                      2
                    </span>
                    <span>Click the verification link in the email</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-gray-200 text-[9px] font-bold text-gray-600">
                      3
                    </span>
                    <span>
                      Come back here and click{" "}
                      <strong className="text-gray-700">"I've Verified"</strong>
                    </span>
                  </div>
                </div>
              </div>

              {/* Error / Success */}
              <AnimatePresence>
                {error && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-4 rounded-xl bg-red-50 p-3 text-center text-xs font-medium text-red-500"
                  >
                    {error}
                  </motion.p>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {resent && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-4 rounded-xl bg-emerald-50 p-3 text-center text-xs font-medium text-emerald-600"
                  >
                    Verification email sent! Check your inbox.
                  </motion.p>
                )}
              </AnimatePresence>

              {/* Actions */}
              <div className="flex flex-col gap-3">
                <button
                  onClick={handleCheckVerification}
                  disabled={verifying}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-gray-900 py-3.5 text-sm font-semibold text-white transition-all hover:bg-gray-800 disabled:opacity-50"
                >
                  {verifying ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <RefreshCw size={16} />
                  )}
                  {verifying ? "Checking..." : "I've Verified"}
                </button>

                <button
                  onClick={handleResend}
                  disabled={resending || cooldown > 0}
                  className="flex w-full items-center justify-center gap-2 rounded-full border border-[rgba(30,50,90,0.1)] bg-white py-3.5 text-sm font-semibold text-gray-700 transition-all hover:bg-gray-50 disabled:opacity-50"
                >
                  {resending ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Send size={14} />
                  )}
                  {cooldown > 0
                    ? `Resend in ${cooldown}s`
                    : resending
                      ? "Sending..."
                      : "Resend Verification Email"}
                </button>
              </div>

              {/* Bottom actions */}
              <div className="mt-6 flex items-center justify-between border-t border-[rgba(30,50,90,0.06)] pt-4">
                <button
                  onClick={() => router.push("/login")}
                  className="flex items-center gap-1 text-xs font-medium text-gray-400 transition-colors hover:text-gray-700"
                >
                  <ArrowLeft size={12} />
                  Back to Login
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1 text-xs font-medium text-gray-400 transition-colors hover:text-red-500"
                >
                  <LogOut size={12} />
                  Sign Out
                </button>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
