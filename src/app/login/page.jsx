"use client";

import { useState } from "react";
import { auth } from "@/lib/firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail,
} from "firebase/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { activateSingleDeviceSession } from "@/lib/session-security";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Lock,
  User,
  ArrowRight,
  AlertCircle,
  Loader2,
  Stethoscope,
  ArrowLeft
} from "lucide-react";

import Image from "next/image";

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [resetMessage, setResetMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setResetMessage("");

    if (!isLogin && password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      let userCredential;
      if (isLogin) {
        userCredential = await signInWithEmailAndPassword(
          auth,
          email,
          password,
        );
      } else {
        userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password,
        );
        const displayName = name.trim();
        await updateProfile(userCredential.user, { displayName });
      }

      const userId = userCredential.user.uid;
      await activateSingleDeviceSession(userId);
      router.push("/dashboard");
    } catch (err) {
      console.error(err);
      if (
        isLogin &&
        (err.code === "auth/invalid-credential" ||
          err.code === "auth/wrong-password")
      ) {
        try {
          const res = await fetch("/api/auth/check-password", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
          });
          if (res.ok) {
            const data = await res.json();
            if (!data.hasPassword && !data.notFound) {
              await sendPasswordResetEmail(auth, email);
              setError("");
              setResetMessage(
                "Your account requires a password reset due to a system update. We have sent a reset link to your email.",
              );
              setLoading(false);
              return;
            }
          }
        } catch (checkErr) {
          console.error("Failed to check password status:", checkErr);
        }
      }
      setError(err.message || "Authentication failed");
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
      await sendPasswordResetEmail(auth, email);
      setResetMessage("Password reset email sent! Check your inbox.");
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to send password reset email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* --- DESKTOP VIEW --- */}
      <div className="hidden lg:block">
        <div className="halo-bg" />
        <div className="grid-bg" />

        <div className="container mx-auto flex min-h-screen items-center justify-center px-4 sm:px-6">
          <div className="grid w-full max-w-5xl grid-cols-1 gap-8 lg:grid-cols-2">
            {/* Brand Panel */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="panel-glow hidden flex-col justify-between rounded-3xl p-8 lg:flex lg:p-10"
            >
              <div>
                <div className="grad-primary mb-6 flex h-14 w-14 items-center justify-center rounded-2xl">
                  <Stethoscope size={28} className="text-white" />
                </div>
                <h1 className="font-display mb-3 text-3xl font-bold">
                  Welcome to MedX
                </h1>
                <p className="text-muted mb-6">
                  Focused, cinematic medical learning for FMGE preparation. Track
                  your progress, stay consistent, and build mastery.
                </p>
                <div className="space-y-3">
                  <div className="surface-elev rounded-2xl p-4">
                    <p className="text-muted text-xs">Feature</p>
                    <p className="font-semibold">Smart Progress Tracking</p>
                  </div>
                  <div className="surface-elev rounded-2xl p-4">
                    <p className="text-muted text-xs">Community</p>
                    <p className="font-semibold">Live Discuss support</p>
                  </div>
                </div>
              </div>
              <p className="text-muted text-xs">&copy; 2026 MedX</p>
            </motion.div>

            {/* Auth Panel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="panel rounded-3xl p-8 lg:p-10"
            >
              <div className="mb-8 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 shadow-sm">
                  <Lock size={24} className="text-primary" />
                </div>
                <h2 className="mb-2 text-2xl font-bold text-gray-900">
                  {isLogin ? "Welcome back" : "Create account"}
                </h2>
                <p className="text-muted text-sm">
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
                    className="mb-6 flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-200"
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
                    className="mb-6 flex items-center gap-2 rounded-xl border border-green-500/30 bg-green-500/10 p-3 text-xs text-green-200"
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
                        <label className="text-muted ml-1 text-[10px] font-bold tracking-widest uppercase">
                          Full Name
                        </label>
                        <div className="relative mt-1">
                          <User
                            size={16}
                            className="text-muted pointer-events-none absolute top-1/2 left-4 -translate-y-1/2"
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
                    </motion.div>
                  )}
                </AnimatePresence>

                <div>
                  <label className="text-muted ml-1 text-[10px] font-bold tracking-widest uppercase">
                    Email
                  </label>
                  <div className="relative mt-1">
                    <Mail
                      size={16}
                      className="text-muted pointer-events-none absolute top-1/2 left-4 -translate-y-1/2"
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
                    <label className="text-muted text-[10px] font-bold tracking-widest uppercase">
                      Password
                    </label>
                    {isLogin && (
                      <button
                        type="button"
                        onClick={handleForgotPassword}
                        className="text-primary text-[10px] transition-all hover:underline"
                      >
                        Forgot Password?
                      </button>
                    )}
                  </div>
                  <div className="relative mt-1">
                    <Lock
                      size={16}
                      className="text-muted pointer-events-none absolute top-1/2 left-4 -translate-y-1/2"
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
                        <label className="text-muted ml-1 text-[10px] font-bold tracking-widest uppercase">
                          Confirm Password
                        </label>
                        <div className="relative mt-1">
                          <Lock
                            size={16}
                            className="text-muted pointer-events-none absolute top-1/2 left-4 -translate-y-1/2"
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
                  className="btn-primary mt-2 flex w-full items-center justify-center gap-2 text-sm disabled:opacity-50"
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
                  className="text-muted text-xs transition-colors hover:text-gray-900"
                >
                  {isLogin
                    ? "Don't have an account? "
                    : "Already have an account? "}
                  <span className="text-primary font-medium underline underline-offset-4">
                    {isLogin ? "Sign up" : "Sign in"}
                  </span>
                </button>
              </div>

              <div className="mt-8 border-t border-gray-200 pt-4 text-center">
                <Link
                  href="/"
                  className="text-muted text-[10px] font-medium tracking-widest uppercase transition-colors hover:text-gray-900"
                >
                  Back to Home
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* --- MOBILE VIEW --- */}
      <div className="flex lg:hidden w-full min-h-screen bg-[#0f0f0f] relative flex-col font-sans">
        {/* Mobile Top Header */}
        <div className="relative h-[35vh] w-full flex items-center justify-center overflow-hidden shrink-0">
          {/* Geometric Pattern */}
          <div className="absolute inset-0 opacity-[0.03]">
             <div className="absolute top-0 left-0 w-32 h-32 border-[24px] border-white rounded-full -translate-x-1/2 -translate-y-1/2" />
             <div className="absolute top-10 right-10 w-24 h-24 bg-white rounded-full" />
             <div className="absolute bottom-10 left-20 w-40 h-40 border-[32px] border-white rounded-full" />
             <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-white opacity-50 rotate-45" />
          </div>

          <AnimatePresence>
            {!isLogin && (
              <motion.button 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsLogin(true)} 
                className="absolute top-10 left-6 text-white z-20"
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
                className="relative z-10 shadow-2xl rounded-[32px] overflow-hidden"
              >
                 <Image src="/logo/logo white.PNG" alt="MedX Logo" width={120} height={120} className="object-cover rounded-[32px]" />
              </motion.div>
            ) : (
              <motion.div 
                key="title"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-white text-[22px] font-medium relative z-10 mt-6"
              >
                Sign Up
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Mobile Bottom Card */}
        <div className="flex-1 bg-[#ffffff] rounded-tl-[60px] w-full relative z-10 flex flex-col px-8 py-10 shadow-2xl overflow-y-auto min-h-[65vh]">
          <h1 className="text-[28px] font-medium text-center mb-8 text-black tracking-tight">
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
                    <label className="text-[13px] text-gray-800 ml-1 font-medium">Full name</label>
                    <input 
                       type="text" 
                       className="w-full bg-[#fcfcfc] rounded-[14px] px-5 py-3.5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-gray-100 focus:outline-none focus:border-gray-300 focus:ring-4 focus:ring-black/5 text-[15px] placeholder:text-gray-400 transition-all"
                       placeholder="John Doe"
                       value={name}
                       onChange={(e) => setName(e.target.value)}
                       required={!isLogin}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] text-gray-800 ml-1 font-medium">Email</label>
              <input 
                 type="email" 
                 className="w-full bg-[#fcfcfc] rounded-[14px] px-5 py-3.5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-gray-100 focus:outline-none focus:border-gray-300 focus:ring-4 focus:ring-black/5 text-[15px] placeholder:text-gray-400 transition-all"
                 placeholder="vijaybhuva90@gmail.com"
                 value={email}
                 onChange={(e) => setEmail(e.target.value)}
                 required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center w-full">
                <label className="text-[13px] text-gray-800 ml-1 font-medium">Password</label>
                {isLogin && (
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-[#666] text-[12px] hover:underline"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <input 
                 type="password" 
                 className="w-full bg-[#fcfcfc] rounded-[14px] px-5 py-3.5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-gray-100 focus:outline-none focus:border-gray-300 focus:ring-4 focus:ring-black/5 text-[15px] placeholder:text-gray-400 font-mono tracking-[0.2em] transition-all"
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
                  <div className="flex flex-col gap-1.5 mt-4">
                    <label className="text-[13px] text-gray-800 ml-1 font-medium">Confirm password</label>
                    <input 
                       type="password" 
                       className="w-full bg-[#fcfcfc] rounded-[14px] px-5 py-3.5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-gray-100 focus:outline-none focus:border-gray-300 focus:ring-4 focus:ring-black/5 text-[15px] placeholder:text-gray-400 font-mono tracking-[0.2em] transition-all"
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
                  className="text-red-500 text-[13px] text-center mt-2 bg-red-50 p-2 rounded-lg font-medium"
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
                  className="text-green-600 text-[13px] text-center mt-2 bg-green-50 p-2 rounded-lg font-medium"
                >
                  {resetMessage}
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#0f0f0f] text-white rounded-2xl py-4 mt-6 font-medium text-[15px] flex items-center justify-center transition-transform active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : (isLogin ? "Login" : "Sign Up")}
            </button>
          </form>

          <div className="mt-8 mb-4 text-center pb-8 flex flex-col gap-6">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-[13px] text-gray-500 font-medium"
            >
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <span className="font-semibold text-black">{isLogin ? "Sign Up" : "Sign In"}</span>
            </button>
            <Link
              href="/"
              className="text-[11px] text-gray-400 font-medium tracking-widest uppercase hover:text-gray-900 transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
