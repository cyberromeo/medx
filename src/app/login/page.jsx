"use client";

import { useState } from "react";
import { account } from "@/lib/appwrite";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ID } from "appwrite";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, User, ArrowRight, AlertCircle, Loader2 } from "lucide-react";

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
            // Clear any existing session first to avoid "active session" error
            try {
                await account.deleteSession('current');
            } catch (ignore) {
                // No session to delete, proceed
            }

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
        <div className="min-h-screen bg-background flex items-center justify-center p-6 relative overflow-hidden">
            {/* Animated Background */}
            <div className="aurora-bg" />

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-[400px]"
            >
                <div className="glass-panel p-8 rounded-3xl relative overflow-hidden">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: "spring", duration: 0.8 }}
                            className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center pulse-glow"
                        >
                            <Lock size={28} className="text-white" />
                        </motion.div>
                        <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent mb-2">
                            {isLogin ? 'Welcome Back' : 'Create Account'}
                        </h2>
                        <p className="text-sm text-gray-500">
                            {isLogin ? 'Enter your details to access your library' : 'Start your medical journey today'}
                        </p>
                    </div>

                    {/* Error Banner */}
                    <AnimatePresence>
                        {error && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="bg-red-500/10 border border-red-500/20 text-red-200 text-xs p-3 rounded-xl mb-6 flex items-center gap-2"
                            >
                                <AlertCircle size={14} />
                                {error}
                            </motion.div>
                        )}
                    </AnimatePresence>


                    {/* Form */}
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <AnimatePresence mode='popLayout'>
                            {!isLogin && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                >
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Full Name</label>
                                        <div className="relative group">
                                            <User size={16} className="absolute left-4 top-3.5 text-gray-500 group-focus-within:text-primary transition-colors" />
                                            <input
                                                type="text"
                                                placeholder="John Doe"
                                                className="w-full bg-surface/50 border border-white/10 rounded-xl px-11 py-3 text-base text-white placeholder-gray-600 focus:outline-none focus:border-primary/50 focus:bg-surface/80 transition-all shadow-inner"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                required={!isLogin}
                                            />
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Email</label>
                            <div className="relative group">
                                <Mail size={16} className="absolute left-4 top-3.5 text-gray-500 group-focus-within:text-primary transition-colors" />
                                <input
                                    type="email"
                                    placeholder="name@example.com"
                                    className="w-full bg-surface/50 border border-white/10 rounded-xl px-11 py-3 text-base text-white placeholder-gray-600 focus:outline-none focus:border-primary/50 focus:bg-surface/80 transition-all shadow-inner"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Password</label>
                            <div className="relative group">
                                <Lock size={16} className="absolute left-4 top-3.5 text-gray-500 group-focus-within:text-primary transition-colors" />
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    className="w-full bg-surface/50 border border-white/10 rounded-xl px-11 py-3 text-base text-white placeholder-gray-600 focus:outline-none focus:border-primary/50 focus:bg-surface/80 transition-all shadow-inner"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="mt-4 w-full bg-white text-black font-semibold rounded-xl py-3 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none"
                        >
                            {loading ? <Loader2 size={18} className="animate-spin" /> : <span>{isLogin ? 'Sign In' : 'Create Account'}</span>}
                            {!loading && <ArrowRight size={16} />}
                        </button>
                    </form>

                    {/* Footer Switcher */}
                    <div className="mt-6 text-center">
                        <button
                            onClick={() => setIsLogin(!isLogin)}
                            className="text-xs text-gray-400 hover:text-white transition-colors"
                        >
                            {isLogin ? "Don't have an account? " : "Already have an account? "}
                            <span className="text-primary font-medium underline underline-offset-4 decoration-primary/30 hover:decoration-primary">{isLogin ? 'Sign up' : 'Sign in'}</span>
                        </button>
                    </div>

                    <div className="mt-8 text-center border-t border-white/5 pt-4">
                        <Link href="/" className="text-[10px] font-medium text-gray-600 hover:text-gray-400 transition-colors uppercase tracking-widest">
                            Back to Home
                        </Link>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
