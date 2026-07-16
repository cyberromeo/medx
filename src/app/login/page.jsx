"use client";

import { useState, useEffect } from "react";
import { auth } from "@/lib/firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail,
  onAuthStateChanged,
} from "firebase/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { activateSingleDeviceSession } from "@/lib/session-security";
import { passwordResetActionCodeSettings } from "@/lib/auth-action-settings";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Lock,
  User,
  ArrowRight,
  AlertCircle,
  Loader2,
  Stethoscope,
  ArrowLeft,
  KeyRound,
} from "lucide-react";
import Image from "next/image";

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [activationCode, setActivationCode] = useState("");
  const [error, setError] = useState("");
  const [resetMessage, setResetMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);
  const router = useRouter();

  // Skip login page if already authenticated
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.replace("/dashboard");
      } else {
        setAuthChecking(false);
      }
    });
    return () => unsubscribe();
  }, [router]);

  // Show loading while checking auth
  if (authChecking) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#f0f0f0]">
        <Loader2 size={24} className="animate-spin text-gray-400" />
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setResetMessage("");

    if (!isLogin && password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // Validate activation code for sign up
    if (!isLogin) {
      if (!activationCode.trim()) {
        setError("Activation code is required to create an account");
        return;
      }
    }

    setLoading(true);

    try {
      // If signing up, validate activation code first
      if (!isLogin) {
        const validateRes = await fetch("/api/activation-codes/validate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code: activationCode.trim() }),
        });
        const validateData = await validateRes.json();
        if (!validateRes.ok || !validateData.valid) {
          setError(validateData.error || "Invalid activation code");
          setLoading(false);
          return;
        }
      }

      let userCredential;
      if (isLogin) {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      } else {
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const displayName = name.trim();
        await updateProfile(userCredential.user, { displayName });

        // Redeem the activation code after successful account creation
        try {
          await fetch("/api/activation-codes/redeem", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              code: activationCode.trim(),
              userId: userCredential.user.uid,
              email: email,
            }),
          });
        } catch (redeemErr) {
          console.error("Failed to redeem activation code:", redeemErr);
        }
      }

      const userId = userCredential.user.uid;
      await activateSingleDeviceSession(userId);
      router.push("/dashboard");
    } catch (err) {
      console.error(err);
      if (
        isLogin &&
        (err.code === "auth/invalid-credential" || err.code === "auth/wrong-password")
      ) {
        setError("Incorrect email or password. If you've forgotten your password, click 'Forgot Password?' above.");
      } else if (err.code === "auth/user-not-found") {
        setError("No account found with this email.");
      } else if (err.code === "auth/too-many-requests") {
        setError("Too many failed attempts. Please try again later.");
      } else {
        setError(err.message || "Authentication failed");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError("Please enter your email address to reset your password.");
      return;
    }
    setError("");
    setResetMessage("");
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email, passwordResetActionCodeSettings);
      setResetMessage("Password reset email sent! Check your inbox.");
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to send password reset email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f0f0f0]">
      {/* --- DESKTOP VIEW --- */}
      <div className="hidden lg:block">
        <div className="container mx-auto flex min-h-screen items-center justify-center px-6">
          <div className="grid w-full max-w-5xl grid-cols-1 gap-8 lg:grid-cols-2">
            {/* Brand Panel */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="hidden flex-col justify-between rounded-[2rem] border border-[rgba(30,50,90,0.05)] bg-white p-8 shadow-[0_4px_24px_rgba(0,0,0,0.04)] lg:flex lg:p-10"
            >
              <div>
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-900 shadow-sm">
                  <Stethoscope size={28} className="text-white" />
                </div>
                <h1 className="mb-3 text-3xl font-bold tracking-tight text-gray-900">
                  Welcome to MedX
                </h1>
                <p className="mb-6 font-medium text-gray-500">
                  Focused, cinematic medical learning for FMGE preparation. Track
                  your progress, stay consistent, and build mastery.
                </p>
                <div className="space-y-3">
                  <div className="rounded-2xl border border-[rgba(30,50,90,0.05)] bg-gray-50 p-4">
                    <p className="text-xs font-medium text-gray-400">Feature</p>
                    <p className="font-semibold text-gray-900">
                      Smart Progress Tracking
                    </p>
                  </div>
                  <div className="rounded-2xl border border-[rgba(30,50,90,0.05)] bg-gray-50 p-4">
                    <p className="text-xs font-medium text-gray-400">Community</p>
                    <p className="font-semibold text-gray-900">
                      Live Discuss support
                    </p>
                  </div>
                </div>
              </div>
              <p className="text-xs font-medium text-gray-400">
                &copy; 2026 MedX
              </p>
            </motion.div>

            {/* Auth Panel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="rounded-[2rem] border border-[rgba(30,50,90,0.05)] bg-white p-8 shadow-[0_4px_24px_rgba(0,0,0,0.04)] lg:p-10"
            >
              <div className="mb-8 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 shadow-sm">
                  <Lock size={24} className="text-gray-700" />
                </div>
                <h2 className="mb-2 text-2xl font-bold text-gray-900">
                  {isLogin ? "Welcome back" : "Create account"}
                </h2>
                <p className="text-sm text-gray-500">
                  {isLogin
                    ? "Enter your details to access your library"
                    : "Start your medical journey today"}
                </p>
              </div>

              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="mb-6 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-600"
                  >
                    <AlertCircle size={14} />
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {resetMessage && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="mb-6 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-medium text-emerald-600"
                  >
                    <AlertCircle size={14} />
                    {resetMessage}
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <AnimatePresence mode="popLayout">
                  {!isLogin && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="flex flex-col gap-4"
                    >
                      <div>
                        <label className="ml-1 text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                          Full Name
                        </label>
                        <div className="relative mt-1">
                          <User
                            size={16}
                            className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-gray-400"
                          />
                          <input
                            type="text"
                            placeholder="John Doe"
                            className="input input-with-icon"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required={!isLogin}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="ml-1 text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                          Activation Code
                        </label>
                        <div className="relative mt-1">
                          <KeyRound
                            size={16}
                            className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-gray-400"
                          />
                          <input
                            type="text"
                            placeholder="XXXX-XXXX"
                            className="input input-with-icon font-mono tracking-widest uppercase"
                            value={activationCode}
                            onChange={(e) => setActivationCode(e.target.value.toUpperCase())}
                            required={!isLogin}
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div>
                  <label className="ml-1 text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                    Email
                  </label>
                  <div className="relative mt-1">
                    <Mail
                      size={16}
                      className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      type="email"
                      placeholder="name@example.com"
                      className="input input-with-icon"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div>
                  <div className="ml-1 flex items-center justify-between">
                    <label className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                      Password
                    </label>
                    {isLogin && (
                      <button
                        type="button"
                        onClick={handleForgotPassword}
                        className="text-[10px] text-blue-600 transition-all hover:underline"
                      >
                        Forgot Password?
                      </button>
                    )}
                  </div>
                  <div className="relative mt-1">
                    <Lock
                      size={16}
                      className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      type="password"
                      placeholder="********"
                      className="input input-with-icon"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <AnimatePresence mode="popLayout">
                  {!isLogin && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                    >
                      <div className="mt-4">
                        <label className="ml-1 text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                          Confirm Password
                        </label>
                        <div className="relative mt-1">
                          <Lock
                            size={16}
                            className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-gray-400"
                          />
                          <input
                            type="password"
                            placeholder="********"
                            className="input input-with-icon"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required={!isLogin}
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-full bg-gray-900 py-3.5 text-sm font-semibold text-white transition-all hover:bg-gray-800 disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <span>{isLogin ? "Sign In" : "Create Account"}</span>
                  )}
                  {!loading && <ArrowRight size={16} />}
                </button>
              </form>

              <div className="mt-6 text-center">
                <button
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-xs text-gray-500 transition-colors hover:text-gray-900"
                >
                  {isLogin ? "Don't have an account? " : "Already have an account? "}
                  <span className="font-semibold text-blue-600 underline underline-offset-4">
                    {isLogin ? "Sign up" : "Sign in"}
                  </span>
                </button>
              </div>

              <div className="mt-8 border-t border-[rgba(30,50,90,0.06)] pt-4 text-center">
                <Link
                  href="/"
                  className="text-[10px] font-medium tracking-widest text-gray-400 uppercase transition-colors hover:text-gray-900"
                >
                  Back to Home
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* --- MOBILE VIEW --- */}
      <div className="flex min-h-screen w-full flex-col bg-[#f0f0f0] lg:hidden">
        {/* Top header */}
        <div className="relative flex h-[32vh] w-full shrink-0 items-center justify-center overflow-hidden">
          <AnimatePresence>
            {!isLogin && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsLogin(true)}
                className="absolute top-10 left-6 z-20 text-gray-700"
              >
                <ArrowLeft size={24} />
              </motion.button>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {isLogin ? (
              <motion.div
                key="logo"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="relative z-10 overflow-hidden rounded-[28px] shadow-2xl"
              >
                <Image
                  src="/logo/logo black.PNG"
                  alt="MedX Logo"
                  width={110}
                  height={110}
                  className="rounded-[28px] object-cover"
                />
              </motion.div>
            ) : (
              <motion.div
                key="title"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="relative z-10 mt-6 text-[22px] font-bold text-gray-900"
              >
                Sign Up
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom card */}
        <div className="relative z-10 flex min-h-[68vh] flex-1 flex-col overflow-y-auto rounded-tl-[48px] border border-b-0 border-[rgba(30,50,90,0.05)] bg-white px-7 py-10 shadow-2xl">
          <h1 className="mb-8 text-center text-[28px] font-bold tracking-tight text-gray-900">
            {isLogin ? "Login" : ""}
          </h1>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <AnimatePresence mode="popLayout">
              {!isLogin && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="flex flex-col gap-4"
                >
                  <div className="flex flex-col gap-1.5">
                    <label className="ml-1 text-[13px] font-medium text-gray-700">
                      Full name
                    </label>
                    <input
                      type="text"
                      className="w-full rounded-[14px] border border-[rgba(30,50,90,0.06)] bg-[#fcfcfc] px-5 py-3.5 text-[15px] text-gray-900 shadow-[0_2px_10px_rgba(0,0,0,0.02)] transition-all placeholder:text-gray-400 focus:border-gray-400 focus:ring-4 focus:ring-gray-900/5 focus:outline-none"
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required={!isLogin}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="ml-1 text-[13px] font-medium text-gray-700">
                      Activation Code
                    </label>
                    <input
                      type="text"
                      className="w-full rounded-[14px] border border-[rgba(30,50,90,0.06)] bg-[#fcfcfc] px-5 py-3.5 font-mono text-[15px] tracking-widest text-gray-900 uppercase shadow-[0_2px_10px_rgba(0,0,0,0.02)] transition-all placeholder:text-gray-400 placeholder:tracking-normal placeholder:normal-case focus:border-gray-400 focus:ring-4 focus:ring-gray-900/5 focus:outline-none"
                      placeholder="Enter activation code"
                      value={activationCode}
                      onChange={(e) => setActivationCode(e.target.value.toUpperCase())}
                      required={!isLogin}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex flex-col gap-1.5">
              <label className="ml-1 text-[13px] font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                className="w-full rounded-[14px] border border-[rgba(30,50,90,0.06)] bg-[#fcfcfc] px-5 py-3.5 text-[15px] text-gray-900 shadow-[0_2px_10px_rgba(0,0,0,0.02)] transition-all placeholder:text-gray-400 focus:border-gray-400 focus:ring-4 focus:ring-gray-900/5 focus:outline-none"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex w-full items-center justify-between">
                <label className="ml-1 text-[13px] font-medium text-gray-700">
                  Password
                </label>
                {isLogin && (
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-[12px] text-blue-600 hover:underline"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <input
                type="password"
                className="w-full rounded-[14px] border border-[rgba(30,50,90,0.06)] bg-[#fcfcfc] px-5 py-3.5 text-[15px] text-gray-900 shadow-[0_2px_10px_rgba(0,0,0,0.02)] transition-all placeholder:text-gray-400 tracking-[0.2em] focus:border-gray-400 focus:ring-4 focus:ring-gray-900/5 focus:outline-none"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <AnimatePresence mode="popLayout">
              {!isLogin && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                >
                  <div className="mt-4 flex flex-col gap-1.5">
                    <label className="ml-1 text-[13px] font-medium text-gray-700">
                      Confirm password
                    </label>
                    <input
                      type="password"
                      className="w-full rounded-[14px] border border-[rgba(30,50,90,0.06)] bg-[#fcfcfc] px-5 py-3.5 text-[15px] text-gray-900 shadow-[0_2px_10px_rgba(0,0,0,0.02)] transition-all placeholder:text-gray-400 tracking-[0.2em] focus:border-gray-400 focus:ring-4 focus:ring-gray-900/5 focus:outline-none"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required={!isLogin}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-2 rounded-lg bg-red-50 p-2 text-center text-[13px] font-medium text-red-600"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {resetMessage && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-2 rounded-lg bg-emerald-50 p-2 text-center text-[13px] font-medium text-emerald-600"
                >
                  {resetMessage}
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={loading}
              className="mt-6 flex w-full items-center justify-center rounded-2xl bg-gray-900 py-4 text-[15px] font-semibold text-white transition-transform active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                isLogin ? "Login" : "Sign Up"
              )}
            </button>
          </form>

          <div className="mt-8 mb-4 flex flex-col gap-6 pb-8 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-[13px] font-medium text-gray-500"
            >
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <span className="font-semibold text-gray-900">
                {isLogin ? "Sign Up" : "Sign In"}
              </span>
            </button>
            <Link
              href="/"
              className="text-[11px] font-medium tracking-widest text-gray-400 uppercase transition-colors hover:text-gray-900"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}