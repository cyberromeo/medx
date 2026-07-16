"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { auth } from "@/lib/firebase";
import { updateProfile, updatePassword, sendPasswordResetEmail, onAuthStateChanged } from "firebase/auth";
import { User, Shield, RotateCcw, AlertCircle, CheckCircle2, ChevronRight, Loader2, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { clearProgressCache } from "@/lib/progress";

export default function SettingsPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("profile");
  const router = useRouter();

  // Form states
  const [displayName, setDisplayName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // UI states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setDisplayName(currentUser.displayName || "");
        setLoading(false);
      } else {
        router.push("/login");
      }
    });
    return () => unsubscribe();
  }, [router]);

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 5000);
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await updateProfile(user, { displayName });
      showMessage("success", "Profile updated successfully");
    } catch (error) {
      showMessage("error", error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showMessage("error", "Passwords do not match");
      return;
    }
    setIsSubmitting(true);
    try {
      await updatePassword(user, newPassword);
      showMessage("success", "Password updated successfully");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      if (error.code === 'auth/requires-recent-login') {
        showMessage("error", "Please re-login to change your password for security reasons.");
      } else {
        showMessage("error", error.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendResetEmail = async () => {
    setIsSubmitting(true);
    try {
      await sendPasswordResetEmail(auth, user.email);
      showMessage("success", "Password reset email sent to " + user.email);
    } catch (error) {
      showMessage("error", error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetProgress = async () => {
    if (confirm("Are you sure you want to reset all cached progress? This will force a fresh sync with the server on your next load.")) {
      clearProgressCache();
      showMessage("success", "Local progress cache cleared successfully");
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "security", label: "Security", icon: Shield },
    { id: "reset", label: "Reset", icon: RotateCcw },
  ];

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto h-full flex flex-col">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
          Settings
        </h1>
        <p className="mt-2 text-base text-gray-500">
          Manage your account preferences and security
        </p>
      </motion.div>

      <div className="flex flex-col md:flex-row gap-8 flex-1">
        {/* Sidebar Tabs */}
        <div className="w-full md:w-64 shrink-0 space-y-2">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex w-full items-center justify-between rounded-2xl p-4 transition-all duration-200 ${
                  isActive
                    ? "bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-100"
                    : "bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <div className="flex items-center gap-3">
                  <tab.icon
                    size={20}
                    className={isActive ? "text-blue-600" : "text-gray-400"}
                  />
                  <span className="font-semibold">{tab.label}</span>
                </div>
                {isActive && (
                  <ChevronRight size={18} className="text-blue-400" />
                )}
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-white border border-[rgba(30,50,90,0.05)] rounded-[2rem] shadow-[0_4px_24px_rgba(0,0,0,0.02)] p-6 md:p-8 overflow-y-auto">
          <AnimatePresence mode="wait">
            {message.text && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                className={`mb-6 flex items-center gap-2 rounded-xl p-4 text-sm font-medium ${
                  message.type === "error"
                    ? "bg-red-50 text-red-600 border border-red-100"
                    : "bg-emerald-50 text-emerald-600 border border-emerald-100"
                }`}
              >
                {message.type === "error" ? (
                  <AlertCircle size={18} />
                ) : (
                  <CheckCircle2 size={18} />
                )}
                {message.text}
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {activeTab === "profile" && (
              <motion.div
                key="profile"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Personal Information</h3>
                  <p className="text-sm text-gray-500 mt-1">Update your display name and public profile details.</p>
                </div>

                <form onSubmit={handleUpdateProfile} className="space-y-5">
                  <div>
                    <label className="text-[10px] font-bold tracking-widest text-gray-400 uppercase ml-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={user?.email || ""}
                      disabled
                      className="input mt-1 bg-gray-50 text-gray-500 cursor-not-allowed"
                    />
                    <p className="text-xs text-gray-400 mt-2 ml-1">Email cannot be changed directly.</p>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold tracking-widest text-gray-400 uppercase ml-1">
                      Display Name
                    </label>
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="input mt-1"
                      placeholder="Dr. John Doe"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex w-full md:w-auto items-center justify-center rounded-xl bg-blue-600 px-8 py-3.5 text-sm font-bold text-white transition-all hover:bg-blue-700 active:scale-95 disabled:opacity-70"
                  >
                    {isSubmitting ? (
                      <Loader2 className="animate-spin" size={20} />
                    ) : (
                      "Save Changes"
                    )}
                  </button>
                </form>
              </motion.div>
            )}

            {activeTab === "security" && (
              <motion.div
                key="security"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-8"
              >
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Change Password</h3>
                  <p className="text-sm text-gray-500 mt-1">Ensure your account is using a long, random password to stay secure.</p>
                </div>

                <form onSubmit={handleUpdatePassword} className="space-y-5 border-b border-gray-100 pb-8">
                  <div>
                    <label className="text-[10px] font-bold tracking-widest text-gray-400 uppercase ml-1">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="input mt-1"
                      placeholder="Enter new password"
                      minLength={6}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold tracking-widest text-gray-400 uppercase ml-1">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="input mt-1"
                      placeholder="Confirm new password"
                      minLength={6}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex w-full md:w-auto items-center justify-center rounded-xl bg-gray-900 px-8 py-3.5 text-sm font-bold text-white transition-all hover:bg-gray-800 active:scale-95 disabled:opacity-70"
                  >
                    {isSubmitting ? (
                      <Loader2 className="animate-spin" size={20} />
                    ) : (
                      "Update Password"
                    )}
                  </button>
                </form>

                <div>
                  <h3 className="text-lg font-bold text-gray-900">Password Reset</h3>
                  <p className="text-sm text-gray-500 mt-1">Forgot your current password? We can send you a reset link.</p>
                  <button
                    onClick={handleSendResetEmail}
                    disabled={isSubmitting}
                    className="mt-4 flex items-center justify-center rounded-xl border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-gray-700 transition-all hover:bg-gray-50 active:scale-95 disabled:opacity-70"
                  >
                    Send Reset Email
                  </button>
                </div>
              </motion.div>
            )}

            {activeTab === "reset" && (
              <motion.div
                key="reset"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-lg font-bold text-red-600">Danger Zone</h3>
                  <p className="text-sm text-gray-500 mt-1">Actions here can affect your account data and progress.</p>
                </div>

                <div className="rounded-2xl border border-red-100 bg-red-50/50 p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h4 className="font-bold text-gray-900">Clear Progress Cache</h4>
                      <p className="text-xs text-gray-500 mt-1 max-w-sm">
                        This clears local storage and forces the app to re-fetch your progress from the server. Useful if your XP or streaks are out of sync.
                      </p>
                    </div>
                    <button
                      onClick={handleResetProgress}
                      className="shrink-0 flex items-center justify-center rounded-xl bg-red-100 px-6 py-3 text-sm font-bold text-red-600 transition-all hover:bg-red-200 active:scale-95"
                    >
                      Clear Cache
                    </button>
                  </div>
                </div>

              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
