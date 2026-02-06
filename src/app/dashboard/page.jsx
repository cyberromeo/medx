"use client";

import { useEffect, useMemo, useState } from "react";
import { account, databases } from "@/lib/appwrite";
import { Query } from "appwrite";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  BookOpenText,
  Brain,
  CalendarCheck2,
  ChevronLeft,
  Clock3,
  Flame,
  Star,
  Target,
  Trophy,
  X,
  Zap,
} from "lucide-react";
import SeriesCard from "@/components/SeriesCard";
import { calculateLevel, getProgress, getXpToNextLevel } from "@/lib/progress";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [progress, setProgress] = useState({ watched: [], xp: 0, streak: 0, lastWatch: null });
  const router = useRouter();

  const DB_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
  const COL_ID = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ID;

  const MIST_SUBJECTS = [
    "Anatomy", "Physiology", "Biochemistry", "Pathology",
    "Microbiology", "Pharmacology", "Forensic medicine",
    "Community Medicine (PSM)", "General Medicine", "General Surgery",
    "Obstetrics & Gynecology (OBG)", "Pediatrics", "Ophthalmology",
    "Otorhinolaryngology (ENT)", "Orthopedics", "Anesthesiology",
    "Dermatology & Venereology", "Psychiatry", "Radiodiagnosis (Radiology)",
  ];

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const current = await account.get();
      setUser(current);
      await fetchVideos();
      const userProgress = await getProgress(current.$id);
      setProgress(userProgress);
    } catch {
      router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  const fetchVideos = async () => {
    if (!DB_ID || !COL_ID) return;
    try {
      const response = await databases.listDocuments(DB_ID, COL_ID, [
        Query.orderDesc("$createdAt"),
        Query.limit(1000),
      ]);
      setVideos(response.documents);
    } catch (err) {
      console.error(err);
    }
  };

  const countVideos = (category) => videos.filter((v) => v.category === category).length;
  const countWatched = (category) => videos.filter((v) => v.category === category && progress.watched.includes(v.$id)).length;
  const getCategoryProgress = (category) => {
    const total = countVideos(category);
    const watched = countWatched(category);
    return total > 0 ? Math.round((watched / total) * 100) : 0;
  };

  const level = calculateLevel(progress.xp);
  const xpProgress = getXpToNextLevel(progress.xp);
  const totalWatched = progress.watched.length;
  const totalVideos = videos.length;
  const overallProgress = totalVideos > 0 ? Math.round((totalWatched / totalVideos) * 100) : 0;

  const heatLevels = useMemo(() => {
    const activeWindow = Math.min(Math.max(progress.streak, 0), 32);
    return Array.from({ length: 49 }, (_, i) => {
      const recentIndex = 48 - i;
      if (recentIndex < activeWindow) {
        const density = (recentIndex + progress.streak) % 4;
        return Math.max(1, density + 1);
      }
      return recentIndex % 11 === 0 ? 1 : 0;
    }).reverse();
  }, [progress.streak]);

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="halo-bg" />
        <div className="grid-bg" />
        <div className="container mx-auto px-3 sm:px-6 pt-24 sm:pt-32">
          <div className="neo-shell p-4 sm:p-6 max-w-5xl mx-auto">
            <div className="h-9 w-52 bg-white/10 rounded-lg animate-pulse" />
            <div className="h-4 w-72 bg-white/10 rounded animate-pulse mt-3" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5">
              <div className="h-36 bg-white/10 rounded-xl animate-pulse" />
              <div className="h-36 bg-white/10 rounded-xl animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const tones = {
    MIST: { accent: "#1ec8ff", soft: "rgba(30,200,255,0.18)" },
    ARISE: { accent: "#eeff3b", soft: "rgba(238,255,59,0.2)" },
    PYQs: { accent: "#f7f7f7", soft: "rgba(255,255,255,0.16)" },
  };

  const CategoryCard = ({ name, isComingSoon = false }) => {
    const categoryProgress = getCategoryProgress(name);
    const watched = countWatched(name);
    const total = countVideos(name);
    const tone = tones[name] || tones.MIST;

    return (
      <div className="surface p-3 sm:p-3.5">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg border-2 border-white/30 flex items-center justify-center font-display text-lg"
            style={{ background: tone.soft, color: tone.accent }}
          >
            {name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-display text-xl leading-none">{name}</h3>
              {isComingSoon && <span className="chip">Soon</span>}
            </div>
            <p className="text-[11px] text-muted uppercase tracking-wider mt-0.5">
              {isComingSoon ? "Previous years vault" : `${watched}/${total} videos`}
            </p>
          </div>
        </div>

        {!isComingSoon && (
          <div className="mt-3">
            <div className="flex justify-between text-[11px] text-muted uppercase tracking-wider mb-1.5">
              <span>Progress</span>
              <span>{categoryProgress}%</span>
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

        <button
          onClick={() => !isComingSoon && setSelectedCategory(name)}
          disabled={isComingSoon}
          className={`mt-3 w-full ${isComingSoon ? "btn-ghost cursor-not-allowed opacity-70" : "btn-outline"} inline-flex items-center justify-center gap-2`}
        >
          {isComingSoon ? "Notify Me" : `Open ${name}`}
          {!isComingSoon && <ArrowRight size={14} />}
        </button>
      </div>
    );
  };

  const firstName = user?.name?.split(" ")[0] || "Doctor";
  const xpPercent = Math.round((xpProgress.current / xpProgress.needed) * 100);

  return (
    <main className="min-h-screen pb-32 sm:pb-36">
      <Header />
      <div className="halo-bg" />
      <div className="grid-bg" />

      <div className="container mx-auto px-3 sm:px-6 pt-24 sm:pt-32">
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="neo-shell p-4 sm:p-6 max-w-6xl mx-auto overflow-hidden relative"
        >
          <div className="hero-sweep" />
          <p className="absolute right-4 top-4 chalk-note rotate-[-5deg] hidden sm:block">
            * keep your streak alive daily
          </p>

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <div className="neo-chip inline-flex items-center gap-2">
                <CalendarCheck2 size={12} className="text-secondary" />
                Command Deck
              </div>
              <h1 className="font-display text-[2.2rem] sm:text-[3.3rem] leading-[0.9] mt-3">
                DR. <span className="text-gradient">{firstName}</span>
              </h1>
              <p className="text-sm text-muted mt-2 max-w-xl">
                Your mobile study cockpit is live. Continue where you left off and protect consistency.
              </p>
              <div className="mt-4">
                <div className="flex items-center justify-between text-[11px] text-muted uppercase tracking-widest mb-1.5">
                  <span>Level {level}</span>
                  <span>{xpProgress.current}/{xpProgress.needed} XP</span>
                </div>
                <div className="progress-track">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${xpPercent}%` }}
                    className="progress-fill"
                  />
                </div>
              </div>
            </div>

            <Link href="/leaderboard" className="neo-card p-4 sm:p-5 hover:-translate-y-0.5 transition-transform">
              <div className="w-10 h-10 rounded-lg bg-secondary-soft border border-secondary flex items-center justify-center">
                <Trophy className="text-secondary" size={20} />
              </div>
              <h2 className="font-display text-2xl mt-3 leading-none">Leaderboard</h2>
              <p className="text-sm text-muted mt-2">Compare XP momentum with other MedX learners.</p>
              <span className="mt-3 inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-primary">
                View Ranking
                <ArrowRight size={14} />
              </span>
            </Link>
          </div>
        </motion.section>

        <section className="max-w-6xl mx-auto mt-4 bento-grid">
          <motion.article
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="neo-card p-4 sm:p-5 bento-col-4"
          >
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display text-2xl sm:text-3xl">Course Tracks</h2>
              <BookOpenText size={20} className="text-primary" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
              <CategoryCard name="MIST" />
              <CategoryCard name="ARISE" />
              <CategoryCard name="PYQs" isComingSoon />
            </div>
          </motion.article>

          <motion.article
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
            className="neo-card neo-card-yellow p-4 sm:p-5 bento-col-2"
          >
            <h2 className="font-display text-2xl mb-3">Key Stats</h2>
            <div className="space-y-2.5">
              <div className="stat-card">
                <div className="flex items-center gap-2 mb-1">
                  <Star size={14} className="text-secondary" />
                  <span className="text-[11px] text-muted uppercase tracking-wider">XP</span>
                </div>
                <p className="font-display text-3xl leading-none chalk-scribble inline-block">{progress.xp}</p>
              </div>
              <div className="stat-card">
                <div className="flex items-center gap-2 mb-1">
                  <Target size={14} className="text-primary" />
                  <span className="text-[11px] text-muted uppercase tracking-wider">Completion</span>
                </div>
                <p className="font-display text-3xl leading-none chalk-scribble inline-block">
                  {totalWatched}
                  <span className="text-sm text-muted ml-1">/{totalVideos}</span>
                </p>
              </div>
              <div className="stat-card">
                <div className="flex items-center gap-2 mb-1">
                  <Flame size={14} className="text-secondary" />
                  <span className="text-[11px] text-muted uppercase tracking-wider">Streak</span>
                </div>
                <p className="font-display text-3xl leading-none chalk-scribble inline-block">
                  {progress.streak}
                  <span className="text-sm text-muted ml-1">days</span>
                </p>
              </div>
            </div>
          </motion.article>

          <motion.article
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.16 }}
            className="neo-card p-4 sm:p-5 bento-col-3"
          >
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display text-2xl">Streak Heatmap</h2>
              <Flame size={18} className="text-secondary" />
            </div>
            <div className="grid grid-cols-7 gap-1.5 w-fit">
              {heatLevels.map((level, idx) => (
                <div
                  key={`${level}-${idx}`}
                  className={`heat-cell ${level > 0 ? `level-${Math.min(level, 4)}` : ""}`}
                />
              ))}
            </div>
            <p className="chalk-note mt-3 rotate-[-2deg]">* dark blocks show high-focus days</p>
          </motion.article>

          <motion.article
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="neo-card p-4 sm:p-5 bento-col-3 flash-stack"
          >
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display text-2xl">Flashcard Widget</h2>
              <Brain size={18} className="text-primary" />
            </div>
            <div className="surface p-3.5">
              <p className="text-[11px] text-muted uppercase tracking-widest">Rapid Recall</p>
              <p className="text-sm mt-2">Most common cause of nephrotic syndrome in children?</p>
              <div className="grid grid-cols-2 gap-2 mt-3">
                <button className="btn-outline">Minimal Change</button>
                <button className="btn-ghost">FSGS</button>
              </div>
              <div className="mt-3 flex items-center justify-between text-xs text-muted">
                <span>Deck 3 of 12</span>
                <span className="chalk-underline">Recall Mode ON</span>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2.5">
              <div className="surface p-3">
                <div className="flex items-center gap-2 text-[11px] text-muted uppercase tracking-wider mb-1">
                  <Clock3 size={12} className="text-primary" />
                  Focus Time
                </div>
                <p className="font-display text-2xl leading-none">{Math.max(1, Math.round(progress.xp / 250))}h</p>
              </div>
              <div className="surface p-3">
                <div className="flex items-center gap-2 text-[11px] text-muted uppercase tracking-wider mb-1">
                  <Zap size={12} className="text-secondary" />
                  Completion
                </div>
                <p className="font-display text-2xl leading-none">{overallProgress}%</p>
              </div>
            </div>
          </motion.article>
        </section>
      </div>

      <AnimatePresence>
        {selectedCategory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl overflow-y-auto"
          >
            <div className="sticky top-0 z-10 bg-black/85 border-b border-white/10">
              <div className="container mx-auto px-3 sm:px-6 py-4 flex items-center gap-3">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className="w-10 h-10 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center"
                >
                  <ChevronLeft size={20} className="text-white" />
                </button>
                <div className="flex-1">
                  <h1 className="font-display text-2xl leading-none">{selectedCategory} Subjects</h1>
                  <p className="text-[11px] text-muted uppercase tracking-widest mt-1">
                    19 subjects - {countVideos(selectedCategory)} videos
                  </p>
                </div>
                <button
                  onClick={() => setSelectedCategory(null)}
                  className="w-10 h-10 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center md:hidden"
                >
                  <X size={20} className="text-white" />
                </button>
              </div>
            </div>

            <div className="container mx-auto px-3 sm:px-6 pt-5 pb-36">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3"
              >
                {MIST_SUBJECTS.map((subCategory) => {
                  const subVideos = videos.filter(
                    (v) =>
                      v.category === selectedCategory &&
                      v.subCategory?.toLowerCase() === subCategory.toLowerCase(),
                  );

                  return (
                    <SeriesCard
                      key={subCategory}
                      title={subCategory}
                      videos={subVideos}
                      watchedIds={progress.watched}
                    />
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
