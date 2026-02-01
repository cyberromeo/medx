"use client";

import { useEffect, useState } from "react";
import { databases, account } from "@/lib/appwrite";
import { Query } from "appwrite";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Play, Clock, LayoutList, CheckCircle, Star } from "lucide-react";
import CustomPlayer from "@/components/CustomPlayer";
import Header from "@/components/Header";
import { markVideoWatched, isVideoWatched, getProgress } from "@/lib/progress";

export default function SeriesPlayerPage() {
    const params = useParams();
    const router = useRouter();
    const seriesName = decodeURIComponent(params.name);

    const [videos, setVideos] = useState([]);
    const [currentVideo, setCurrentVideo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [watchedIds, setWatchedIds] = useState([]);
    const [showXpToast, setShowXpToast] = useState(false);
    const [earnedXp, setEarnedXp] = useState(0);
    const [userId, setUserId] = useState(null);

    const DB_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
    const COL_ID = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ID;

    useEffect(() => {
        const init = async () => {
            try {
                // Get current user
                const user = await account.get();
                setUserId(user.$id);

                // Fetch progress from Appwrite
                const progress = await getProgress(user.$id);
                setWatchedIds(progress.watched);
            } catch (err) {
                console.error('Auth error:', err);
            }
        };
        init();
    }, []);

    useEffect(() => {
        const fetchSeriesVideos = async () => {
            try {
                const response = await databases.listDocuments(DB_ID, COL_ID, [
                    Query.equal("subCategory", seriesName),
                    Query.limit(100)
                ]);

                const sortedDocs = response.documents.sort((a, b) => {
                    return a.title.localeCompare(b.title, undefined, { numeric: true, sensitivity: 'base' });
                });

                setVideos(sortedDocs);
                if (sortedDocs.length > 0) {
                    setCurrentVideo(sortedDocs[0]);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchSeriesVideos();
    }, [seriesName, DB_ID, COL_ID]);

    const handleVideoComplete = async () => {
        if (currentVideo && userId && !isVideoWatched(watchedIds, currentVideo.$id)) {
            const newProgress = await markVideoWatched(currentVideo.$id, userId);
            setWatchedIds(newProgress.watched);
            setEarnedXp(100 + (newProgress.streak > 1 ? Math.min(newProgress.streak * 10, 100) : 0));
            setShowXpToast(true);
            setTimeout(() => setShowXpToast(false), 3000);
        }

        // Auto-play next video
        const currentIndex = videos.findIndex(v => v.$id === currentVideo.$id);
        if (currentIndex < videos.length - 1) {
            setCurrentVideo(videos[currentIndex + 1]);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background">
                <Header />
                <div className="aurora-bg" />
                <div className="container mx-auto px-4 md:px-6 pt-24 md:pt-32">
                    <div className="h-5 w-32 bg-white/5 rounded shimmer mb-6" />
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2">
                            <div className="aspect-video w-full rounded-2xl bg-white/5 shimmer" />
                            <div className="mt-6 space-y-3">
                                <div className="h-8 w-3/4 bg-white/5 rounded shimmer" />
                                <div className="h-4 w-1/2 bg-white/5 rounded shimmer" />
                            </div>
                        </div>
                        <div className="lg:col-span-1">
                            <div className="glass-panel p-6 rounded-2xl space-y-4">
                                <div className="h-6 w-24 bg-white/5 rounded shimmer" />
                                {[...Array(4)].map((_, i) => (
                                    <div key={i} className="flex gap-3">
                                        <div className="w-24 h-16 bg-white/5 rounded-lg shimmer shrink-0" />
                                        <div className="flex-1 space-y-2">
                                            <div className="h-4 w-full bg-white/5 rounded shimmer" />
                                            <div className="h-3 w-12 bg-white/5 rounded shimmer" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!currentVideo) return null;

    return (
        <main className="min-h-screen bg-background pb-6 safe-bottom selection:bg-secondary/30">
            <Header />
            <div className="aurora-bg" />

            {/* Backdrop Blur behind player */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 w-full h-[60vh] bg-gradient-to-b from-blue-900/10 to-background z-0" />
            </div>

            <div className="container mx-auto px-4 md:px-6 pt-24 md:pt-32 relative z-10">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors group"
                >
                    <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                    Back to Library
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">
                    {/* Left/Top: Main Player */}
                    <div className="lg:col-span-2 space-y-4 md:space-y-6">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="aspect-video w-full rounded-xl md:rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(0,240,255,0.1)] bg-black relative z-20"
                        >
                            <CustomPlayer
                                videoId={currentVideo.videoId}
                                thumbnail={currentVideo.thumbnailUrl}
                                onEnded={handleVideoComplete}
                            />
                        </motion.div>

                        {/* XP Toast - Bottom center on mobile */}
                        <AnimatePresence>
                            {showXpToast && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20, scale: 0.9 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -20, scale: 0.9 }}
                                    className="fixed bottom-20 left-1/2 -translate-x-1/2 md:bottom-8 md:right-8 md:left-auto md:translate-x-0 z-50 glass-panel px-4 py-3 md:px-6 md:py-4 rounded-xl md:rounded-2xl flex items-center gap-3 md:gap-4"
                                >
                                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
                                        <Star className="text-white" size={20} />
                                    </div>
                                    <div>
                                        <p className="text-white font-bold text-sm md:text-base">+{earnedXp} XP</p>
                                        <p className="text-[10px] md:text-xs text-gray-400">Video completed!</p>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="space-y-3">
                            <h1 className="text-xl md:text-3xl font-bold text-white leading-snug">
                                {currentVideo.title}
                            </h1>
                            <div className="flex flex-wrap items-center gap-2 md:gap-3">
                                <span className="px-2.5 py-1 bg-primary/15 text-primary rounded-full text-[11px] md:text-xs font-semibold uppercase tracking-wide border border-primary/20">
                                    {currentVideo.subCategory}
                                </span>
                                <span className="flex items-center gap-1.5 text-gray-500 text-xs md:text-sm">
                                    <Clock size={13} className="text-gray-600" />
                                    {currentVideo.duration && !isNaN(currentVideo.duration)
                                        ? `${Math.floor(currentVideo.duration / 60)} mins`
                                        : currentVideo.title}
                                </span>
                            </div>
                            {currentVideo.description && (
                                <p className="text-gray-500 leading-relaxed text-sm hidden md:block">
                                    {currentVideo.description}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Right/Bottom: Up Next Playlist */}
                    <div className="lg:col-span-1">
                        <div className="glass-panel p-3 md:p-5 rounded-xl md:rounded-2xl lg:h-full lg:max-h-[calc(100vh-150px)] overflow-y-auto">
                            <h3 className="text-sm md:text-base font-semibold text-white mb-3 md:mb-4 flex items-center gap-2 sticky top-0 bg-background/90 backdrop-blur-md py-2 -mt-1 z-10">
                                <LayoutList className="text-primary" size={16} />
                                <span>Parts</span>
                                <span className="text-gray-500 font-normal">({videos.length})</span>
                            </h3>

                            {/* Compact vertical list on mobile, slightly larger on desktop */}
                            <div className="flex flex-col gap-1.5 md:gap-2">
                                {videos.map((video, index) => {
                                    const isActive = currentVideo.$id === video.$id;
                                    const isWatched = watchedIds.includes(video.$id);
                                    return (
                                        <motion.button
                                            key={video.$id}
                                            onClick={() => setCurrentVideo(video)}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.03 }}
                                            className={`text-left p-2 md:p-2.5 rounded-lg flex items-center gap-2.5 md:gap-3 transition-all duration-200 group relative overflow-hidden ${isActive
                                                ? "bg-primary/10 border-l-2 border-primary"
                                                : isWatched
                                                    ? "bg-green-500/5 border-l-2 border-green-500/50 hover:bg-green-500/10"
                                                    : "hover:bg-white/5 border-l-2 border-transparent hover:border-white/10"
                                                }`}
                                        >
                                            {/* Compact Thumbnail */}
                                            <div className="relative w-16 h-10 md:w-20 md:h-12 rounded-md overflow-hidden shrink-0 bg-black/40">
                                                <img
                                                    src={video.thumbnailUrl}
                                                    alt=""
                                                    className={`w-full h-full object-cover transition-all duration-200 ${isActive ? "opacity-100 scale-105" : "opacity-50 group-hover:opacity-75"
                                                        }`}
                                                />
                                                {isActive && (
                                                    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                                                        <div className="flex items-end gap-[2px] h-3">
                                                            <span className="w-[3px] bg-primary rounded-full animate-pulse" style={{ height: '50%', animationDelay: '0ms' }} />
                                                            <span className="w-[3px] bg-primary rounded-full animate-pulse" style={{ height: '100%', animationDelay: '150ms' }} />
                                                            <span className="w-[3px] bg-primary rounded-full animate-pulse" style={{ height: '35%', animationDelay: '300ms' }} />
                                                        </div>
                                                    </div>
                                                )}
                                                {isWatched && !isActive && (
                                                    <div className="absolute top-0.5 right-0.5 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center shadow-sm">
                                                        <CheckCircle size={10} className="text-white" />
                                                    </div>
                                                )}
                                            </div>

                                            {/* Text Info - Compact */}
                                            <div className="flex-1 min-w-0">
                                                <h4 className={`text-xs md:text-sm font-medium truncate leading-tight ${isActive
                                                    ? "text-primary"
                                                    : isWatched
                                                        ? "text-green-400/90"
                                                        : "text-gray-400 group-hover:text-gray-200"
                                                    }`}>
                                                    {video.title}
                                                </h4>
                                                <p className="text-[10px] md:text-xs text-gray-600 mt-0.5 flex items-center gap-1.5">
                                                    <span>Part {index + 1}</span>
                                                    {isWatched && <span className="text-green-500/80">• Done</span>}
                                                </p>
                                            </div>

                                            {/* Play indicator for active */}
                                            {isActive && (
                                                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                                                    <Play size={10} className="text-primary ml-0.5" fill="currentColor" />
                                                </div>
                                            )}
                                        </motion.button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
