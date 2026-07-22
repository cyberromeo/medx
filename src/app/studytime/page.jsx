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
  Volume2,
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
} from "lucide-react";

const PASSWORD = "superstudiopro";
const DAILY_GOAL_DEFAULT = 11 * 3600; // 11 hours

export default function StudyTimePage() {
  // Auth state
  const [authenticated, setAuthenticated] = useState(false);
  const [passInput, setPassInput] = useState("");
  const [passError, setPassError] = useState("");
  const [showPass, setShowPass] = useState(false);

  // App state
  const [loading, setLoading] = useState(true);
  const [todayStudySeconds, setTodayStudySeconds] = useState(0);
  const [dailyGoalSeconds, setDailyGoalSeconds] = useState(DAILY_GOAL_DEFAULT);
  const [currentStudyDay, setCurrentStudyDay] = useState("");
  const [history, setHistory] = useState({});
  const [streak, setStreak] = useState(0);
  const [todos, setTodos] = useState([]);
  const [webhookUrl, setWebhookUrl] = useState("");
  const [savingWebhook, setSavingWebhook] = useState(false);
  const [webhookMsg, setWebhookMsg] = useState("");

  // Timer state
  const [timerMode, setTimerMode] = useState("study"); // 'study', 'break10', 'break20'
  const [timerTotal, setTimerTotal] = useState(3600); // 1 hr default
  const [timerRemaining, setTimerRemaining] = useState(3600);
  const [timerState, setTimerState] = useState("idle"); // 'idle', 'running', 'paused'

  // Alarm & Sound state
  const [audioInitialized, setAudioInitialized] = useState(false);
  const [alarmVolume, setAlarmVolume] = useState(1.0);
  const [isAlarmActive, setIsAlarmActive] = useState(false);
  const [brownPlaying, setBrownPlaying] = useState(false);
  const [pinkPlaying, setPinkPlaying] = useState(false);
  const [brownVol, setBrownVol] = useState(0.5);
  const [pinkVol, setPinkVol] = useState(0.5);

  // Todo input
  const [newTodoText, setNewTodoText] = useState("");

  // API Modal state
  const [showApiModal, setShowApiModal] = useState(false);
  const [copiedCmd, setCopiedCmd] = useState("");
  const [logs, setLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  // Live IST Clock
  const [istTimeStr, setIstTimeStr] = useState("");

  // Refs for Web Audio API
  const audioCtxRef = useRef(null);
  const brownNodeRef = useRef(null);
  const pinkNodeRef = useRef(null);

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
        setDailyGoalSeconds(data.state.dailyGoalSeconds || DAILY_GOAL_DEFAULT);
        setCurrentStudyDay(data.state.currentStudyDay || "");
        setHistory(data.state.history || {});
        setStreak(data.state.streak || 0);
        setTodos(data.state.todos || []);
        setWebhookUrl(data.state.webhookUrl || "");

        // Sync Cloud Active Timer
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
          } else {
            setTimerRemaining(active.secondsRemaining || active.durationSeconds);
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
      // Poll every 10 seconds to keep cloud sync alive
      const syncInterval = setInterval(fetchState, 10000);
      return () => clearInterval(syncInterval);
    }
  }, [authenticated, fetchState]);

  // Log study time to API
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
        setTodayStudySeconds(data.state.todayStudySeconds);
        setHistory(data.state.history || {});
        setStreak(data.state.streak || 0);
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
              logStudyTimeApi(timerTotal, timerMode, "Completed timer session");
            }
            triggerAlarm();
            return 0;
          }
          if (timerMode === "study") {
            setTodayStudySeconds((t) => t + 1);
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerState, timerMode, timerTotal, logStudyTimeApi]);

  // Web Audio & Alarm Logic
  const initAudio = () => {
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        audioCtxRef.current = new AudioCtx();
        setAudioInitialized(true);
      }
    } else if (audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume();
      setAudioInitialized(true);
    }
  };

  const triggerAlarm = () => {
    initAudio();
    setIsAlarmActive(true);

    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance("TIMER ENDED! GET BACK TO WORK IMMEDIATELY!");
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

  // Ambient Sound Generator
  const toggleAmbientNoise = (type) => {
    initAudio();
    const ctx = audioCtxRef.current;
    if (!ctx) return;

    if (type === "brown") {
      if (brownPlaying) {
        if (brownNodeRef.current) brownNodeRef.current.disconnect();
        setBrownPlaying(false);
      } else {
        const bufferSize = 2 * ctx.sampleRate;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        let lastOut = 0.0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          output[i] = (lastOut + 0.02 * white) / 1.02;
          lastOut = output[i];
          output[i] *= 3.5;
        }

        const brownNoise = ctx.createBufferSource();
        brownNoise.buffer = noiseBuffer;
        brownNoise.loop = true;

        const gainNode = ctx.createGain();
        gainNode.gain.setValueAtTime(brownVol * 0.15, ctx.currentTime);

        brownNoise.connect(gainNode);
        gainNode.connect(ctx.destination);

        brownNoise.start();
        brownNodeRef.current = brownNoise;
        setBrownPlaying(true);
      }
    } else if (type === "pink") {
      if (pinkPlaying) {
        if (pinkNodeRef.current) pinkNodeRef.current.disconnect();
        setPinkPlaying(false);
      } else {
        const bufferSize = 2 * ctx.sampleRate;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          b0 = 0.99886 * b0 + white * 0.0555179;
          b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.96900 * b2 + white * 0.1538520;
          b3 = 0.86650 * b3 + white * 0.3104856;
          b4 = 0.55000 * b4 + white * 0.5329522;
          b5 = -0.7616 * b5 - white * 0.0168980;
          output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
          output[i] *= 0.11;
          b6 = white * 0.115926;
        }

        const pinkNoise = ctx.createBufferSource();
        pinkNoise.buffer = noiseBuffer;
        pinkNoise.loop = true;

        const gainNode = ctx.createGain();
        gainNode.gain.setValueAtTime(pinkVol * 0.15, ctx.currentTime);

        pinkNoise.connect(gainNode);
        gainNode.connect(ctx.destination);

        pinkNoise.start();
        pinkNodeRef.current = pinkNoise;
        setPinkPlaying(true);
      }
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

  // Cloud Timer Start / Toggle
  const togglePlayPause = async () => {
    initAudio();
    if (timerState === "running") {
      setTimerState("paused");
      fetch("/api/studytime", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: PASSWORD, action: "pause_timer" }),
      });
    } else {
      setTimerState("running");
      // Start Cloud Timer in backend!
      fetch("/api/studytime", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          password: PASSWORD,
          action: "start_timer",
          durationSeconds: timerTotal,
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
        setTimeout(() => setWebhookMsg(""), 3000);
      }
    } catch (err) {
      console.error("Failed to save webhook:", err);
    } finally {
      setSavingWebhook(false);
    }
  };

  const handleTestWebhook = async () => {
    try {
      setWebhookMsg("Sending test siren...");
      await fetch("/api/studytime", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          password: PASSWORD,
          action: "test_webhook",
          webhookUrl,
        }),
      });
      setWebhookMsg("Siren Webhook Sent! 🚨");
      setTimeout(() => setWebhookMsg(""), 4000);
    } catch (err) {
      console.error("Failed to test webhook:", err);
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

  // Fetch session logs for API modal
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

  const goalPercent = Math.min(100, Math.round((todayStudySeconds / dailyGoalSeconds) * 100));
  const remainingGoalSecs = Math.max(0, dailyGoalSeconds - todayStudySeconds);

  // SVG Radial Ring Calculation
  const radius = 130;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (timerRemaining / timerTotal) * circumference;

  // Past 7 days history
  const getLast7Days = () => {
    const result = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      const dateKey = `${yyyy}-${mm}-${dd}`;
      const dayLabel = d.toLocaleDateString("en-US", { weekday: "short" });
      const seconds = history[dateKey] || (dateKey === currentStudyDay ? todayStudySeconds : 0);
      result.push({ dateKey, dayLabel, hours: seconds / 3600 });
    }
    return result;
  };

  // --- PASSWORD GATE SCREEN ---
  if (!authenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0e1a] p-4 text-slate-100">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-sm"
        >
          <div className="rounded-3xl border border-slate-800 bg-[#111827] p-8 shadow-2xl backdrop-blur-xl">
            <div className="mb-8 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-400 shadow-inner">
                <Shield size={32} />
              </div>
              <h1 className="mb-2 text-2xl font-bold tracking-tight text-white">
                AeroFocus Study Time
              </h1>
              <p className="text-xs text-slate-400">
                Enter admin password (`superstudiopro`) to access dashboard & API
              </p>
            </div>

            <form onSubmit={handleLogin} className="flex flex-col gap-4">
              <div>
                <label className="ml-1 text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                  Password
                </label>
                <div className="relative mt-1">
                  <Lock
                    size={16}
                    className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-slate-500"
                  />
                  <input
                    type={showPass ? "text" : "password"}
                    placeholder="Enter password"
                    className="w-full rounded-2xl border border-slate-700 bg-slate-900/80 px-11 py-3 text-sm text-white placeholder-slate-500 transition-all focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
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
                    className="absolute top-1/2 right-4 -translate-y-1/2 text-slate-500 hover:text-slate-300"
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
                    className="rounded-xl bg-red-500/10 p-3 text-center text-xs font-medium text-red-400 border border-red-500/20"
                  >
                    {passError}
                  </motion.p>
                )}
              </AnimatePresence>

              <button
                type="submit"
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-cyan-500/25 transition-all hover:brightness-110 active:scale-[0.98]"
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

  // --- MAIN AEROFOCUS DASHBOARD ---
  const chartData = getLast7Days();
  const maxChartHours = Math.max(12, ...chartData.map((d) => d.hours));

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-slate-100 selection:bg-cyan-500 selection:text-black">
      {/* Background Ambient Glow Effects */}
      <div className="pointer-events-none fixed top-0 left-1/4 h-96 w-96 rounded-full bg-cyan-500/10 blur-[120px]" />
      <div className="pointer-events-none fixed top-1/3 right-1/4 h-96 w-96 rounded-full bg-purple-500/10 blur-[120px]" />

      {/* Header Bar */}
      <header className="sticky top-0 z-30 border-b border-slate-800/80 bg-[#0a0e1a]/80 backdrop-blur-md px-6 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/20">
              <Zap size={20} className="text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold tracking-wider text-white text-lg">
                  AERO<span className="text-cyan-400">FOCUS</span>
                </span>
                <span className="rounded-full bg-cyan-500/10 px-2 py-0.5 text-[10px] font-bold text-cyan-400 border border-cyan-500/20">
                  v1.0
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Cloud Timer & Siren Webhook Engine</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Live IST Clock */}
            <div className="hidden sm:flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/60 px-4 py-1.5 text-xs font-mono text-slate-300">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{istTimeStr || "00:00:00"}</span>
              <span className="text-[10px] text-slate-500 font-sans">IST</span>
            </div>

            <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-400 rounded-full border border-slate-800 bg-slate-900/40 px-3 py-1.5">
              <Clock size={12} className="text-amber-400" />
              <span>Resets 8:00 AM IST</span>
            </div>

            {/* REST API Button */}
            <button
              onClick={() => {
                setShowApiModal(true);
                fetchLogs();
              }}
              className="flex items-center gap-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-1.5 text-xs font-semibold text-cyan-400 transition-all hover:bg-cyan-500/20"
            >
              <Code size={14} />
              <span>REST API</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Grid */}
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* ================= LEFT COLUMN ================= */}
          <aside className="lg:col-span-4 space-y-6">
            {/* Daily Target Card */}
            <div className="rounded-3xl border border-slate-800/80 bg-[#111827]/80 p-6 shadow-xl backdrop-blur-xl">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2 text-cyan-400 text-sm font-bold tracking-wide uppercase">
                  <Sparkles size={16} />
                  <span>Daily Target</span>
                </div>
                <span className="text-xs text-slate-400">Goal: 11 hrs</span>
              </div>

              <div className="mb-4 grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
                  <span className="block text-2xl font-black text-cyan-400">
                    {formatHoursDecimal(todayStudySeconds)}
                  </span>
                  <span className="text-[11px] font-medium text-slate-400">Hours Done</span>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
                  <span className="block text-2xl font-black text-purple-400">
                    {(dailyGoalSeconds / 3600).toFixed(2)}
                  </span>
                  <span className="text-[11px] font-medium text-slate-400">Hour Goal</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-slate-300">
                  <span className="font-semibold">{goalPercent}% Completed</span>
                  <span className="text-cyan-400 font-mono">
                    {Math.floor(remainingGoalSecs / 3600)}h {Math.floor((remainingGoalSecs % 3600) / 60)}m left
                  </span>
                </div>
                <div className="h-3 w-full rounded-full bg-slate-800 overflow-hidden relative">
                  <motion.div
                    className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${goalPercent}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                  />
                </div>
              </div>
            </div>

            {/* Weekly Analytics Card */}
            <div className="rounded-3xl border border-slate-800/80 bg-[#111827]/80 p-6 shadow-xl backdrop-blur-xl">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2 text-purple-400 text-sm font-bold tracking-wide uppercase">
                  <Award size={16} />
                  <span>Weekly History</span>
                </div>
                <div className="flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-400 border border-amber-500/20">
                  <Flame size={14} />
                  <span>{streak} Day Streak</span>
                </div>
              </div>

              {/* Bar Chart */}
              <div className="mt-6 flex h-40 items-end justify-between gap-2 pt-4 px-2">
                {chartData.map((d) => {
                  const heightPercent = Math.min(100, Math.max(8, (d.hours / maxChartHours) * 100));
                  const isToday = d.dateKey === currentStudyDay;
                  return (
                    <div key={d.dateKey} className="flex flex-1 flex-col items-center gap-2 group">
                      <div className="relative w-full flex items-end justify-center h-28">
                        <div
                          style={{ height: `${heightPercent}%` }}
                          className={`w-full max-w-[28px] rounded-t-lg transition-all duration-500 ${
                            isToday
                              ? "bg-gradient-to-t from-cyan-600 to-cyan-400 shadow-lg shadow-cyan-500/30"
                              : "bg-slate-800 group-hover:bg-slate-700"
                          }`}
                        />
                        <span className="opacity-0 group-hover:opacity-100 absolute -top-6 text-[10px] font-mono text-cyan-300 bg-slate-900 border border-slate-700 px-1.5 py-0.5 rounded transition-opacity">
                          {d.hours.toFixed(1)}h
                        </span>
                      </div>
                      <span className={`text-[10px] font-medium ${isToday ? "text-cyan-400 font-bold" : "text-slate-500"}`}>
                        {d.dayLabel}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Ambient Sound Mixer */}
            <div className="rounded-3xl border border-slate-800/80 bg-[#111827]/80 p-6 shadow-xl backdrop-blur-xl">
              <div className="mb-4 flex items-center gap-2 text-slate-300 text-sm font-bold tracking-wide uppercase">
                <Volume2 size={16} className="text-cyan-400" />
                <span>Ambient Sound Mixer</span>
              </div>

              <div className="space-y-4">
                <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-3.5 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-white">Deep Focus (Brown)</p>
                    <p className="text-[10px] text-slate-500">Subtle low frequency noise</p>
                  </div>
                  <button
                    onClick={() => toggleAmbientNoise("brown")}
                    className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all ${
                      brownPlaying
                        ? "bg-cyan-500 text-black shadow-md shadow-cyan-500/30"
                        : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                    }`}
                  >
                    {brownPlaying ? "Stop" : "Play"}
                  </button>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-3.5 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-white">Rain (Pink Noise)</p>
                    <p className="text-[10px] text-slate-500">Soothing natural sound</p>
                  </div>
                  <button
                    onClick={() => toggleAmbientNoise("pink")}
                    className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all ${
                      pinkPlaying
                        ? "bg-purple-500 text-white shadow-md shadow-purple-500/30"
                        : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                    }`}
                  >
                    {pinkPlaying ? "Stop" : "Play"}
                  </button>
                </div>
              </div>
            </div>
          </aside>

          {/* ================= CENTER COLUMN: TIMER & WEBHOOKS ================= */}
          <section className="lg:col-span-8 space-y-6">
            {/* Timer Card */}
            <div className="rounded-3xl border border-slate-800/80 bg-[#111827]/80 p-8 shadow-xl backdrop-blur-xl flex flex-col items-center">
              {/* Cloud Running Badge */}
              <div className="mb-4 flex items-center gap-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 px-3.5 py-1 text-xs text-cyan-400 font-semibold">
                <Globe size={13} className="animate-spin text-cyan-400" />
                <span>Cloud Timer Engine (Runs even when browser is closed)</span>
              </div>

              {/* Mode Selector Tabs */}
              <div className="mb-8 flex items-center gap-2 rounded-2xl border border-slate-800 bg-slate-900/80 p-1.5">
                {[
                  { mode: "study", min: 60, label: "1 Hr Study" },
                  { mode: "break10", min: 10, label: "10m Break" },
                  { mode: "break20", min: 20, label: "20m Break" },
                ].map((item) => (
                  <button
                    key={item.mode}
                    onClick={() => handleSelectMode(item.mode, item.min)}
                    className={`rounded-xl px-5 py-2.5 text-xs font-bold transition-all ${
                      timerMode === item.mode
                        ? "bg-cyan-500 text-black shadow-lg shadow-cyan-500/25"
                        : "text-slate-400 hover:text-white"
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
                    className="stroke-slate-800/80"
                    strokeWidth="12"
                    fill="transparent"
                  />
                  <motion.circle
                    cx="150"
                    cy="150"
                    r={radius}
                    className={timerMode === "study" ? "stroke-cyan-400" : "stroke-purple-400"}
                    strokeWidth="12"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    fill="transparent"
                    transition={{ duration: 0.5, ease: "linear" }}
                  />
                </svg>

                <div className="absolute flex flex-col items-center justify-center text-center">
                  <span className="text-[11px] font-bold tracking-widest text-cyan-400 uppercase mb-1">
                    {timerMode === "study" ? "FOCUS SESSION" : "REST BREAK"}
                  </span>
                  <span className="font-mono text-5xl font-black tracking-tight text-white">
                    {formatTimeDigits(timerRemaining)}
                  </span>
                  <span className="mt-2 text-xs font-medium text-slate-400">
                    {timerState === "running"
                      ? "Cloud Timer Running ⚡"
                      : timerState === "paused"
                      ? "Session paused"
                      : "Tap play to start cloud timer"}
                  </span>
                </div>
              </div>

              {/* Timer Controls */}
              <div className="mt-6 flex items-center gap-4">
                <button
                  onClick={handleResetTimer}
                  className="flex h-12 w-12 items-center justify-center rounded-full border border-slate-700 bg-slate-800 text-slate-300 transition-all hover:bg-slate-700 hover:text-white active:scale-95"
                  title="Reset Timer"
                >
                  <RotateCcw size={18} />
                </button>

                <button
                  onClick={togglePlayPause}
                  className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 text-white shadow-xl shadow-cyan-500/30 transition-all hover:scale-105 active:scale-95"
                  title={timerState === "running" ? "Pause" : "Play"}
                >
                  {timerState === "running" ? <Pause size={28} /> : <Play size={28} className="ml-1" />}
                </button>

                <button
                  onClick={handleSkipTimer}
                  className="flex h-12 w-12 items-center justify-center rounded-full border border-slate-700 bg-slate-800 text-slate-300 transition-all hover:bg-slate-700 hover:text-white active:scale-95"
                  title="Skip Timer"
                >
                  <SkipForward size={18} />
                </button>
              </div>
            </div>

            {/* Bottom Grid: Siren Webhook & Focus Tasks */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Cloud Siren Webhook Settings */}
              <div className="rounded-3xl border border-slate-800/80 bg-[#111827]/80 p-6 shadow-xl backdrop-blur-xl">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-cyan-400 text-sm font-bold tracking-wide uppercase">
                    <BellRing size={16} />
                    <span>Siren Webhook URL</span>
                  </div>
                  {webhookMsg && (
                    <span className="text-[10px] font-bold text-emerald-400 animate-pulse">
                      {webhookMsg}
                    </span>
                  )}
                </div>

                <p className="text-[11px] text-slate-400 mb-3">
                  Paste your Discord, Telegram, n8n, or IFTTT Webhook URL. When the cloud timer completes (even if browser is closed), the siren payload is sent instantly!
                </p>

                <div className="space-y-3">
                  <input
                    type="url"
                    placeholder="https://discord.com/api/webhooks/..."
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:border-cyan-500 focus:outline-none"
                  />

                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveWebhook}
                      disabled={savingWebhook}
                      className="flex-1 rounded-xl bg-cyan-500 py-2 text-xs font-bold text-black hover:brightness-110 disabled:opacity-50"
                    >
                      {savingWebhook ? "Saving..." : "Save Webhook"}
                    </button>
                    <button
                      onClick={handleTestWebhook}
                      className="rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2 text-xs font-bold text-slate-200 hover:bg-slate-700 flex items-center gap-1"
                    >
                      <Send size={12} />
                      <span>Test</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Focus Tasks Checklist */}
              <div className="rounded-3xl border border-slate-800/80 bg-[#111827]/80 p-6 shadow-xl backdrop-blur-xl">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-purple-400 text-sm font-bold tracking-wide uppercase">
                    <Check size={16} />
                    <span>Focus Tasks</span>
                  </div>
                  <span className="text-[11px] text-slate-500">{todos.length} tasks</span>
                </div>

                <form onSubmit={handleAddTodo} className="mb-4 flex gap-2">
                  <input
                    type="text"
                    placeholder="Add focus item..."
                    value={newTodoText}
                    onChange={(e) => setNewTodoText(e.target.value)}
                    className="flex-1 rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="rounded-xl bg-cyan-500 px-3 py-2 text-black font-bold hover:brightness-110"
                  >
                    <Plus size={16} />
                  </button>
                </form>

                <div className="max-h-44 space-y-2 overflow-y-auto pr-1">
                  {todos.length === 0 ? (
                    <p className="py-6 text-center text-xs text-slate-600">No tasks added today</p>
                  ) : (
                    todos.map((todo) => (
                      <div
                        key={todo.id}
                        className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/50 px-3 py-2 text-xs"
                      >
                        <button
                          onClick={() => handleToggleTodo(todo.id)}
                          className="flex items-center gap-2.5 text-left flex-1"
                        >
                          <div
                            className={`flex h-4 w-4 items-center justify-center rounded-md border ${
                              todo.completed
                                ? "border-cyan-500 bg-cyan-500 text-black"
                                : "border-slate-600 bg-slate-800"
                            }`}
                          >
                            {todo.completed && <Check size={12} />}
                          </div>
                          <span className={todo.completed ? "line-through text-slate-500" : "text-slate-200"}>
                            {todo.text}
                          </span>
                        </button>
                        <button
                          onClick={() => handleDeleteTodo(todo.id)}
                          className="text-slate-600 hover:text-red-400 p-1"
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
      </main>

      {/* REST API MODAL */}
      <AnimatePresence>
        {showApiModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-3xl rounded-3xl border border-slate-800 bg-[#111827] p-6 shadow-2xl max-h-[85vh] overflow-y-auto space-y-6 text-slate-200"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2.5">
                  <Code size={20} className="text-cyan-400" />
                  <h2 className="text-lg font-bold text-white">Cloud Timer & Webhook REST API</h2>
                </div>
                <button
                  onClick={() => setShowApiModal(false)}
                  className="rounded-full p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Instructions */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 space-y-3">
                <h3 className="text-sm font-bold text-cyan-400">Cloud Timer API Actions</h3>
                <p className="text-xs text-slate-400">
                  Pass <code className="text-amber-300 font-mono">password=superstudiopro</code> in request body.
                </p>

                {/* Cloud Timer Start */}
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">1. Start Cloud Timer (Runs on cloud)</span>
                  <div className="rounded-xl bg-slate-950 p-3 font-mono text-xs text-cyan-300 border border-slate-800 space-y-1">
                    <pre className="text-slate-300 text-[11px]">
{`POST /api/studytime
{
  "password": "superstudiopro",
  "action": "start_timer",
  "durationSeconds": 3600,
  "mode": "study",
  "webhookUrl": "https://discord.com/api/webhooks/..."
}`}
                    </pre>
                  </div>
                </div>

                {/* Set Webhook */}
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">2. Set Siren Webhook Endpoint</span>
                  <div className="rounded-xl bg-slate-950 p-3 font-mono text-xs text-amber-300 border border-slate-800 space-y-1">
                    <pre className="text-slate-300 text-[11px]">
{`POST /api/studytime
{
  "password": "superstudiopro",
  "action": "set_webhook",
  "webhookUrl": "https://..."
}`}
                    </pre>
                  </div>
                </div>
              </div>

              {/* Recent Logs Table */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Recent Session Logs</h3>
                <div className="max-h-48 overflow-y-auto rounded-2xl border border-slate-800 bg-slate-950 p-2">
                  {loadingLogs ? (
                    <p className="p-4 text-center text-xs text-slate-500">Loading session logs...</p>
                  ) : logs.length === 0 ? (
                    <p className="p-4 text-center text-xs text-slate-500">No session logs recorded yet</p>
                  ) : (
                    <table className="w-full text-left text-xs font-mono">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-500 text-[10px]">
                          <th className="p-2">Time</th>
                          <th className="p-2">Mode</th>
                          <th className="p-2">Duration</th>
                          <th className="p-2">Source</th>
                        </tr>
                      </thead>
                      <tbody>
                        {logs.map((log) => (
                          <tr key={log.id} className="border-b border-slate-900/60 hover:bg-slate-900/40">
                            <td className="p-2 text-slate-400">
                              {new Date(log.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </td>
                            <td className="p-2 text-cyan-400 capitalize">{log.mode || "study"}</td>
                            <td className="p-2 text-white font-bold">{Math.round(log.seconds / 60)} mins</td>
                            <td className="p-2 text-slate-500 text-[10px] uppercase">{log.source || "api"}</td>
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
