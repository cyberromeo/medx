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
      className="max-w-md mb-6"
    >
      <div className="bg-white/60 backdrop-blur-md border border-[#898989]/20 rounded-[1.5rem] p-6 shadow-sm overflow-hidden relative">
        <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-xl font-bold text-[#303030] tracking-tight">
              FMGE JAN 2027
            </h2>
            <p className="text-xs text-[#898989] font-medium mt-1">Jan 9 - 9:00 AM IST</p>
          </div>

          <div className="flex items-center gap-4 sm:gap-6">
            {units.map((u, i) => (
              <div key={u.label} className="flex flex-col items-center">
                <div className="bg-white border border-[#898989]/10 shadow-sm rounded-xl w-12 h-14 sm:w-14 sm:h-16 flex flex-col items-center justify-center mb-1">
                  <p className={`text-xl sm:text-2xl font-bold text-[#303030] tabular-nums ${u.label === "Sec" ? "animate-pulse" : ""}`}>
                    {String(u.value).padStart(2, "0")}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-[#898989]">
                  <u.icon size={10} />
                  <p className="text-[10px] font-semibold uppercase tracking-wider">{u.label}</p>
                </div>
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
          <div className="bg-white/60 backdrop-blur-md border border-[#898989]/20 rounded-3xl p-6 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-amber-500" />
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center">
                  <Award size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[#303030]">Level {level}: {levelTitle}</h2>
                  <p className="text-sm font-medium text-[#898989]">Current Rank Status</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm font-bold text-[#898989] mb-3">
              <span className="flex items-center gap-1.5"><Star size={16} className="text-amber-500"/> Level XP</span>
              <span className="text-[#303030]">{animatedLevelXp.toLocaleString()} / {xpProgress.needed.toLocaleString()}</span>
            </div>
            <div className="w-full h-3 bg-[#898989]/10 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(xpProgress.current / xpProgress.needed) * 100}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-amber-400 to-orange-400 rounded-full"
              />
            </div>
          </div>
        </motion.div>

        {/* Tracker Widget */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="max-w-md"
        >
          <Link href="/tracker">
            <div className="bg-white/60 backdrop-blur-md border border-[#898989]/20 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Target size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-[#303030]">Syllabus Tracker</h2>
                    <p className="text-sm font-medium text-[#898989]">Your FMGE progress</p>
                  </div>
                </div>
                <ArrowRight className="text-[#898989] group-hover:translate-x-1 group-hover:text-blue-500 transition-all" size={24} />
              </div>

              <div className="flex items-center justify-between text-sm font-bold text-[#898989] mb-3">
                <span>Overall Completion</span>
                <span className="text-blue-600">{trackerProgress}%</span>
              </div>
              <div className="w-full h-3 bg-[#898989]/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-teal-400 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${trackerProgress}%` }}
                />
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
