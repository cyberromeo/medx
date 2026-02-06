"use client";

import { useEffect, useState } from "react";
import { account, databases } from "@/lib/appwrite";
import { Query } from "appwrite";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Flame, Target, Star, Zap, ArrowRight, X, ChevronLeft, Play, Clock } from "lucide-react";
import SeriesCard from "@/components/SeriesCard";
import { getProgress, calculateLevel, getXpToNextLevel } from "@/lib/progress";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [progress, setProgress] = useState({ watched: [], xp: 0, streak: 0, lastWatch: null });
  const [lastActive, setLastActive] = useState(null);
  const router = useRouter();

  const DB_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
  const COL_ID = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ID;

  const MIST_SUBJECTS = [
    "Anatomy", "Physiology", "Biochemistry", "Pathology",
    "Microbiology", "Pharmacology", "Forensic medicine",
    "Community Medicine (PSM)", "General Medicine", "General Surgery",
    "Obstetrics & Gynecology (OBG)", "Pediatrics", "Ophthalmology",
    "Otorhinolaryngology (ENT)", "Orthopedics", "Anesthesiology",
    "Dermatology & Venereology", "Psychiatry", "Radiodiagnosis (Radiology)"
  ];

  useEffect(() => {
    checkAuth();
    checkLastActive();
  }, []);

  const checkLastActive = () => {
    try {
      const stored = localStorage.getItem('medx_last_active');
      if (stored) {
        const data = JSON.parse(stored);
        // Only show if less than 7 days old
        if (Date.now() - data.lastUpdated < 7 * 24 * 60 * 60 * 1000) {
          // Verify video still exists logic could go here, but for now we trust the cache
          // Also only show if progress < 90% (don't resume finished videos)
          if (data.timestamp < data.duration * 0.9) {
            setLastActive(data);
          }
        }
      }
    } catch (e) {
      console.error("Error reading last active", e);
    }
  };

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

  const countVideos = (category) => videos.filter(v => v.category === category).length;
  const countWatched = (category) => videos.filter(v => v.category === category && progress.watched.includes(v.$id)).length;
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
    ARISE: { accent: "#60a5fa", soft: "rgba(96, 165, 250, 0.2)" },
    PYQs: { accent: "#f0f9ff", soft: "rgba(240, 249, 255, 0.16)" },
  };

  const CategoryCard = ({ name, isComingSoon = false }) => {
    const categoryProgress = getCategoryProgress(name);
    const watched = countWatched(name);
    const total = countVideos(name);
    const tone = tones[name] || tones.MIST;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`panel rounded-3xl p-6 relative overflow-hidden ${isComingSoon ? "opacity-80" : ""}`}
      >
        <div className="absolute -top-16 -right-16 w-40 h-40 rounded-full blur-3xl" style={{ background: tone.soft }} />

        <div className="flex items-center gap-4 mb-6 relative z-10">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-display font-bold text-white"
            style={{ background: `linear-gradient(135deg, ${tone.accent}, #090820)` }}
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

  const ResumeCard = () => {
    if (!lastActive) return null;

    // Calculate percentage for progress bar
    const resumePercent = Math.min(100, Math.max(0, (lastActive.timestamp / lastActive.duration) * 100));

    // Format time remaining
    const remaining = Math.max(0, lastActive.duration - lastActive.timestamp);
    const mins = Math.floor(remaining / 60);

    const handleDismiss = (e) => {
      e.preventDefault();
      e.stopPropagation();
      localStorage.removeItem('medx_last_active');
      setLastActive(null);
    };

    return (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full mb-8 relative group"
      >
        <div className="panel p-6 rounded-3xl relative overflow-hidden flex flex-col md:flex-row items-center gap-6 group-hover:shadow-[0_0_40px_rgba(45,212,191,0.15)] transition-all duration-500">
          {/* Dismiss Button */}
          <button
            onClick={handleDismiss}
            className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white/50 hover:text-white transition-colors"
          >
            <X size={16} />
          </button>

          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

          {/* Icon Section */}
          <div className="relative shrink-0">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center relative z-10">
              <Play size={32} className="text-primary ml-1" fill="currentColor" />
            </div>
            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse" />
          </div>

          {/* Content Section */}
          <div className="flex-1 text-center md:text-left z-10 w-full">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
              <span className="text-[10px] font-bold text-primary tracking-widest uppercase bg-primary/10 px-2 py-0.5 rounded border border-primary/20">Resume Learning</span>
              <span className="text-xs text-muted flex items-center gap-1">
                <Clock size={12} />
                {mins}m left
              </span>
            </div>

            <h3 className="text-xl font-bold text-white mb-3 line-clamp-1">{lastActive.title}</h3>

            {/* Progress Bar */}
            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden flex">
              <div
                className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-1000 ease-out"
                style={{ width: `${resumePercent}%` }}
              />
            </div>
          </div>

          {/* Action Button */}
          <Link
            href={`/watch/${lastActive.docId || lastActive.videoId}?t=${Math.floor(lastActive.timestamp)}`}
            className="shrink-0 w-full md:w-auto z-10"
          >
            <button className="btn-primary w-full md:w-auto py-3 px-6 rounded-xl flex items-center justify-center gap-2 group-hover:scale-105 transition-transform">
              <span>Continue Watching</span>
              <ArrowRight size={18} />
            </button>
          </Link>
        </div>
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
          {/* Resume Card if active */}
          <ResumeCard />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="panel rounded-3xl p-6 lg:col-span-2">
              <h1 className="font-display text-2xl sm:text-3xl font-bold">
                Welcome, <span className="text-gradient">Dr. {user?.name?.split(" ")[0]}</span>
              </h1>
              <p className="text-muted text-sm mt-1">Continue your medical journey</p>

              <div className="mt-5">
                <div className="flex items-center justify-between text-xs text-muted mb-2">
                  <span>Level {level}</span>
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

            <Link href="/leaderboard" className="panel rounded-3xl p-6 flex items-center gap-4 hover:shadow-[0_20px_60px_rgba(2,6,23,0.6)] transition">
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

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4 sm:gap-4 mb-8 sm:mb-10"
        >
          <div className="stat-card">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg bg-secondary-soft flex items-center justify-center">
                <Star className="text-secondary" size={16} />
              </div>
              <span className="text-xs text-muted uppercase tracking-wider">Total XP</span>
            </div>
            <p className="text-2xl font-bold text-white font-mono">{progress.xp}</p>
          </div>

          <div className="stat-card">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg bg-primary-soft flex items-center justify-center">
                <Target className="text-primary" size={16} />
              </div>
              <span className="text-xs text-muted uppercase tracking-wider">Watched</span>
            </div>
            <div className="flex items-end gap-2">
              <p className="text-2xl font-bold text-white font-mono">{totalWatched}</p>
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
              <p className="text-2xl font-bold text-white font-mono">{progress.streak}</p>
              <span className="text-sm text-muted mb-1">days</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                <Zap className="text-white" size={16} />
              </div>
              <span className="text-xs text-muted uppercase tracking-wider">Progress</span>
            </div>
            <div className="flex items-end gap-2">
              <p className="text-2xl font-bold text-white font-mono">{overallProgress}%</p>
              <span className="text-sm text-muted mb-1">complete</span>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 max-w-5xl mx-auto mb-12">
          <CategoryCard name="MIST" />
          <CategoryCard name="ARISE" />
          <CategoryCard name="PYQs" isComingSoon={true} />
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
