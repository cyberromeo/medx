"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lock,
  KeyRound,
  Copy,
  Check,
  Loader2,
  Plus,
  Shield,
  Hash,
  ArrowRight,
  RefreshCw,
  User,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
} from "lucide-react";

export default function ActiCodePage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [codes, setCodes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generateCount, setGenerateCount] = useState(1);
  const [copiedCode, setCopiedCode] = useState(null);
  const [filter, setFilter] = useState("all"); // 'all' | 'unused' | 'used'
  const [justGenerated, setJustGenerated] = useState([]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === "superstudiopro") {
      setAuthenticated(true);
      setPasswordError("");
    } else {
      setPasswordError("Incorrect password");
    }
  };

  const fetchCodes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/activation-codes?password=superstudiopro`);
      const data = await res.json();
      if (data.codes) setCodes(data.codes);
    } catch (err) {
      console.error("Failed to fetch codes:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authenticated) fetchCodes();
  }, [authenticated, fetchCodes]);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const res = await fetch("/api/activation-codes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: "superstudiopro", count: generateCount }),
      });
      const data = await res.json();
      if (data.codes) {
        setJustGenerated(data.codes);
        setTimeout(() => setJustGenerated([]), 5000);
        await fetchCodes();
      }
    } catch (err) {
      console.error("Failed to generate codes:", err);
    } finally {
      setGenerating(false);
    }
  };

  const copyCode = async (code) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch {
      /* noop */
    }
  };

  const filteredCodes = codes.filter((c) => {
    if (filter === "unused") return !c.used;
    if (filter === "used") return c.used;
    return true;
  });

  const stats = {
    total: codes.length,
    used: codes.filter((c) => c.used).length,
    unused: codes.filter((c) => !c.used).length,
  };

  // --- PASSWORD GATE ---
  if (!authenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f0f0f0] p-4">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-sm"
        >
          <div className="rounded-[2rem] border border-[rgba(30,50,90,0.05)] bg-white p-8 shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
            <div className="mb-8 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-900 shadow-md">
                <Shield size={28} className="text-white" />
              </div>
              <h1 className="mb-2 text-2xl font-bold tracking-tight text-gray-900">
                Activation Codes
              </h1>
              <p className="text-sm text-gray-500">
                Enter the admin password to continue
              </p>
            </div>

            <form onSubmit={handleLogin} className="flex flex-col gap-4">
              <div>
                <label className="ml-1 text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                  Password
                </label>
                <div className="relative mt-1">
                  <Lock
                    size={16}
                    className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter admin password"
                    className="input input-with-icon pr-12"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setPasswordError("");
                    }}
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute top-1/2 right-4 -translate-y-1/2 text-gray-400 transition-colors hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <AnimatePresence>
                {passwordError && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="rounded-xl bg-red-50 p-3 text-center text-xs font-medium text-red-500"
                  >
                    {passwordError}
                  </motion.p>
                )}
              </AnimatePresence>

              <button
                type="submit"
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-full bg-gray-900 py-3.5 text-sm font-semibold text-white transition-all hover:bg-gray-800"
              >
                <span>Unlock</span>
                <ArrowRight size={16} />
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    );
  }

  // --- ADMIN PANEL ---
  return (
    <div className="min-h-screen bg-[#f0f0f0] pb-24">
      {/* Header */}
      <div className="border-b border-[rgba(30,50,90,0.06)] bg-white">
        <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-900 shadow-sm">
              <KeyRound size={22} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-gray-900">
                Activation Codes
              </h1>
              <p className="text-xs text-gray-500">
                Generate and manage invite codes
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 pt-6 sm:px-6">
        {/* Stats */}
        <div className="mb-6 grid grid-cols-3 gap-3">
          {[
            { label: "Total", value: stats.total, icon: Hash, color: "text-gray-700" },
            { label: "Available", value: stats.unused, icon: CheckCircle2, color: "text-emerald-600" },
            { label: "Used", value: stats.used, icon: XCircle, color: "text-red-500" },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-2xl border border-[rgba(30,50,90,0.05)] bg-white p-4 shadow-[0_2px_12px_rgba(0,0,0,0.03)]"
            >
              <div className="mb-2 flex items-center gap-2">
                <s.icon size={14} className={s.color} />
                <span className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                  {s.label}
                </span>
              </div>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Generate Section */}
        <div className="mb-6 rounded-2xl border border-[rgba(30,50,90,0.05)] bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
          <h2 className="mb-4 text-sm font-bold text-gray-900">
            Generate New Codes
          </h2>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-xl border border-[rgba(30,50,90,0.08)] bg-gray-50 px-3 py-2">
              <label className="text-xs font-medium text-gray-500">Count:</label>
              <select
                value={generateCount}
                onChange={(e) => setGenerateCount(Number(e.target.value))}
                className="border-none bg-transparent text-sm font-semibold text-gray-900 focus:outline-none"
              >
                {[1, 2, 3, 5, 10, 20, 50].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="flex items-center gap-2 rounded-full bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-gray-800 disabled:opacity-50"
            >
              {generating ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Plus size={16} />
              )}
              {generating ? "Generating..." : "Generate"}
            </button>
          </div>

          {/* Just generated codes */}
          <AnimatePresence>
            {justGenerated.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4"
              >
                <p className="mb-2 text-[10px] font-bold tracking-widest text-emerald-600 uppercase">
                  Just Generated
                </p>
                <div className="flex flex-wrap gap-2">
                  {justGenerated.map((code) => (
                    <button
                      key={code}
                      onClick={() => copyCode(code)}
                      className="flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 font-mono text-sm font-bold text-emerald-700 transition-all hover:bg-emerald-100"
                    >
                      {code}
                      {copiedCode === code ? (
                        <Check size={12} />
                      ) : (
                        <Copy size={12} />
                      )}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Filter Tabs */}
        <div className="mb-4 flex items-center gap-1 rounded-xl border border-[rgba(30,50,90,0.06)] bg-white p-1">
          {[
            { key: "all", label: "All" },
            { key: "unused", label: "Available" },
            { key: "used", label: "Used" },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`flex-1 rounded-lg px-3 py-2 text-xs font-semibold transition-all ${
                filter === f.key
                  ? "bg-gray-900 text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              {f.label}
            </button>
          ))}
          <button
            onClick={fetchCodes}
            disabled={loading}
            className="ml-1 rounded-lg p-2 text-gray-400 transition-colors hover:text-gray-900"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>
        </div>

        {/* Codes List */}
        <div className="space-y-2">
          {loading && codes.length === 0 ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 size={24} className="animate-spin text-gray-400" />
            </div>
          ) : filteredCodes.length === 0 ? (
            <div className="py-16 text-center">
              <KeyRound size={32} className="mx-auto mb-3 text-gray-300" />
              <p className="text-sm font-medium text-gray-400">
                {filter === "all"
                  ? "No codes yet. Generate some above!"
                  : `No ${filter} codes found`}
              </p>
            </div>
          ) : (
            filteredCodes.map((c, i) => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.02 }}
                className={`group flex items-center justify-between rounded-xl border bg-white px-4 py-3 transition-all ${
                  c.used
                    ? "border-[rgba(239,68,68,0.1)] opacity-60"
                    : "border-[rgba(30,50,90,0.05)] hover:border-[rgba(37,99,235,0.15)] hover:shadow-md"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                      c.used ? "bg-red-50" : "bg-emerald-50"
                    }`}
                  >
                    {c.used ? (
                      <XCircle size={14} className="text-red-400" />
                    ) : (
                      <CheckCircle2 size={14} className="text-emerald-500" />
                    )}
                  </div>
                  <div>
                    <p className="font-mono text-sm font-bold text-gray-900">
                      {c.code}
                    </p>
                    <div className="flex items-center gap-2">
                      {c.used ? (
                        <>
                          <span className="flex items-center gap-1 text-[10px] text-gray-400">
                            <User size={10} />
                            {c.usedByEmail || c.usedBy || "—"}
                          </span>
                          {c.usedAt && (
                            <span className="flex items-center gap-1 text-[10px] text-gray-400">
                              <Clock size={10} />
                              {new Date(c.usedAt).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </span>
                          )}
                        </>
                      ) : (
                        <span className="text-[10px] font-medium text-emerald-500">
                          Available
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {!c.used && (
                  <button
                    onClick={() => copyCode(c.code)}
                    className="rounded-lg p-2 text-gray-300 transition-all hover:bg-gray-100 hover:text-gray-700 group-hover:text-gray-400"
                    title="Copy code"
                  >
                    {copiedCode === c.code ? (
                      <Check size={14} className="text-emerald-500" />
                    ) : (
                      <Copy size={14} />
                    )}
                  </button>
                )}
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
