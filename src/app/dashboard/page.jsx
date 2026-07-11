"use client";

import { useEffect, useState, useRef } from "react";
import { ClipboardList } from "lucide-react";
import { auth, db } from "@/lib/firebase";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Flame, Target, Star, Zap, ArrowRight, X, ChevronLeft, Award } from "lucide-react";
import SeriesCard from "@/components/SeriesCard";
import { getProgress, calculateLevel, getXpToNextLevel, getLevelTitle, claimDailyLoginXp } from "@/lib/progress";

// Animated number counter hook
function useAnimatedCounter(target, duration = 1200) {
  const [count, setCount] = useState(0);
  const prevTarget = useRef(0);

  useEffect(() => {
    if (target === prevTarget.current) return;
    const start = prevTarget.current;
    prevTarget.current = target;
    const diff = target - start;
    if (diff === 0) return;

    const startTime = performance.now();
    const step = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(start + diff * eased));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration]);

  return count;
}

// FMGE Countdown Widget
function FmgeCountdown() {
  const TARGET = new Date("2026-06-28T09:00:00+05:30").getTime();
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    const calc = () => {
      const diff = Math.max(0, TARGET - Date.now());
      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const m = Math.floor((diff / (1000 * 60)) % 60);
      const s = Math.floor((diff / 1000) % 60);
      setTimeLeft({ d, h, m, s, total: diff });
    };
    calc();
    const id = setInterval(calc, 1000);
    return () => clearInterval(id);
  }, []);

  if (!timeLeft) return null;

  const units = [
    { label: "Days", value: timeLeft.d },
    { label: "Hrs", value: timeLeft.h },
    { label: "Min", value: timeLeft.m },
    { label: "Sec", value: timeLeft.s },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="mb-8 sm:mb-10"
    >
      <div className="countdown-shell p-5 sm:p-6">
        <div className="relative z-10">
          <div className="text-center mb-5">
            <h2 className="text-xl sm:text-2xl font-black font-display tracking-wide text-gradient">
              FMGE JUNE 2026
            </h2>
            <p className="text-[11px] text-gray-500 mt-1 tracking-widest uppercase">June 28 - 9:00 AM IST</p>
          </div>

          <div className="flex items-center justify-center gap-2 sm:gap-3">
            {units.map((u, i) => (
              <div key={u.label} className="flex items-center gap-2 sm:gap-3">
                <div className="text-center">
                  <div className="countdown-unit">
                    <p className={`countdown-value tabular-nums ${u.label === "Sec" ? "animate-pulse" : ""}`}>
                      {String(u.value).padStart(2, "0")}
                    </p>
                  </div>
                  <p className="countdown-label">{u.label}</p>
                </div>
                {i < units.length - 1 && <span className="text-xl sm:text-2xl font-bold -mt-4 sm:-mt-5 text-primary/40">:</span>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [progress, setProgress] = useState({ watched: [], xp: 0, streak: 0, lastWatch: null, todayXp: 0 });
  const router = useRouter();

  const MIST_SUBJECTS = [
    "Anatomy", "Physiology", "Biochemistry", "Pathology",
    "Microbiology", "Pharmacology", "Forensic medicine",
    "Community Medicine (PSM)", "General Medicine", "General Surgery",
    "Obstetrics & Gynecology (OBG)", "Pediatrics", "Ophthalmology",
    "Otorhinolaryngology (ENT)", "Orthopedics", "Anesthesiology",
    "Dermatology & Venereology", "Psychiatry", "Radiodiagnosis (Radiology)"
  ];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        await fetchVideos();
        await claimDailyLoginXp(currentUser.uid);
        const userProgress = await getProgress(currentUser.uid);
        setProgress(userProgress);
        setLoading(false);
      } else {
        router.push("/login");
      }
    });
    return () => unsubscribe();
  }, [router]);

  const fetchVideos = async () => {
    try {
      const q = query(
        collection(db, "videos"),
        orderBy("createdAt", "desc"),
        limit(1000)
      );
      const snapshot = await getDocs(q);
      const docs = snapshot.docs.map(doc => ({ $id: doc.id, ...doc.data() }));
      setVideos(docs);
    } catch (err) {
      console.error(err);
    }
  };

  const countVideos = (category) => videos.filter(v => v.category === category).length;
  const countWatched = (category) => videos.filter(v => v.category === category && progress.watched.includes(v.$id)).length;
  const getCategoryProgress = (category) => {
    const total = countVideos(category);
    const watched = countWatched(category);
    return total > 0 ? Math.round((watched / total) * 100) : 0;
  };

  const level = calculateLevel(progress.xp);
  const levelTitle = getLevelTitle(level);
  const xpProgress = getXpToNextLevel(progress.xp);
  const totalWatched = progress.watched.length;
  const totalVideos = videos.length;
  const overallProgress = totalVideos > 0 ? Math.round((totalWatched / totalVideos) * 100) : 0;

  // Animated counters
  const animatedXp = useAnimatedCounter(progress.xp);
  const animatedTodayXp = useAnimatedCounter(progress.todayXp);
  const animatedWatched = useAnimatedCounter(totalWatched);
  const animatedStreak = useAnimatedCounter(progress.streak);

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="halo-bg" />
        <div className="grid-bg" />
        <div className="container mx-auto px-6 pt-32">
          <div className="mb-12 space-y-3">
            <div className="h-8 w-48 bg-white/5 rounded-lg animate-pulse" />
            <div className="h-4 w-64 bg-white/5 rounded animate-pulse" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            <div className="h-44 bg-white/5 rounded-3xl animate-pulse" />
            <div className="h-44 bg-white/5 rounded-3xl animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.03 } }
  };

  const item = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0 }
  };

  const tones = {
    MIST: { accent: "#2dd4bf", soft: "rgba(45, 212, 191, 0.2)" },
    PYQs: { accent: "#f0f9ff", soft: "rgba(240, 249, 255, 0.16)" },
    MCQs: { accent: "#60a5fa", soft: "rgba(96, 165, 250, 0.2)" },
  };

  const renderCategoryCard = (name, delay = 0, isComingSoon = false) => {
    const categoryProgress = getCategoryProgress(name);
    const watched = countWatched(name);
    const total = countVideos(name);
    const tone = tones[name] || tones.MIST;

    return (
      <motion.div
        key={name}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
        className={`panel card-hover-lift rounded-3xl p-6 relative overflow-hidden ${isComingSoon ? "opacity-80" : ""}`}
      >
        <div className="absolute -top-16 -right-16 w-40 h-40 rounded-full blur-3xl" style={{ background: tone.soft }} />

        <div className="flex items-center gap-4 mb-6 relative z-10">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-display font-bold text-white"
            style={{ background: `linear-gradient(135deg, ${tone.accent}, #020617)` }}
          >
            {name.charAt(0)}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold font-display">{name}</h2>
              {isComingSoon && (
                <span className="chip">Soon</span>
              )}
            </div>
            <p className="text-sm text-muted">
              {isComingSoon ? "Archive coming soon" : `${watched}/${total} videos - 19 subjects`}
            </p>
          </div>
        </div>

        {!isComingSoon && (
          <div className="mb-6 relative z-10">
            <div className="flex justify-between items-end mb-2">
              <span className="text-xs font-bold text-muted uppercase tracking-wider">Course Progress</span>
              <span className="text-xs font-bold text-white">{categoryProgress}%</span>
            </div>
            <div className="progress-track">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${categoryProgress}%` }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="progress-fill"
              />
            </div>
          </div>
        )}

        {isComingSoon && (
          <div className="mb-6 h-10 flex items-center">
            <p className="text-xs text-muted italic">Previous year questions vault unlocking soon...</p>
          </div>
        )}

        <button
          onClick={() => !isComingSoon && setSelectedCategory(name)}
          disabled={isComingSoon}
          className={`w-full py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${isComingSoon ? "btn-ghost cursor-not-allowed opacity-60" : "btn-outline"}`}
        >
          <span>{isComingSoon ? "Notify Me" : `Open ${name}`}</span>
          {!isComingSoon && <ArrowRight size={16} />}
        </button>
      </motion.div>
    );
  };

  return (
    <main className="min-h-screen pb-32">
      <Header />
      <div className="halo-bg" />
      <div className="grid-bg" />

      <div className="container mx-auto px-4 sm:px-6 pt-24 sm:pt-32">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="panel card-hover-lift rounded-3xl p-6 lg:col-span-2">
              <div className="flex items-start justify-between mb-1">
                <h1 className="font-display text-2xl sm:text-3xl font-bold">
                  Welcome, <span className="text-gradient">Dr. {user?.displayName?.split(" ")[0] || "Learner"}</span>
                </h1>
                <div className="level-badge">
                  <Award size={12} />
                  {levelTitle}
                </div>
              </div>
              <p className="text-muted text-sm mt-1">Continue your medical journey</p>
              <div className="kpi-pill mt-3">{overallProgress}% overall completion</div>

              <div className="mt-5">
                <div className="flex items-center justify-between text-xs text-muted mb-2">
                  <span className="flex items-center gap-1.5">
                    Level {level}
                    <span className="text-primary/60">-</span>
                    <span className="text-primary/80">{levelTitle}</span>
                  </span>
                  <span>{xpProgress.current}/{xpProgress.needed} XP</span>
                </div>
                <div className="progress-track">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(xpProgress.current / xpProgress.needed) * 100}%` }}
                    className="progress-fill"
                  />
                </div>
              </div>
            </div>

            <Link href="/leaderboard" className="panel card-hover-lift rounded-3xl p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-secondary-soft flex items-center justify-center">
                <Trophy className="text-secondary" size={24} />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted">Leaderboard</p>
                <p className="text-lg font-bold">View ranking</p>
              </div>
              <ArrowRight className="text-muted" size={18} />
            </Link>
          </div>
        </motion.div>

        {/* FMGE Countdown Widget */}
        <FmgeCountdown />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4 sm:gap-4 mb-8 sm:mb-10"
        >
          <div className="stat-card xp-glow">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg bg-secondary-soft flex items-center justify-center">
                <Star className="text-secondary" size={16} />
              </div>
              <span className="text-xs text-muted uppercase tracking-wider">Total XP</span>
            </div>
            <p className="text-2xl font-bold text-white metric-value">{animatedXp.toLocaleString()}</p>
          </div>

          <div className="stat-card">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg bg-primary-soft flex items-center justify-center">
                <Target className="text-primary" size={16} />
              </div>
              <span className="text-xs text-muted uppercase tracking-wider">Watched</span>
            </div>
            <div className="flex items-end gap-2">
              <p className="text-2xl font-bold text-white metric-value">{animatedWatched}</p>
              <span className="text-sm text-muted mb-1">/{totalVideos}</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg bg-accent-soft flex items-center justify-center">
                <Flame className="text-accent" size={16} />
              </div>
              <span className="text-xs text-muted uppercase tracking-wider">Streak</span>
            </div>
            <div className="flex items-end gap-2">
              <p className="text-2xl font-bold text-white metric-value">{animatedStreak}</p>
              <span className="text-sm text-muted mb-1">days</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                <Zap className="text-primary" size={16} />
              </div>
              <span className="text-xs text-muted uppercase tracking-wider">Today</span>
            </div>
            <div className="flex items-end gap-2">
              <p className="text-2xl font-bold text-white metric-value today-xp-pulse">{animatedTodayXp}</p>
              <span className="text-sm text-muted mb-1">XP</span>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 max-w-5xl mx-auto mb-12">
          {renderCategoryCard("MIST", 0.2)}

          {/* MCQs Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="panel card-hover-lift rounded-3xl p-6 relative overflow-hidden"
          >
            <div className="absolute -top-16 -right-16 w-40 h-40 rounded-full blur-3xl" style={{ background: "rgba(96, 165, 250, 0.2)" }} />
            <div className="flex items-center gap-4 mb-6 relative z-10">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-white"
                style={{ background: "linear-gradient(135deg, #60a5fa, #2dd4bf)" }}
              >
                <ClipboardList size={26} />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold font-display">MCQs</h2>
                <p className="text-sm text-muted">MCQ Archive</p>
              </div>
            </div>
            <div className="mb-6 h-10 flex items-center">
              <p className="text-xs text-muted">Practice MCQs with Exam & Revision modes</p>
            </div>
            <Link
              href="/mcq"
              className="w-full py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] btn-outline"
            >
              <span>Open MCQs</span>
              <ArrowRight size={16} />
            </Link>
          </motion.div>

          {renderCategoryCard("PYQs", 0.4, true)}
        </div>
      </div>

      <AnimatePresence>
        {selectedCategory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-2xl overflow-y-auto"
          >
            <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-xl border-b border-white/5">
              <div className="container mx-auto px-4 py-4 flex items-center gap-4">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
                >
                  <ChevronLeft size={20} className="text-white" />
                </button>
                <div className="flex-1">
                  <h1 className="text-lg font-bold text-white">{selectedCategory} Subjects</h1>
                  <p className="text-xs text-muted">19 subjects - {countVideos(selectedCategory)} videos</p>
                </div>
                <button
                  onClick={() => setSelectedCategory(null)}
                  className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors md:hidden"
                >
                  <X size={20} className="text-white" />
                </button>
              </div>
            </div>

            <div className="container mx-auto px-4 pt-6 pb-32">
              <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4"
              >
                {MIST_SUBJECTS.map((subCategory) => {
                  const subVideos = videos.filter(v =>
                    v.category === selectedCategory &&
                    v.subCategory?.toLowerCase() === subCategory.toLowerCase()
                  );

                  return (
                    <motion.div key={subCategory} variants={item}>
                      <SeriesCard
                        title={subCategory}
                        videos={subVideos}
                        itemVariants={item}
                        watchedIds={progress.watched}
                      />
                    </motion.div>
                  );
                })}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
