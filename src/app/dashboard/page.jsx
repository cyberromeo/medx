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
import { Trophy, Flame, Target, Star, Zap, ArrowRight, X, ChevronLeft, Award, Calendar, Clock, Timer } from "lucide-react";
import SeriesCard from "@/components/SeriesCard";
import { getProgress, calculateLevel, getXpToNextLevel, getLevelTitle, claimDailyLoginXp } from "@/lib/progress";
import { getTrackerData, SUBJECTS_LIST } from "@/lib/tracker";

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
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(start + diff * eased));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration]);

  return count;
}

// Light theme FMGE Countdown Widget
function FmgeCountdown() {
  const TARGET = new Date("2027-01-09T09:00:00+05:30").getTime();
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
    { label: "Days", value: timeLeft.d, icon: Calendar },
    { label: "Hrs", value: timeLeft.h, icon: Clock },
    { label: "Min", value: timeLeft.m, icon: Timer },
    { label: "Sec", value: timeLeft.s, icon: Zap },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="max-w-md mb-6 group cursor-default"
    >
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600 p-6 shadow-lg shadow-blue-500/20 transition-all hover:shadow-xl hover:-translate-y-1 border border-white/10">
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none group-hover:bg-white/20 transition-all" />
        
        <div className="relative z-10 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
                <Calendar className="text-blue-200" size={24} />
                FMGE JAN 2027
              </h2>
              <p className="text-sm text-blue-100 font-medium mt-1">Jan 9 • 9:00 AM IST</p>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2">
            {units.map((u, i) => (
              <div key={u.label} className="flex flex-col items-center flex-1">
                <div className="bg-white/10 backdrop-blur-md border border-white/20 shadow-inner rounded-2xl w-full aspect-square flex flex-col items-center justify-center mb-2">
                  <p className={`text-2xl sm:text-3xl font-black text-white tabular-nums ${u.label === "Sec" ? "animate-pulse text-blue-200" : ""}`}>
                    {String(u.value).padStart(2, "0")}
                  </p>
                </div>
                <p className="text-[10px] sm:text-xs font-bold text-blue-200 uppercase tracking-widest">{u.label}</p>
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
  const [progress, setProgress] = useState({ watched: [], xp: 0, streak: 0, lastWatch: null, todayXp: 0 });
  const [trackerProgress, setTrackerProgress] = useState(0);
  const router = useRouter();


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        await fetchVideos();
        await claimDailyLoginXp(currentUser.uid);
        const userProgress = await getProgress(currentUser.uid);
        setProgress(userProgress);

        const trackerData = await getTrackerData(currentUser.uid);
        let count = 0;
        SUBJECTS_LIST.forEach(sub => {
          if (trackerData.subjects[sub]?.Videos) count++;
          if (trackerData.subjects[sub]?.R1) count++;
          if (trackerData.subjects[sub]?.R2) count++;
          if (trackerData.subjects[sub]?.PYQs) count++;
          if (trackerData.subjects[sub]?.RevisionVideos) count++;
          if (trackerData.subjects[sub]?.Qbank) count++;
        });
        Object.keys(trackerData.gts).forEach(gt => {
          if (trackerData.gts[gt]) count++;
        });
        setTrackerProgress(Math.round((count / 121) * 100) || 0);

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
  const animatedLevelXp = useAnimatedCounter(xpProgress.current);
  const animatedTodayXp = useAnimatedCounter(progress.todayXp);
  const animatedWatched = useAnimatedCounter(totalWatched);
  const animatedStreak = useAnimatedCounter(progress.streak);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f0f0f0]">
        <div className="container mx-auto px-6 pt-32">
          <div className="mb-12 space-y-3">
            <div className="h-8 w-48 bg-[#898989]/20 rounded-lg animate-pulse" />
            <div className="h-4 w-64 bg-[#898989]/10 rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };


  return (
    <div className="p-6 sm:p-10">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="max-w-4xl">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-[#303030] tracking-tight mb-2">
              {getGreeting()},{" "}
              <span className="text-blue-600">Dr. {user?.displayName?.split(" ")[0] || "Learner"}</span>
            </h1>
            <p className="text-[#898989] text-lg font-medium">Continue your FMGE journey</p>
          </div>
        </motion.div>

        {/* Level and XP Widget */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="max-w-md mb-6"
        >
          <div className="group relative overflow-hidden rounded-3xl bg-white/80 backdrop-blur-2xl border border-white hover:border-amber-200 p-6 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all cursor-default">
            <div className="absolute -inset-2 bg-gradient-to-br from-amber-400/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[2.5rem] blur-xl pointer-events-none" />
            
            <div className="flex items-center justify-between mb-6 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-amber-500 shadow-md relative overflow-hidden bg-gradient-to-br from-amber-100 to-amber-50 border border-amber-200/50">
                  <Award size={32} strokeWidth={2.5} className="drop-shadow-sm" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-[#303030] tracking-tight group-hover:text-amber-600 transition-colors">Level {level}</h2>
                  <p className="text-sm font-semibold text-[#898989] mt-0.5">{levelTitle}</p>
                </div>
              </div>
            </div>

            <div className="relative z-10 bg-amber-50/50 rounded-2xl p-4 border border-amber-100/50">
              <div className="flex items-center justify-between text-xs font-bold text-[#898989] uppercase tracking-wider mb-3">
                <span className="flex items-center gap-1.5"><Star size={14} className="text-amber-500"/> Level XP</span>
                <span className="text-amber-600 font-extrabold text-sm">{animatedLevelXp.toLocaleString()} / {xpProgress.needed.toLocaleString()}</span>
              </div>
              <div className="w-full h-2 bg-amber-200/30 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(xpProgress.current / xpProgress.needed) * 100}%` }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full relative"
                >
                  <div className="absolute inset-0 bg-white/20 animate-pulse" />
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tracker Widget */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="max-w-md mb-6"
        >
          <Link href="/tracker">
            <div className="group relative overflow-hidden rounded-3xl bg-white/80 backdrop-blur-2xl border border-white hover:border-teal-200 p-6 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer">
              <div className="absolute -inset-2 bg-gradient-to-br from-teal-400/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[2.5rem] blur-xl pointer-events-none" />
              
              <div className="flex items-start justify-between mb-6 relative z-10">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-teal-600 shadow-md relative overflow-hidden bg-gradient-to-br from-teal-100 to-teal-50 border border-teal-200/50">
                    <Target size={32} strokeWidth={2.5} className="drop-shadow-sm" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-[#303030] tracking-tight group-hover:text-teal-600 transition-colors">Syllabus Tracker</h2>
                    <p className="text-sm font-semibold text-[#898989] mt-0.5">Your FMGE progress</p>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center text-teal-600 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 border border-teal-100 shadow-sm">
                  <ArrowRight size={20} strokeWidth={2.5} />
                </div>
              </div>

              <div className="relative z-10 bg-teal-50/50 rounded-2xl p-4 border border-teal-100/50">
                <div className="flex items-center justify-between text-xs font-bold text-[#898989] uppercase tracking-wider mb-3">
                  <span>Overall Completion</span>
                  <span className="text-teal-600 font-extrabold text-sm">{trackerProgress}%</span>
                </div>
                <div className="w-full h-2 bg-teal-200/30 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-teal-400 to-emerald-500 rounded-full relative transition-all duration-1000 ease-out"
                    style={{ width: `${trackerProgress}%` }}
                  >
                    <div className="absolute inset-0 bg-white/20 animate-pulse" />
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </motion.div>

        {/* FMGE Countdown Widget */}
        <FmgeCountdown />
      </div>


    </div>
  );
}
