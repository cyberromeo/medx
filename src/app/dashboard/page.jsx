"use client";

import { useEffect, useState, useRef } from "react";
import { auth, db } from "@/lib/firebase";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Trophy,
  Target,
  Award,
  ArrowRight,
  Calendar,
  Clock,
  Timer,
  Zap,
} from "lucide-react";
import {
  getProgress,
  calculateLevel,
  getXpToNextLevel,
  getLevelTitle,
  claimDailyLoginXp,
} from "@/lib/progress";
import { getTrackerData, SUBJECTS_LIST } from "@/lib/tracker";

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
      className="group cursor-default"
    >
      <div className="relative overflow-hidden rounded-[1.5rem] border border-[rgba(30,50,90,0.05)] bg-white p-6 shadow-[0_4px_24px_rgba(0,0,0,0.04)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] md:rounded-[2rem] md:p-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="flex items-center gap-2 text-xl font-bold tracking-tight text-gray-900 md:text-2xl">
              <Calendar className="text-blue-600" size={22} />
              FMGE Jan 2027
            </h2>
            <p className="mt-1 text-sm font-medium text-gray-500">
              Jan 9 &middot; 9:00 AM IST
            </p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-4 gap-2 md:gap-3">
          {units.map((u) => (
            <div
              key={u.label}
              className="flex flex-col items-center justify-center rounded-2xl border border-[rgba(30,50,90,0.05)] bg-gray-50 py-4"
            >
              <p
                className={`text-2xl font-bold tabular-nums text-gray-900 md:text-3xl ${
                  u.label === "Sec" ? "text-blue-600" : ""
                }`}
              >
                {String(u.value).padStart(2, "0")}
              </p>
              <p className="mt-1 text-[10px] font-semibold tracking-widest text-gray-400 uppercase md:text-xs">
                {u.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState({
    watched: [],
    xp: 0,
    streak: 0,
    lastWatch: null,
    todayXp: 0,
  });
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
        SUBJECTS_LIST.forEach((sub) => {
          if (trackerData.subjects[sub]?.Videos) count++;
          if (trackerData.subjects[sub]?.R1) count++;
          if (trackerData.subjects[sub]?.R2) count++;
          if (trackerData.subjects[sub]?.PYQs) count++;
          if (trackerData.subjects[sub]?.RevisionVideos) count++;
          if (trackerData.subjects[sub]?.Qbank) count++;
        });
        Object.keys(trackerData.gts).forEach((gt) => {
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
        limit(1000),
      );
      const snapshot = await getDocs(q);
      const docs = snapshot.docs.map((doc) => ({ $id: doc.id, ...doc.data() }));
      setVideos(docs);
    } catch (err) {
      console.error(err);
    }
  };

  const level = calculateLevel(progress.xp);
  const levelTitle = getLevelTitle(level);
  const xpProgress = getXpToNextLevel(progress.xp);

  const animatedLevelXp = useAnimatedCounter(xpProgress.current);
  const animatedStreak = useAnimatedCounter(progress.streak);

  if (loading) {
    return (
      <div className="p-6 md:p-10">
        <div className="mx-auto max-w-4xl space-y-4">
          <div className="h-9 w-56 animate-pulse rounded-lg bg-gray-200/60" />
          <div className="h-4 w-64 animate-pulse rounded bg-gray-200/40" />
          <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-3">
            <div className="h-40 animate-pulse rounded-[1.5rem] bg-gray-200/40 md:rounded-[2rem]" />
            <div className="h-40 animate-pulse rounded-[1.5rem] bg-gray-200/40 md:rounded-[2rem]" />
            <div className="h-40 animate-pulse rounded-[1.5rem] bg-gray-200/40 md:rounded-[2rem]" />
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
    <div className="p-6 md:p-10">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 md:text-5xl">
            {getGreeting()},{" "}
            <span className="text-blue-600">
              Dr. {user?.displayName?.split(" ")[0] || "Learner"}
            </span>
          </h1>
          <p className="mt-2 text-base font-medium text-gray-500 md:text-lg">
            Continue your FMGE journey
          </p>
        </motion.div>

        {/* Widgets grid */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {/* Level & XP */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
          >
            <div className="group h-full cursor-default overflow-hidden rounded-[1.5rem] border border-[rgba(30,50,90,0.05)] bg-white p-6 shadow-[0_4px_24px_rgba(0,0,0,0.04)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] md:rounded-[2rem] md:p-8">
              <div className="mb-6 flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-100 bg-gradient-to-br from-amber-50 to-amber-100/50 text-amber-500 shadow-sm">
                  <Award size={28} strokeWidth={2.5} />
                </div>
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-gray-900 md:text-2xl">
                    Level {level}
                  </h2>
                  <p className="text-sm font-medium text-gray-500">
                    {levelTitle}
                  </p>
                </div>
              </div>

              <div className="rounded-2xl bg-gray-50 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xs font-semibold tracking-wider text-gray-500 uppercase">
                    Level XP
                  </span>
                  <span className="text-sm font-bold text-gray-900">
                    {animatedLevelXp.toLocaleString()} /{" "}
                    {xpProgress.needed.toLocaleString()}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{
                      width: `${(xpProgress.current / xpProgress.needed) * 100}%`,
                    }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="h-full rounded-full bg-blue-600"
                  />
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between text-sm">
                <span className="text-gray-500">
                  {progress.streak} day streak
                </span>
                <span className="font-bold text-amber-600">
                  {progress.todayXp} XP today
                </span>
              </div>
            </div>
          </motion.div>

          {/* Tracker */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Link href="/tracker" className="block h-full">
              <div className="group h-full cursor-pointer overflow-hidden rounded-[1.5rem] border border-[rgba(30,50,90,0.05)] bg-white p-6 shadow-[0_4px_24px_rgba(0,0,0,0.04)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] md:rounded-[2rem] md:p-8">
                <div className="mb-6 flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-teal-100 bg-gradient-to-br from-teal-50 to-teal-100/50 text-teal-600 shadow-sm">
                      <Target size={28} strokeWidth={2.5} />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold tracking-tight text-gray-900 md:text-2xl">
                        Syllabus
                      </h2>
                      <p className="text-sm font-medium text-gray-500">
                        FMGE progress
                      </p>
                    </div>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[rgba(30,50,90,0.05)] bg-gray-50 text-gray-500 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100 group-hover:text-blue-600">
                    <ArrowRight size={18} strokeWidth={2.5} />
                  </div>
                </div>

                <div className="rounded-2xl bg-gray-50 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-xs font-semibold tracking-wider text-gray-500 uppercase">
                      Completion
                    </span>
                    <span className="text-sm font-bold text-teal-600">
                      {trackerProgress}%
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                    <div
                      className="h-full rounded-full bg-teal-500 transition-all duration-1000 ease-out"
                      style={{ width: `${trackerProgress}%` }}
                    />
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>

          {/* Countdown */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="md:col-span-2 lg:col-span-1"
          >
            <FmgeCountdown />
          </motion.div>
        </div>

        {/* Quick actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4"
        >
          {[
            { href: "/series", label: "Videos", value: videos.length || "—" },
            {
              href: "/mcq",
              label: "MCQ Practice",
              value: "Tests",
            },
            {
              href: "/leaderboard",
              label: "Rankings",
              value: "Global",
            },
            {
              href: "/tracker",
              label: "Tracker",
              value: `${trackerProgress}%`,
            },
          ].map((action, i) => (
            <Link
              key={i}
              href={action.href}
              className="group rounded-2xl border border-[rgba(30,50,90,0.05)] bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] md:p-5"
            >
              <p className="text-xs font-semibold tracking-wider text-gray-400 uppercase">
                {action.label}
              </p>
              <p className="mt-1.5 text-xl font-bold text-gray-900 group-hover:text-blue-600">
                {action.value}
              </p>
            </Link>
          ))}
        </motion.div>

        {/* Unused imports placeholder for Trophy (kept for potential use) */}
        <span className="hidden">
          <Trophy />
          {animatedStreak}
        </span>
      </div>
    </div>
  );
}