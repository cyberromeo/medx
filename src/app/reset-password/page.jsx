"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { auth } from "@/lib/firebase";
import { confirmPasswordReset, verifyPasswordResetCode } from "firebase/auth";
import { Loader2, AlertCircle, CheckCircle2, Lock } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [oobCode, setOobCode] = useState(null);
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    const code = searchParams.get("oobCode");
    const mode = searchParams.get("mode");

    if (!code || mode !== "resetPassword") {
      setMessage({ type: "error", text: "Invalid or missing password reset code. Please try requesting a new link." });
      setLoading(false);
      return;
    }

    setOobCode(code);

    // Verify the code and get the user's email so we can show it
    verifyPasswordResetCode(auth, code)
      .then((userEmail) => {
        setEmail(userEmail);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error verifying reset code:", error);
        setMessage({ type: "error", text: "This reset link has expired or is invalid. Please request a new one." });
        setLoading(false);
      });
  }, [searchParams]);

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await confirmPasswordReset(auth, oobCode, newPassword);
      setMessage({ type: "success", text: "Password reset successfully! You can now log in with your new password." });
      // Redirect to login after a short delay
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (error) {
      setMessage({ type: "error", text: error.message });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[#f0f0f0] p-4 font-sans text-gray-900 selection:bg-blue-100 selection:text-blue-900">
      <div className="w-full max-w-[420px]">
        {/* Logo / Header */}
        <div className="mb-8 flex flex-col items-center">
          <div className="relative mb-6 flex h-[72px] w-[72px] items-center justify-center overflow-hidden rounded-[1.2rem] bg-white shadow-sm ring-1 ring-[rgba(30,50,90,0.05)]">
            <img
              src="/logo/logo black.PNG"
              alt="MedX"
              className="h-full w-full scale-110 object-cover"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Reset Password
          </h1>
        </div>

        {/* Card */}
        <div className="overflow-hidden rounded-[2rem] border border-[rgba(30,50,90,0.05)] bg-white p-6 shadow-[0_4px_24px_rgba(0,0,0,0.04)] sm:p-8">
          <AnimatePresence mode="wait">
            {message.text && (
              <motion.div
                initial={{ opacity: 0, y: -10, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, y: -10, height: 0 }}
                className={`mb-6 flex items-center gap-3 rounded-2xl p-4 text-sm font-medium ${
                  message.type === "error"
                    ? "bg-red-50 text-red-600 border border-red-100"
                    : "bg-emerald-50 text-emerald-600 border border-emerald-100"
                }`}
              >
                {message.type === "error" ? (
                  <AlertCircle size={20} className="shrink-0" />
                ) : (
                  <CheckCircle2 size={20} className="shrink-0" />
                )}
                <span>{message.text}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {loading ? (
            <div className="flex py-12 justify-center">
              <Loader2 className="animate-spin text-blue-600" size={32} />
            </div>
          ) : !oobCode || message.type === "error" ? (
            <div className="flex flex-col items-center pt-2 pb-4">
              <Link
                href="/login"
                className="mt-6 flex w-full items-center justify-center rounded-xl bg-gray-900 px-4 py-3.5 text-sm font-bold text-white transition-all hover:bg-gray-800 active:scale-95"
              >
                Return to Login
              </Link>
            </div>
          ) : message.type === "success" ? (
            <div className="flex flex-col items-center pt-2 pb-4">
              <p className="text-center text-gray-500 text-sm mb-6">
                Redirecting you to the login page...
              </p>
            </div>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-5">
              <div className="text-center mb-6">
                <p className="text-sm text-gray-500">
                  Setting new password for:
                </p>
                <p className="font-semibold text-gray-900">{email}</p>
              </div>

              <div className="space-y-1.5">
                <label className="ml-1 text-[11px] font-bold tracking-widest text-gray-400 uppercase">
                  New Password
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                    <Lock size={18} />
                  </div>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="input pl-10"
                    placeholder="Enter new password"
                    autoComplete="new-password"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || newPassword.length < 6}
                className="group relative mt-2 flex w-full items-center justify-center overflow-hidden rounded-xl bg-blue-600 px-4 py-3.5 text-sm font-bold text-white transition-all hover:bg-blue-700 active:scale-95 disabled:pointer-events-none disabled:opacity-70"
              >
                {isSubmitting ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <span>Reset Password</span>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
