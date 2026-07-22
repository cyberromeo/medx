"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  Plus,
  Check,
  Trash2,
  Code,
  Copy,
  Flame,
  Award,
  Clock,
  Sparkles,
  RefreshCw,
  X,
  Zap,
  Globe,
  BellRing,
  Send,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Smartphone,
  BookOpen,
  CheckSquare,
} from "lucide-react";

const PASSWORD = "superstudiopro";
const DEFAULT_STUDY_GOAL = 11 * 3600; // 11 hours
const DEFAULT_PYQ_GOAL = 2 * 3600;    // 2 hours
const DEFAULT_NTFY_TOPIC = "https://ntfy.sh/medx_study_siren_superstudiopro";

export default function StudyTimePage() {
  // Auth state
  const [authenticated, setAuthenticated] = useState(false);
  const [passInput, setPassInput] = useState("");
  const [passError, setPassError] = useState("");
  const [showPass, setShowPass] = useState(false);

  // App state
  const [loading, setLoading] = useState(true);
  const [todayStudySeconds, setTodayStudySeconds] = useState(0);
  const [todayPyqSeconds, setTodayPyqSeconds] = useState(0);
  const [dailyGoalSeconds, setDailyGoalSeconds] = useState(DEFAULT_STUDY_GOAL);
  const [dailyPyqGoalSeconds, setDailyPyqGoalSeconds] = useState(DEFAULT_PYQ_GOAL);
  const [currentStudyDay, setCurrentStudyDay] = useState("");
  const [history, setHistory] = useState({});
  const [historyPyq, setHistoryPyq] = useState({});
  const [weeklyHistory, setWeeklyHistory] = useState([]);
  const [weeklyStudyTotalHours, setWeeklyStudyTotalHours] = useState(0);
  const [weeklyPyqTotalHours, setWeeklyPyqTotalHours] = useState(0);
  const [streak, setStreak] = useState(0);
  const [streakPyq, setStreakPyq] = useState(0);
  const [todos, setTodos] = useState([]);
  const [webhookUrl, setWebhookUrl] = useState(DEFAULT_NTFY_TOPIC);
  const [savingWebhook, setSavingWebhook] = useState(false);
  const [webhookMsg, setWebhookMsg] = useState("");
  const [webhookStatus, setWebhookStatus] = useState(null);

  // Timer state
  const [timerMode, setTimerMode] = useState("study"); // 'study', 'pyq', 'break10', 'break20'
  const [timerTotal, setTimerTotal] = useState(3600); // 1 hr default
  const [timerRemaining, setTimerRemaining] = useState(3600);
  const [timerState, setTimerState] = useState("idle"); // 'idle', 'running', 'paused'

  // Alarm volume state
  const [alarmVolume, setAlarmVolume] = useState(1.0);
  const [isAlarmActive, setIsAlarmActive] = useState(false);

  // Todo input
  const [newTodoText, setNewTodoText] = useState("");

  // API Modal state
  const [showApiModal, setShowApiModal] = useState(false);
  const [logs, setLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  // Live IST Clock
  const [istTimeStr, setIstTimeStr] = useState("");

  // Audio Context Ref for Siren
  const audioCtxRef = useRef(null);

  // Check auth on mount
  useEffect(() => {
    const saved = localStorage.getItem("studytime_auth");
    if (saved === "true") {
      setAuthenticated(true);
    }
  }, []);

  // IST Live Clock ticker
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const istOffset = 5.5 * 60 * 60 * 1000;
      const utc = now.getTime() + now.getTimezoneOffset() * 60000;
      const ist = new Date(utc + istOffset);
      setIstTimeStr(ist.toLocaleTimeString("en-IN", { hour12: false }));
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch state from API (syncs cloud timer)
  const fetchState = useCallback(async () => {
    try {
      const res = await fetch(`/api/studytime?password=${PASSWORD}`);
      const data = await res.json();
      if (data.success && data.state) {
        setTodayStudySeconds(data.state.todayStudySeconds || 0);
        setTodayPyqSeconds(data.state.todayPyqSeconds || 0);
        setDailyGoalSeconds(data.state.dailyGoalSeconds || DEFAULT_STUDY_GOAL);
        setDailyPyqGoalSeconds(data.state.dailyPyqGoalSeconds || DEFAULT_PYQ_GOAL);
        setCurrentStudyDay(data.state.currentStudyDay || "");
        setHistory(data.state.history || {});
        setHistoryPyq(data.state.historyPyq || {});
        setWeeklyHistory(data.state.weeklyHistory || []);
        setWeeklyStudyTotalHours(data.state.weeklyStudyTotalHours || 0);
        setWeeklyPyqTotalHours(data.state.weeklyPyqTotalHours || 0);
        setStreak(data.state.streak || 0);
        setStreakPyq(data.state.streakPyq || 0);
        setTodos(data.state.todos || []);
        if (data.state.webhookUrl) {
          setWebhookUrl(data.state.webhookUrl);
        }

        // Sync Cloud Active Timer safely without resetting pauses
        const active = data.state.activeTimer;
        if (active) {
          setTimerMode(active.mode || "study");
          setTimerTotal(active.durationSeconds || 3600);

          if (active.isRunning) {
            setTimerRemaining(active.secondsRemaining);
            setTimerState("running");
          } else if (active.completed) {
            setTimerRemaining(0);
            setTimerState("idle");
          } else if (active.secondsRemaining !== undefined && active.secondsRemaining > 0) {
            setTimerRemaining(active.secondsRemaining);
            setTimerState("paused");
          }
        }
      }
    } catch (err) {
      console.error("Failed to fetch studytime state:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authenticated) {
      fetchState();
      const syncInterval = setInterval(fetchState, 10000);
      return () => clearInterval(syncInterval);
    }
  }, [authenticated, fetchState]);

  // Log study or pyq time to API
  const logStudyTimeApi = useCallback(async (seconds, mode = "study", note = "") => {
    try {
      const res = await fetch("/api/studytime", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          password: PASSWORD,
          action: "log",
          seconds,
          mode,
          note,
          source: "web",
        }),
      });
      const data = await res.json();
      if (data.success && data.state) {
        setTodayStudySeconds(data.state.todayStudySeconds || 0);
        setTodayPyqSeconds(data.state.todayPyqSeconds || 0);
        setHistory(data.state.history || {});
        setHistoryPyq(data.state.historyPyq || {});
        setWeeklyHistory(data.state.weeklyHistory || []);
        setWeeklyStudyTotalHours(data.state.weeklyStudyTotalHours || 0);
        setWeeklyPyqTotalHours(data.state.weeklyPyqTotalHours || 0);
        setStreak(data.state.streak || 0);
        setStreakPyq(data.state.streakPyq || 0);
      }
    } catch (err) {
      console.error("Failed to log study time:", err);
    }
  }, []);

  // Timer Ticker effect
  useEffect(() => {
    let interval = null;
    if (timerState === "running") {
      interval = setInterval(() => {
        setTimerRemaining((prev) => {
          if (prev <= 1) {
            setTimerState("idle");
            if (timerMode === "study") {
              setTodayStudySeconds((t) => t + timerTotal);
              logStudyTimeApi(timerTotal, timerMode, "Completed Study session");
            } else if (timerMode === "pyq") {
              setTodayPyqSeconds((t) => t + timerTotal);
              logStudyTimeApi(timerTotal, timerMode, "Completed PYQ session");
            }
            triggerAlarm();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerState, timerMode, timerTotal, logStudyTimeApi]);

  // Web Audio Alarm Siren
  const initAudio = () => {
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        audioCtxRef.current = new AudioCtx();
      }
    } else if (audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume();
    }
  };

  const triggerAlarm = () => {
    initAudio();
    setIsAlarmActive(true);

    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const text = timerMode === "pyq" ? "PYQ SESSION COMPLETED! EXCELLENT WORK!" : "TIMER ENDED! GET BACK TO WORK IMMEDIATELY!";
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.1;
      utterance.volume = alarmVolume;
      window.speechSynthesis.speak(utterance);
    }

    if (audioCtxRef.current) {
      try {
        const ctx = audioCtxRef.current;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.5);

        gain.gain.setValueAtTime(alarmVolume * 0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + 0.5);
      } catch (e) {
        console.error("Audio synth error:", e);
      }
    }
  };

  const stopAlarm = () => {
    setIsAlarmActive(false);
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  };

  // Login handler
  const handleLogin = (e) => {
    e.preventDefault();
    if (passInput === PASSWORD) {
      localStorage.setItem("studytime_auth", "true");
      setAuthenticated(true);
      setPassError("");
    } else {
      setPassError("Incorrect password");
    }
  };

  // Cloud Timer Controls
  const togglePlayPause = async () => {
    initAudio();

    if (timerState === "running") {
      setTimerState("paused");
      fetch("/api/studytime", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: PASSWORD, action: "pause_timer" }),
      });
    } else if (timerState === "paused") {
      setTimerState("running");
      fetch("/api/studytime", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: PASSWORD, action: "resume_timer" }),
      });
    } else {
      setTimerState("running");
      fetch("/api/studytime", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          password: PASSWORD,
          action: "start_timer",
          durationSeconds: timerRemaining || timerTotal,
          mode: timerMode,
          webhookUrl,
        }),
      });
    }
  };

  const handleSelectMode = (mode, minutes) => {
    setTimerMode(mode);
    const secs = minutes * 60;
    setTimerTotal(secs);
    setTimerRemaining(secs);
    setTimerState("idle");
  };

  const handleResetTimer = () => {
    setTimerState("idle");
    setTimerRemaining(timerTotal);
    fetch("/api/studytime", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: PASSWORD, action: "cancel_timer" }),
    });
  };

  const handleSkipTimer = () => {
    setTimerState("idle");
    setTimerRemaining(0);
  };

  // Webhook save & test handlers
  const handleSaveWebhook = async () => {
    setSavingWebhook(true);
    try {
      const res = await fetch("/api/studytime", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          password: PASSWORD,
          action: "set_webhook",
          webhookUrl,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setWebhookMsg("Saved!");
        setWebhookStatus({ success: true, message: "Siren Webhook URL updated" });
        setTimeout(() => setWebhookMsg(""), 3000);
      }
    } catch (err) {
      console.error("Failed to save webhook:", err);
    } finally {
      setSavingWebhook(false);
    }
  };

  const handleTestWebhook = async () => {
    setWebhookMsg("Dispatching Siren...");
    setWebhookStatus(null);
    try {
      const res = await fetch("/api/studytime", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          password: PASSWORD,
          action: "test_webhook",
          webhookUrl,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setWebhookMsg("Siren Fired! 🚨");
        setWebhookStatus({
          success: true,
          message: "Siren alert dispatched successfully!",
        });
      } else {
        setWebhookMsg("Failed");
        setWebhookStatus({
          success: false,
          message: data.result?.error || data.error || "Failed to dispatch Siren alert",
        });
      }
    } catch (err) {
      console.error("Failed to test webhook:", err);
      setWebhookStatus({ success: false, message: "Error reaching server" });
    }
  };

  // Todo handlers
  const handleAddTodo = async (e) => {
    e.preventDefault();
    if (!newTodoText.trim()) return;

    try {
      const res = await fetch("/api/studytime", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          password: PASSWORD,
          action: "add_todo",
          text: newTodoText.trim(),
        }),
      });
      const data = await res.json();
      if (data.success && data.state) {
        setTodos(data.state.todos || []);
        setNewTodoText("");
      }
    } catch (err) {
      console.error("Failed to add todo:", err);
    }
  };

  const handleToggleTodo = async (id) => {
    try {
      const res = await fetch("/api/studytime", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          password: PASSWORD,
          action: "toggle_todo",
          id,
        }),
      });
      const data = await res.json();
      if (data.success && data.state) {
        setTodos(data.state.todos || []);
      }
    } catch (err) {
      console.error("Failed to toggle todo:", err);
    }
  };

  const handleDeleteTodo = async (id) => {
    try {
      const res = await fetch("/api/studytime", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          password: PASSWORD,
          action: "delete_todo",
          id,
        }),
      });
      const data = await res.json();
      if (data.success && data.state) {
        setTodos(data.state.todos || []);
      }
    } catch (err) {
      console.error("Failed to delete todo:", err);
    }
  };

  // Fetch session logs
  const fetchLogs = async () => {
    setLoadingLogs(true);
    try {
      const res = await fetch(`/api/studytime/logs?password=${PASSWORD}`);
      const data = await res.json();
      if (data.success) {
        setLogs(data.logs || []);
      }
    } catch (err) {
      console.error("Failed to fetch logs:", err);
    } finally {
      setLoadingLogs(false);
    }
  };

  // Format helpers
  const formatTimeDigits = (totalSecs) => {
    const h = Math.floor(totalSecs / 3600);
    const m = Math.floor((totalSecs % 3600) / 60);
    const s = totalSecs % 60;
    if (h > 0) {
      return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    }
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const formatHoursDecimal = (secs) => (secs / 3600).toFixed(2);

  // Goal calculations
  const studyGoalPercent = Math.min(100, Math.round((todayStudySeconds / dailyGoalSeconds) * 100));
  const remainingStudyGoalSecs = Math.max(0, dailyGoalSeconds - todayStudySeconds);

  const pyqGoalPercent = Math.min(100, Math.round((todayPyqSeconds / dailyPyqGoalSeconds) * 100));
  const remainingPyqGoalSecs = Math.max(0, dailyPyqGoalSeconds - todayPyqSeconds);

  // SVG Radial Ring Calculation
  const radius = 130;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (timerRemaining / (timerTotal || 1)) * circumference;

  // Max hours for chart scaling
  const maxChartHours = Math.max(
    13,
    ...weeklyHistory.map((d) => (d.studyHours || 0) + (d.pyqHours || 0))
  );

  // --- PASSWORD GATE SCREEN ---
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
                Study Time Tracker
              </h1>
              <p className="text-sm text-gray-500">
                Enter admin password to access dashboard & API
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
                    type={showPass ? "text" : "password"}
                    placeholder="Enter admin password"
                    className="input input-with-icon pr-12"
                    value={passInput}
                    onChange={(e) => {
                      setPassInput(e.target.value);
                      setPassError("");
                    }}
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute top-1/2 right-4 -translate-y-1/2 text-gray-400 transition-colors hover:text-gray-600"
                  >
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <AnimatePresence>
                {passError && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="rounded-xl bg-red-50 p-3 text-center text-xs font-medium text-red-500"
                  >
                    {passError}
                  </motion.p>
                )}
              </AnimatePresence>

              <button
                type="submit"
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-full bg-gray-900 py-3.5 text-sm font-semibold text-white transition-all hover:bg-gray-800"
              >
                <span>Unlock Tracker</span>
                <ArrowRight size={16} />
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    );
  }

  // --- MAIN DASHBOARD ---
  return (
    <div className="min-h-screen bg-[#f0f0f0] pb-24 text-gray-900">
      {/* Header Bar */}
      <div className="border-b border-[rgba(30,50,90,0.06)] bg-white">
        <div className="mx-auto max-w-5xl px-4 py-5 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-900 shadow-sm">
              <Zap size={22} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-gray-900">
                Study Time Tracker
              </h1>
              <p className="text-xs text-gray-500">
                AeroFocus 11h Study & 2h PYQ Tracker
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Live IST Clock */}
            <div className="hidden sm:flex items-center gap-2 rounded-xl border border-[rgba(30,50,90,0.08)] bg-gray-50 px-3.5 py-1.5 text-xs font-mono text-gray-700">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{istTimeStr || "00:00:00"}</span>
              <span className="text-[10px] text-gray-400 font-sans">IST</span>
            </div>

            <div className="hidden md:flex items-center gap-1 text-xs font-medium text-gray-500 rounded-xl border border-[rgba(30,50,90,0.08)] bg-gray-50 px-3 py-1.5">
              <Clock size={12} className="text-amber-500" />
              <span>Resets 8:00 AM IST</span>
            </div>

            {/* REST API Button */}
            <button
              onClick={() => {
                setShowApiModal(true);
                fetchLogs();
              }}
              className="flex items-center gap-1.5 rounded-full bg-gray-900 px-4 py-2 text-xs font-semibold text-white transition-all hover:bg-gray-800 shadow-sm"
            >
              <Code size={14} />
              <span>REST API</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="mx-auto max-w-5xl px-4 pt-6 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* ================= LEFT COLUMN: 11H STUDY & 2H PYQ TARGETS ================= */}
          <aside className="lg:col-span-4 space-y-6">
            {/* 11-Hour Study Target Card */}
            <div className="rounded-[2rem] border border-[rgba(30,50,90,0.05)] bg-white p-6 shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-900 text-sm font-bold tracking-wide uppercase">
                  <Sparkles size={16} className="text-emerald-600" />
                  <span>11h Study Goal</span>
                </div>
                <div className="flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
                  <Flame size={12} className="text-amber-500" />
                  <span>{streak}d</span>
                </div>
              </div>

              <div className="mb-4 grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                  <span className="block text-2xl font-black text-emerald-600">
                    {formatHoursDecimal(todayStudySeconds)}
                  </span>
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Hours Done</span>
                </div>

                <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                  <span className="block text-2xl font-black text-gray-900">
                    {(dailyGoalSeconds / 3600).toFixed(2)}
                  </span>
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Study Goal</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-gray-600 font-semibold">
                  <span>{studyGoalPercent}% Completed</span>
                  <span className="text-emerald-600 font-mono">
                    {Math.floor(remainingStudyGoalSecs / 3600)}h {Math.floor((remainingStudyGoalSecs % 3600) / 60)}m left
                  </span>
                </div>
                <div className="h-3 w-full rounded-full bg-gray-100 overflow-hidden relative">
                  <motion.div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${studyGoalPercent}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                  />
                </div>
              </div>
            </div>

            {/* 2-Hour PYQ Goal Target Card */}
            <div className="rounded-[2rem] border border-[rgba(30,50,90,0.05)] bg-white p-6 shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-900 text-sm font-bold tracking-wide uppercase">
                  <BookOpen size={16} className="text-indigo-600" />
                  <span>2h PYQ Goal</span>
                </div>
                <div className="flex items-center gap-1 text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-full">
                  <Flame size={12} className="text-indigo-500" />
                  <span>{streakPyq}d</span>
                </div>
              </div>

              <div className="mb-4 grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                  <span className="block text-2xl font-black text-indigo-600">
                    {formatHoursDecimal(todayPyqSeconds)}
                  </span>
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">PYQ Hours</span>
                </div>

                <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                  <span className="block text-2xl font-black text-gray-900">
                    {(dailyPyqGoalSeconds / 3600).toFixed(2)}
                  </span>
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">PYQ Goal</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-gray-600 font-semibold">
                  <span>{pyqGoalPercent}% Completed</span>
                  <span className="text-indigo-600 font-mono">
                    {Math.floor(remainingPyqGoalSecs / 3600)}h {Math.floor((remainingPyqGoalSecs % 3600) / 60)}m left
                  </span>
                </div>
                <div className="h-3 w-full rounded-full bg-gray-100 overflow-hidden relative">
                  <motion.div
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${pyqGoalPercent}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                  />
                </div>
              </div>
            </div>

            {/* Weekly Analytics Card */}
            <div className="rounded-[2rem] border border-[rgba(30,50,90,0.05)] bg-white p-6 shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-900 text-sm font-bold tracking-wide uppercase">
                  <Award size={16} className="text-indigo-600" />
                  <span>Weekly History</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-bold">
                  <span className="flex items-center gap-1 text-emerald-700">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" /> {weeklyStudyTotalHours}h Study
                  </span>
                  <span className="flex items-center gap-1 text-indigo-700">
                    <span className="h-2 w-2 rounded-full bg-indigo-500" /> {weeklyPyqTotalHours}h PYQ
                  </span>
                </div>
              </div>

              {/* Stacked Bar Chart */}
              <div className="mt-6 flex h-40 items-end justify-between gap-2 pt-4 px-1">
                {weeklyHistory.map((d) => {
                  const studyH = d.studyHours || 0;
                  const pyqH = d.pyqHours || 0;
                  const totalH = studyH + pyqH;
                  const studyPercent = Math.min(100, Math.max(4, (studyH / maxChartHours) * 100));
                  const pyqPercent = Math.min(100, Math.max(4, (pyqH / maxChartHours) * 100));
                  const isToday = d.date === currentStudyDay;

                  return (
                    <div key={d.date} className="flex flex-1 flex-col items-center gap-2 group">
                      <div className="relative w-full flex flex-col justify-end items-center h-28">
                        {/* PYQ Stack */}
                        {pyqH > 0 && (
                          <div
                            style={{ height: `${pyqPercent}%` }}
                            className="w-full max-w-[24px] rounded-t-md bg-indigo-500"
                          />
                        )}
                        {/* Study Stack */}
                        <div
                          style={{ height: `${studyPercent}%` }}
                          className={`w-full max-w-[24px] ${
                            pyqH > 0 ? "rounded-b-md" : "rounded-t-md"
                          } ${isToday ? "bg-gray-900 shadow-md shadow-gray-900/20" : "bg-emerald-600"}`}
                        />
                        <span className="opacity-0 group-hover:opacity-100 absolute -top-6 text-[10px] font-mono text-white bg-gray-900 px-1.5 py-0.5 rounded shadow transition-opacity whitespace-nowrap z-10">
                          {studyH}h + {pyqH}h PYQ
                        </span>
                      </div>
                      <span className={`text-[10px] font-bold ${isToday ? "text-gray-900 font-extrabold" : "text-gray-400"}`}>
                        {d.day}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Built-in Ntfy Siren Subscription Card */}
            <div className="rounded-[2rem] border border-emerald-200 bg-emerald-50/60 p-6 shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
              <div className="flex items-center gap-2 text-emerald-800 text-sm font-bold tracking-wide uppercase mb-2">
                <Smartphone size={18} className="text-emerald-600" />
                <span>Phone Siren Alerts</span>
              </div>
              <p className="text-xs text-emerald-700 mb-4 leading-relaxed">
                Subscribe to instant phone alerts when cloud timer ends! Open Ntfy app or browser link below.
              </p>
              <a
                href={DEFAULT_NTFY_TOPIC}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 rounded-full bg-emerald-600 py-2.5 px-4 text-xs font-bold text-white shadow-md hover:bg-emerald-700 transition-all"
              >
                <span>Subscribe on Phone (Ntfy)</span>
                <ExternalLink size={14} />
              </a>
            </div>
          </aside>

          {/* ================= CENTER COLUMN: TIMER & WEBHOOK ================= */}
          <section className="lg:col-span-8 space-y-6">
            {/* Timer Card */}
            <div className="rounded-[2rem] border border-[rgba(30,50,90,0.05)] bg-white p-8 shadow-[0_4px_24px_rgba(0,0,0,0.04)] flex flex-col items-center">
              {/* Cloud Running Badge */}
              <div className="mb-4 flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3.5 py-1 text-xs text-emerald-700 font-semibold">
                <Globe size={13} className="animate-spin text-emerald-600" />
                <span>Cloud Timer Engine (Runs even when browser is closed)</span>
              </div>

              {/* Mode Selector Tabs */}
              <div className="mb-8 flex items-center gap-2 rounded-2xl border border-[rgba(30,50,90,0.08)] bg-gray-50 p-1.5">
                {[
                  { mode: "study", min: 60, label: "1 Hr Study" },
                  { mode: "pyq", min: 30, label: "30m PYQ" },
                  { mode: "break10", min: 10, label: "10m Break" },
                  { mode: "break20", min: 20, label: "20m Break" },
                ].map((item) => (
                  <button
                    key={item.mode}
                    onClick={() => handleSelectMode(item.mode, item.min)}
                    className={`rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
                      timerMode === item.mode
                        ? item.mode === "pyq"
                          ? "bg-indigo-600 text-white shadow-sm"
                          : "bg-gray-900 text-white shadow-sm"
                        : "text-gray-500 hover:text-gray-900"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {/* Circular SVG Timer */}
              <div className="relative flex items-center justify-center my-4">
                <svg className="h-72 w-72 -rotate-90 transform" viewBox="0 0 300 300">
                  <circle
                    cx="150"
                    cy="150"
                    r={radius}
                    className="stroke-gray-100"
                    strokeWidth="12"
                    fill="transparent"
                  />
                  <motion.circle
                    cx="150"
                    cy="150"
                    r={radius}
                    className={
                      timerMode === "study"
                        ? "stroke-emerald-600"
                        : timerMode === "pyq"
                        ? "stroke-indigo-600"
                        : "stroke-gray-900"
                    }
                    strokeWidth="12"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    fill="transparent"
                    transition={{ duration: 0.5, ease: "linear" }}
                  />
                </svg>

                <div className="absolute flex flex-col items-center justify-center text-center">
                  <span className={`text-[11px] font-bold tracking-widest uppercase mb-1 ${
                    timerMode === "pyq" ? "text-indigo-600" : "text-emerald-600"
                  }`}>
                    {timerMode === "study"
                      ? "1 HOUR STUDY SESSION"
                      : timerMode === "pyq"
                      ? "30 MIN PYQ PRACTICE"
                      : "REST BREAK"}
                  </span>
                  <span className="font-mono text-5xl font-black tracking-tight text-gray-900">
                    {formatTimeDigits(timerRemaining)}
                  </span>
                  <span className="mt-2 text-xs font-medium text-gray-400">
                    {timerState === "running"
                      ? "Cloud Timer Active ⚡"
                      : timerState === "paused"
                      ? "Paused — Tap Play to resume"
                      : "Tap play to start cloud timer"}
                  </span>
                </div>
              </div>

              {/* Timer Controls */}
              <div className="mt-6 flex items-center gap-4">
                <button
                  onClick={handleResetTimer}
                  className="flex h-12 w-12 items-center justify-center rounded-full border border-gray-200 bg-gray-50 text-gray-600 transition-all hover:bg-gray-100 hover:text-gray-900 active:scale-95"
                  title="Reset Timer"
                >
                  <RotateCcw size={18} />
                </button>

                <button
                  onClick={togglePlayPause}
                  className={`flex h-16 w-16 items-center justify-center rounded-full text-white shadow-lg transition-all hover:scale-105 active:scale-95 ${
                    timerMode === "pyq" ? "bg-indigo-600 hover:bg-indigo-700" : "bg-gray-900 hover:bg-gray-800"
                  }`}
                  title={timerState === "running" ? "Pause" : "Play / Resume"}
                >
                  {timerState === "running" ? <Pause size={28} /> : <Play size={28} className="ml-1" />}
                </button>

                <button
                  onClick={handleSkipTimer}
                  className="flex h-12 w-12 items-center justify-center rounded-full border border-gray-200 bg-gray-50 text-gray-600 transition-all hover:bg-gray-100 hover:text-gray-900 active:scale-95"
                  title="Skip Timer"
                >
                  <SkipForward size={18} />
                </button>
              </div>
            </div>

            {/* Bottom Grid: Siren Webhook & Focus Tasks */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Siren Webhook Settings */}
              <div className="rounded-[2rem] border border-[rgba(30,50,90,0.05)] bg-white p-6 shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-900 text-sm font-bold tracking-wide uppercase">
                    <BellRing size={16} className="text-red-500" />
                    <span>Siren Webhook URL</span>
                  </div>
                  {webhookMsg && (
                    <span className="text-[10px] font-bold text-emerald-600">
                      {webhookMsg}
                    </span>
                  )}
                </div>

                <p className="text-xs text-gray-500 mb-3">
                  Custom Webhook URL (Discord, Telegram, Ntfy, Webhook Notifier). Built-in Ntfy Siren active by default!
                </p>

                <div className="space-y-3">
                  <input
                    type="url"
                    placeholder="https://ntfy.sh/..."
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                    className="w-full rounded-xl border border-[rgba(30,50,90,0.08)] bg-gray-50 px-3.5 py-2.5 text-xs text-gray-900 font-mono placeholder-gray-400 focus:border-gray-900 focus:outline-none"
                  />

                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveWebhook}
                      disabled={savingWebhook}
                      className="flex-1 rounded-xl bg-gray-900 py-2.5 text-xs font-bold text-white transition-all hover:bg-gray-800 disabled:opacity-50"
                    >
                      {savingWebhook ? "Saving..." : "Save Webhook"}
                    </button>
                    <button
                      onClick={handleTestWebhook}
                      className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-xs font-bold text-gray-700 hover:bg-gray-100 flex items-center gap-1.5"
                    >
                      <Send size={12} />
                      <span>Test Siren</span>
                    </button>
                  </div>

                  {webhookStatus && (
                    <div
                      className={`mt-2 flex items-center gap-2 rounded-xl p-2.5 text-xs font-medium ${
                        webhookStatus.success
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-red-50 text-red-600 border border-red-200"
                      }`}
                    >
                      {webhookStatus.success ? (
                        <CheckCircle2 size={14} className="text-emerald-600 flex-shrink-0" />
                      ) : (
                        <XCircle size={14} className="text-red-500 flex-shrink-0" />
                      )}
                      <span className="truncate">{webhookStatus.message}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Focus Tasks Checklist */}
              <div className="rounded-[2rem] border border-[rgba(30,50,90,0.05)] bg-white p-6 shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-900 text-sm font-bold tracking-wide uppercase">
                    <CheckSquare size={16} className="text-indigo-600" />
                    <span>Focus Tasks</span>
                  </div>
                  <span className="text-[11px] font-semibold text-gray-400">{todos.length} tasks</span>
                </div>

                <form onSubmit={handleAddTodo} className="mb-4 flex gap-2">
                  <input
                    type="text"
                    placeholder="Add focus item..."
                    value={newTodoText}
                    onChange={(e) => setNewTodoText(e.target.value)}
                    className="flex-1 rounded-xl border border-[rgba(30,50,90,0.08)] bg-gray-50 px-3.5 py-2 text-xs text-gray-900 placeholder-gray-400 focus:border-gray-900 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="rounded-xl bg-gray-900 px-3.5 py-2 text-white font-bold hover:bg-gray-800"
                  >
                    <Plus size={16} />
                  </button>
                </form>

                <div className="max-h-44 space-y-2 overflow-y-auto pr-1">
                  {todos.length === 0 ? (
                    <p className="py-6 text-center text-xs text-gray-400">No tasks added today</p>
                  ) : (
                    todos.map((todo) => (
                      <div
                        key={todo.id}
                        className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-3 py-2 text-xs"
                      >
                        <button
                          onClick={() => handleToggleTodo(todo.id)}
                          className="flex items-center gap-2.5 text-left flex-1"
                        >
                          <div
                            className={`flex h-4 w-4 items-center justify-center rounded-md border ${
                              todo.completed
                                ? "border-emerald-500 bg-emerald-500 text-white"
                                : "border-gray-300 bg-white"
                            }`}
                          >
                            {todo.completed && <Check size={12} />}
                          </div>
                          <span className={todo.completed ? "line-through text-gray-400" : "text-gray-800 font-medium"}>
                            {todo.text}
                          </span>
                        </button>
                        <button
                          onClick={() => handleDeleteTodo(todo.id)}
                          className="text-gray-400 hover:text-red-500 p-1"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* REST API MODAL */}
      <AnimatePresence>
        {showApiModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-3xl rounded-[2rem] border border-[rgba(30,50,90,0.05)] bg-white p-6 shadow-2xl max-h-[85vh] overflow-y-auto space-y-6 text-gray-900"
            >
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <div className="flex items-center gap-2.5">
                  <Code size={20} className="text-gray-900" />
                  <h2 className="text-lg font-bold text-gray-900">Study & PYQ REST API Documentation</h2>
                </div>
                <button
                  onClick={() => setShowApiModal(false)}
                  className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-900"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Instructions */}
              <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4 space-y-3">
                <h3 className="text-sm font-bold text-gray-900">GET State Response Summary Fields</h3>
                <p className="text-xs text-gray-500">
                  <code className="font-mono text-indigo-600 font-bold">GET /api/studytime?password=superstudiopro</code>
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono text-xs">
                  <div className="rounded-xl bg-gray-900 p-2.5 text-gray-200 border border-gray-800">
                    <span className="text-emerald-400 font-bold block">todayStudyHours & todayStudySeconds</span>
                    <span className="text-[10px] text-gray-400">Total study time completed today</span>
                  </div>
                  <div className="rounded-xl bg-gray-900 p-2.5 text-gray-200 border border-gray-800">
                    <span className="text-indigo-400 font-bold block">todayPyqHours & todayPyqSeconds</span>
                    <span className="text-[10px] text-gray-400">Total PYQ practice time completed today</span>
                  </div>
                  <div className="rounded-xl bg-gray-900 p-2.5 text-gray-200 border border-gray-800">
                    <span className="text-amber-400 font-bold block">weeklyStudyTotalHours & weeklyPyqTotalHours</span>
                    <span className="text-[10px] text-gray-400">Sum of past 7 days study & PYQ hours</span>
                  </div>
                  <div className="rounded-xl bg-gray-900 p-2.5 text-gray-200 border border-gray-800">
                    <span className="text-cyan-400 font-bold block">weeklyHistory</span>
                    <span className="text-[10px] text-gray-400">Array of past 7 days breakdown</span>
                  </div>
                </div>

                <h3 className="text-sm font-bold text-gray-900 pt-2">POST Actions (`POST /api/studytime`)</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono text-xs">
                  <div className="rounded-xl bg-gray-900 p-2.5 text-gray-200 border border-gray-800">
                    <span className="text-emerald-400 font-bold block">action: &quot;log&quot;</span>
                    <span className="text-[10px] text-gray-400">{`{"seconds": 1800, "mode": "pyq"}`}</span>
                  </div>
                  <div className="rounded-xl bg-gray-900 p-2.5 text-gray-200 border border-gray-800">
                    <span className="text-indigo-400 font-bold block">action: &quot;set_pyq_seconds&quot;</span>
                    <span className="text-[10px] text-gray-400">{`{"seconds": 3600}`}</span>
                  </div>
                  <div className="rounded-xl bg-gray-900 p-2.5 text-gray-200 border border-gray-800">
                    <span className="text-amber-400 font-bold block">action: &quot;start_timer&quot;</span>
                    <span className="text-[10px] text-gray-400">{`{"durationSeconds": 1800, "mode": "pyq"}`}</span>
                  </div>
                  <div className="rounded-xl bg-gray-900 p-2.5 text-gray-200 border border-gray-800">
                    <span className="text-cyan-400 font-bold block">action: &quot;set_pyq_goal&quot;</span>
                    <span className="text-[10px] text-gray-400">{`{"pyqGoalSeconds": 7200}`}</span>
                  </div>
                </div>
              </div>

              {/* Recent Logs Table */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Recent Session Logs</h3>
                <div className="max-h-48 overflow-y-auto rounded-2xl border border-gray-100 bg-gray-50 p-2">
                  {loadingLogs ? (
                    <p className="p-4 text-center text-xs text-gray-400">Loading session logs...</p>
                  ) : logs.length === 0 ? (
                    <p className="p-4 text-center text-xs text-gray-400">No session logs recorded yet</p>
                  ) : (
                    <table className="w-full text-left text-xs font-mono">
                      <thead>
                        <tr className="border-b border-gray-200 text-gray-400 text-[10px]">
                          <th className="p-2">Time</th>
                          <th className="p-2">Mode</th>
                          <th className="p-2">Duration</th>
                          <th className="p-2">Source</th>
                        </tr>
                      </thead>
                      <tbody>
                        {logs.map((log) => (
                          <tr key={log.id} className="border-b border-gray-100 hover:bg-gray-100/50">
                            <td className="p-2 text-gray-500">
                              {new Date(log.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </td>
                            <td className={`p-2 font-bold capitalize ${
                              log.mode === "pyq" ? "text-indigo-600" : "text-emerald-600"
                            }`}>{log.mode || "study"}</td>
                            <td className="p-2 text-gray-900 font-bold">{Math.round(log.seconds / 60)} mins</td>
                            <td className="p-2 text-gray-400 text-[10px] uppercase">{log.source || "api"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
