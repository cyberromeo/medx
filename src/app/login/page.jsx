"use client";

import { useState } from "react";
import { account } from "@/lib/appwrite";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ID } from "appwrite";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, User, ArrowRight, AlertCircle, Loader2, Stethoscope } from "lucide-react";

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      try {
        await account.deleteSession("current");
      } catch (ignore) {}

      if (isLogin) {
        await account.createEmailPasswordSession(email, password);
      } else {
        await account.create(ID.unique(), email, password, name);
        await account.createEmailPasswordSession(email, password);
      }
      router.push("/dashboard");
    } catch (err) {
      console.error(err);
      setError(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="halo-bg" />
      <div className="grid-bg" />

      <div className="container mx-auto px-4 sm:px-6 min-h-screen flex items-center justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl w-full">
          {/* Brand Panel */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="panel-glow rounded-3xl p-8 lg:p-10 hidden lg:flex flex-col justify-between"
          >
            <div>
              <div className="w-14 h-14 rounded-2xl grad-primary flex items-center justify-center mb-6">
                <Stethoscope size={28} className="text-black" />
              </div>
              <h1 className="font-display text-3xl font-bold mb-3">Welcome to MedX</h1>
              <p className="text-muted mb-6">
                Focused, cinematic medical learning for FMGE preparation. Track your progress, stay consistent,
                and build mastery.
              </p>
              <div className="space-y-3">
                <div className="surface-elev rounded-2xl p-4">
                  <p className="text-xs text-muted">Feature</p>
                  <p className="font-semibold">Smart Progress Tracking</p>
                </div>
                <div className="surface-elev rounded-2xl p-4">
                  <p className="text-xs text-muted">Community</p>
                  <p className="font-semibold">Live ChatX support</p>
                </div>
              </div>
            </div>
            <p className="text-xs text-muted">(c) 2026 MedX</p>
          </motion.div>

          {/* Auth Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="panel rounded-3xl p-8 lg:p-10"
          >
            <div className="text-center mb-8">
              <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-white/5 flex items-center justify-center">
                <Lock size={24} className="text-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-2">
                {isLogin ? "Welcome back" : "Create account"}
              </h2>
              <p className="text-sm text-muted">
                {isLogin ? "Enter your details to access your library" : "Start your medical journey today"}
              </p>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="bg-red-500/10 border border-red-500/30 text-red-200 text-xs p-3 rounded-xl mb-6 flex items-center gap-2"
                >
                  <AlertCircle size={14} />
                  {error}
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
                  >
                    <label className="text-[10px] font-bold text-muted uppercase tracking-widest ml-1">Full Name</label>
                    <div className="relative mt-1">
                      <User size={16} className="absolute left-4 top-3.5 text-muted" />
                      <input
                        type="text"
                        placeholder="John Doe"
                        className="input pl-11"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required={!isLogin}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div>
                <label className="text-[10px] font-bold text-muted uppercase tracking-widest ml-1">Email</label>
                <div className="relative mt-1">
                  <Mail size={16} className="absolute left-4 top-3.5 text-muted" />
                  <input
                    type="email"
                    placeholder="name@example.com"
                    className="input pl-11"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-muted uppercase tracking-widest ml-1">Password</label>
                <div className="relative mt-1">
                  <Lock size={16} className="absolute left-4 top-3.5 text-muted" />
                  <input
                    type="password"
                    placeholder="********"
                    className="input pl-11"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full mt-2 flex items-center justify-center gap-2 text-sm disabled:opacity-50"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : <span>{isLogin ? "Sign In" : "Create Account"}</span>}
                {!loading && <ArrowRight size={16} />}
              </button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-xs text-muted hover:text-white transition-colors"
              >
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <span className="text-primary font-medium underline underline-offset-4">{isLogin ? "Sign up" : "Sign in"}</span>
              </button>
            </div>

            <div className="mt-8 text-center border-t border-white/5 pt-4">
              <Link href="/" className="text-[10px] font-medium text-muted hover:text-white transition-colors uppercase tracking-widest">
                Back to Home
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
