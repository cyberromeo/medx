"use client";

import { useEffect, useState } from "react";
import { account, databases } from "@/lib/appwrite";
import { Query } from "appwrite";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Trophy, Flame, Target, Star, Zap } from "lucide-react";
import SeriesCard from "@/components/SeriesCard";
import { getProgress, calculateLevel, getXpToNextLevel } from "@/lib/progress";

export default function Dashboard() {
    const [user, setUser] = useState(null);
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedCategory, setExpandedCategory] = useState(null);
    const [progress, setProgress] = useState({ watched: [], xp: 0, streak: 0, lastWatch: null });
    const router = useRouter();

    const DB_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
    const COL_ID = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ID;

    const MIST_SUBJECTS = [
        "Anatomy", "Physiology", "Biochemistry", "Pathology",
        "Microbiology", "Pharmacology", "Forensic Medicine (FMT)",
        "Community Medicine (PSM)", "General Medicine", "General Surgery",
        "Obstetrics & Gynecology (OBG)", "Pediatrics", "Ophthalmology",
        "Otorhinolaryngology (ENT)", "Orthopedics", "Anesthesiology",
        "Dermatology & Venereology", "Psychiatry", "Radiodiagnosis (Radiology)"
    ];

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const current = await account.get();
            setUser(current);
            await fetchVideos();
            // Fetch progress from Appwrite
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
            ]);
            setVideos(response.documents);
        } catch (err) {
            console.error(err);
        }
    };

    const toggleCategory = (category) => {
        setExpandedCategory(expandedCategory === category ? null : category);
    };

    const countVideos = (category) => {
        return videos.filter(v => v.category === category).length;
    };

    const countWatched = (category) => {
        return videos.filter(v => v.category === category && progress.watched.includes(v.$id)).length;
    };

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
            <div className="min-h-screen bg-background">
                <Header />
                <div className="aurora-bg" />
                <div className="container mx-auto px-6 pt-32">
                    <div className="mb-12">
                        <div className="h-10 w-48 bg-white/5 rounded-lg shimmer mb-2" />
                        <div className="h-5 w-64 bg-white/5 rounded shimmer" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
                        <div className="h-48 bg-white/5 rounded-3xl shimmer" />
                        <div className="h-48 bg-white/5 rounded-3xl shimmer" />
                    </div>
                </div>
            </div>
        );
    }

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.05 }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <main className="min-h-screen bg-background pb-20 safe-bottom selection:bg-secondary/30">
            <Header />
            <div className="aurora-bg" />

            <div className="container mx-auto px-4 sm:px-6 pt-24 sm:pt-32">
                {/* Gamified Header */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <div className="flex flex-col gap-6">
                        {/* Header Section */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6">
                            <div className="flex-1">
                                <h1 className="text-2xl sm:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 mb-1">
                                    Welcome, Dr. {user?.name?.split(' ')[0]}
                                </h1>
                                <p className="text-gray-500 text-sm sm:text-base">Continue your medical journey</p>
                            </div>
                        </div>

                        {/* Top Stats Row: Level & Rank */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Level Badge */}
                            <div className="glass-panel px-4 py-3 sm:px-6 sm:py-4 rounded-2xl flex items-center gap-4">
                                <div className="relative shrink-0">
                                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/25">
                                        <Trophy className="text-white" size={24} />
                                    </div>
                                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary rounded-full flex items-center justify-center text-xs font-bold text-black border-2 border-background">
                                        {level}
                                    </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-center mb-2">
                                        <p className="text-xs text-gray-400 uppercase tracking-wider font-bold">Current Level</p>
                                        <span className="text-xs text-gray-400">{xpProgress.current}/{xpProgress.needed} XP</span>
                                    </div>
                                    <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${(xpProgress.current / xpProgress.needed) * 100}%` }}
                                            className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Rank Card */}
                            <Link href="/leaderboard" className="glass-panel px-4 py-3 sm:px-6 sm:py-4 rounded-2xl flex items-center gap-4 hover:border-yellow-500/50 transition-colors group">
                                <div className="relative shrink-0">
                                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-yellow-500/30 to-orange-500/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <Trophy className="text-yellow-400" size={24} />
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <p className="text-lg sm:text-x font-bold text-white group-hover:text-yellow-400 transition-colors">View Leaderboard</p>
                                    <p className="text-xs text-gray-500">Check your global ranking</p>
                                </div>
                                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                                    <ChevronDown className="-rotate-90 text-gray-400" size={16} />
                                </div>
                            </Link>
                        </div>
                    </div>
                </motion.div>

                {/* Stats Grid */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8 sm:mb-10"
                >
                    {/* Total XP */}
                    <div className="glass-panel p-4 rounded-2xl">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                                <Star className="text-yellow-400" size={16} />
                            </div>
                            <span className="text-xs text-gray-400 uppercase tracking-wider">Total XP</span>
                        </div>
                        <p className="text-2xl font-bold text-white">{progress.xp}</p>
                    </div>

                    {/* Videos Watched */}
                    <div className="glass-panel p-4 rounded-2xl">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                                <Target className="text-green-400" size={16} />
                            </div>
                            <span className="text-xs text-gray-400 uppercase tracking-wider">Watched</span>
                        </div>
                        <div className="flex items-end gap-2">
                            <p className="text-2xl font-bold text-white">{totalWatched}</p>
                            <span className="text-sm text-gray-500 mb-1">/{totalVideos}</span>
                        </div>
                    </div>

                    {/* Streak */}
                    <div className="glass-panel p-4 rounded-2xl">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center">
                                <Flame className="text-orange-400" size={16} />
                            </div>
                            <span className="text-xs text-gray-400 uppercase tracking-wider">Streak</span>
                        </div>
                        <div className="flex items-end gap-2">
                            <p className="text-2xl font-bold text-white">{progress.streak}</p>
                            <span className="text-sm text-gray-500 mb-1">days</span>
                        </div>
                    </div>

                    {/* Overall Progress */}
                    <div className="glass-panel p-4 rounded-2xl">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                                <Zap className="text-primary" size={16} />
                            </div>
                            <span className="text-xs text-gray-400 uppercase tracking-wider">Progress</span>
                        </div>
                        <div className="flex items-end gap-2">
                            <p className="text-2xl font-bold text-white">{overallProgress}%</p>
                            <span className="text-sm text-gray-500 mb-1">complete</span>
                        </div>
                    </div>
                </motion.div>

                {/* Category Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto mb-12">
                    {/* MIST Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <button
                            onClick={() => toggleCategory('MIST')}
                            className={`w-full glass-panel p-6 rounded-3xl text-left transition-all duration-500 group hover:border-blue-500/30 ${expandedCategory === 'MIST' ? 'border-blue-500/50 bg-blue-500/5' : ''}`}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-blue-500/25 group-hover:scale-110 transition-transform">
                                        M
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-white">MIST</h2>
                                        <p className="text-xs text-gray-400">{countWatched('MIST')}/{countVideos('MIST')} videos • 19 subjects</p>
                                    </div>
                                </div>
                                <motion.div
                                    animate={{ rotate: expandedCategory === 'MIST' ? 180 : 0 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <ChevronDown className="text-gray-400 group-hover:text-blue-400 transition-colors" size={24} />
                                </motion.div>
                            </div>
                            {/* Progress Bar */}
                            <div className="relative">
                                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${getCategoryProgress('MIST')}%` }}
                                        transition={{ duration: 0.8, delay: 0.3 }}
                                        className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full"
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-1 text-right">{getCategoryProgress('MIST')}% complete</p>
                            </div>
                        </button>
                    </motion.div>

                    {/* ARISE Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <button
                            onClick={() => toggleCategory('ARISE')}
                            className={`w-full glass-panel p-6 rounded-3xl text-left transition-all duration-500 group hover:border-purple-500/30 ${expandedCategory === 'ARISE' ? 'border-purple-500/50 bg-purple-500/5' : ''}`}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-purple-500/25 group-hover:scale-110 transition-transform">
                                        A
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-white">ARISE</h2>
                                        <p className="text-xs text-gray-400">{countWatched('ARISE')}/{countVideos('ARISE')} videos • 19 subjects</p>
                                    </div>
                                </div>
                                <motion.div
                                    animate={{ rotate: expandedCategory === 'ARISE' ? 180 : 0 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <ChevronDown className="text-gray-400 group-hover:text-purple-400 transition-colors" size={24} />
                                </motion.div>
                            </div>
                            {/* Progress Bar */}
                            <div className="relative">
                                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${getCategoryProgress('ARISE')}%` }}
                                        transition={{ duration: 0.8, delay: 0.4 }}
                                        className="h-full bg-gradient-to-r from-purple-400 to-purple-600 rounded-full"
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-1 text-right">{getCategoryProgress('ARISE')}% complete</p>
                            </div>
                        </button>
                    </motion.div>
                </div>

                {/* Expanded Content */}
                <AnimatePresence mode="wait">
                    {expandedCategory === 'MIST' && (
                        <motion.section
                            key="mist"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.4, ease: 'easeInOut' }}
                            className="overflow-hidden"
                        >
                            <div className="py-8">
                                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                    <span className="w-2 h-6 bg-blue-500 rounded-full" />
                                    MIST Subjects
                                </h3>
                                <motion.div
                                    variants={container}
                                    initial="hidden"
                                    animate="show"
                                    className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-6"
                                >
                                    {MIST_SUBJECTS.map((subCategory) => {
                                        const subVideos = videos.filter(v =>
                                            v.category === "MIST" &&
                                            v.subCategory?.toLowerCase() === subCategory.toLowerCase()
                                        );
                                        return (
                                            <SeriesCard
                                                key={subCategory}
                                                title={subCategory}
                                                videos={subVideos}
                                                itemVariants={item}
                                                watchedIds={progress.watched}
                                            />
                                        );
                                    })}
                                </motion.div>
                            </div>
                        </motion.section>
                    )}

                    {expandedCategory === 'ARISE' && (
                        <motion.section
                            key="arise"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.4, ease: 'easeInOut' }}
                            className="overflow-hidden"
                        >
                            <div className="py-8">
                                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                    <span className="w-2 h-6 bg-purple-500 rounded-full" />
                                    ARISE Subjects
                                </h3>
                                <motion.div
                                    variants={container}
                                    initial="hidden"
                                    animate="show"
                                    className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-6"
                                >
                                    {MIST_SUBJECTS.map((subCategory) => {
                                        const subVideos = videos.filter(v =>
                                            v.category === "ARISE" &&
                                            v.subCategory?.toLowerCase() === subCategory.toLowerCase()
                                        );
                                        return (
                                            <SeriesCard
                                                key={subCategory}
                                                title={subCategory}
                                                videos={subVideos}
                                                itemVariants={item}
                                                watchedIds={progress.watched}
                                            />
                                        );
                                    })}
                                </motion.div>
                            </div>
                        </motion.section>
                    )}
                </AnimatePresence>
            </div>
        </main>
    );
}
