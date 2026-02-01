"use client";

import { useEffect, useState } from "react";
import { account, databases } from "@/lib/appwrite";
import { Query } from "appwrite";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Flame, Target, Star, Zap, ArrowRight, X, ChevronLeft } from "lucide-react";
import SeriesCard from "@/components/SeriesCard";
import { getProgress, calculateLevel, getXpToNextLevel } from "@/lib/progress";

export default function Dashboard() {
    const [user, setUser] = useState(null);
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState(null); // null, 'MIST', or 'ARISE'
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

    const getSubCategoryProgress = (category, subCategory) => {
        const subVideos = videos.filter(v =>
            v.category === category &&
            v.subCategory?.toLowerCase() === subCategory.toLowerCase()
        );
        const watched = subVideos.filter(v => progress.watched.includes(v.$id)).length;
        return subVideos.length > 0 ? Math.round((watched / subVideos.length) * 100) : 0;
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
            transition: { staggerChildren: 0.03 }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 15 },
        show: { opacity: 1, y: 0 }
    };

    // Category Card Component
    const CategoryCard = ({ name, color, gradient, shadowColor }) => {
        const categoryProgress = getCategoryProgress(name);
        const watched = countWatched(name);
        const total = countVideos(name);

        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-panel p-5 md:p-6 rounded-2xl md:rounded-3xl"
            >
                <div className="flex items-center gap-4 mb-4">
                    <div className={`w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-xl md:text-2xl font-bold text-white shadow-lg ${shadowColor}`}>
                        {name.charAt(0)}
                    </div>
                    <div className="flex-1">
                        <h2 className="text-lg md:text-xl font-bold text-white">{name}</h2>
                        <p className="text-xs text-gray-500">{watched}/{total} videos • 19 subjects</p>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                    <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${categoryProgress}%` }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className={`h-full bg-gradient-to-r ${gradient} rounded-full`}
                        />
                    </div>
                    <p className="text-[10px] text-gray-600 mt-1 text-right">{categoryProgress}% complete</p>
                </div>

                {/* Open Button */}
                <button
                    onClick={() => setSelectedCategory(name)}
                    className={`w-full py-3 rounded-xl border ${color} bg-${color.split('-')[1]}-500/10 text-white font-medium text-sm flex items-center justify-center gap-2 hover:bg-${color.split('-')[1]}-500/20 transition-all active:scale-[0.98]`}
                    style={{
                        backgroundColor: name === 'MIST' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(168, 85, 247, 0.1)',
                        borderColor: name === 'MIST' ? 'rgba(59, 130, 246, 0.3)' : 'rgba(168, 85, 247, 0.3)',
                    }}
                >
                    <span>Open {name}</span>
                    <ArrowRight size={16} />
                </button>
            </motion.div>
        );
    };

    return (
        <main className="min-h-screen bg-background pb-32 safe-bottom selection:bg-secondary/30">
            <Header />
            <div className="mesh-bg" />
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
                                <h1 className="hero-text text-2xl sm:text-4xl mb-1">
                                    Welcome, <span className="text-gradient">Dr. {user?.name?.split(' ')[0]}</span>
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
                                    <ArrowRight className="text-gray-400" size={16} />
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
                    <div className="card-premium p-4">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                                <Star className="text-yellow-400" size={16} />
                            </div>
                            <span className="text-xs text-gray-400 uppercase tracking-wider">Total XP</span>
                        </div>
                        <p className="text-2xl font-bold text-white">{progress.xp}</p>
                    </div>

                    {/* Videos Watched */}
                    <div className="card-premium p-4">
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
                    <div className="card-premium p-4">
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
                    <div className="card-premium p-4">
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

                {/* Category Cards with Open Button */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 max-w-3xl mx-auto mb-12">
                    <CategoryCard
                        name="MIST"
                        color="border-blue-500/30"
                        gradient="from-blue-500 to-blue-700"
                        shadowColor="shadow-blue-500/25"
                    />
                    <CategoryCard
                        name="ARISE"
                        color="border-purple-500/30"
                        gradient="from-purple-500 to-purple-700"
                        shadowColor="shadow-purple-500/25"
                    />
                </div>
            </div>

            {/* Fullscreen Category View */}
            <AnimatePresence>
                {selectedCategory && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-background/95 backdrop-blur-xl overflow-y-auto"
                    >
                        {/* Header */}
                        <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-xl border-b border-white/5">
                            <div className="container mx-auto px-4 py-4 flex items-center gap-4">
                                <button
                                    onClick={() => setSelectedCategory(null)}
                                    className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
                                >
                                    <ChevronLeft size={20} className="text-white" />
                                </button>
                                <div className="flex-1">
                                    <h1 className="text-lg font-bold text-white">{selectedCategory} Subjects</h1>
                                    <p className="text-xs text-gray-500">19 subjects • {countVideos(selectedCategory)} videos</p>
                                </div>
                                <button
                                    onClick={() => setSelectedCategory(null)}
                                    className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors md:hidden"
                                >
                                    <X size={20} className="text-white" />
                                </button>
                            </div>
                        </div>

                        {/* Subjects Grid */}
                        <div className="container mx-auto px-4 py-6">
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
                                    const subProgress = getSubCategoryProgress(selectedCategory, subCategory);
                                    const watchedCount = subVideos.filter(v => progress.watched.includes(v.$id)).length;

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
