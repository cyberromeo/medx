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
        <main className="min-h-screen bg-background pb-20 safe-bottom selection:bg-secondary/30">
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
                            className="aspect-video w-full rounded-xl md:rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(0,240,255,0.1)] bg-black relative z-20 -mx-4 md:mx-0 w-[calc(100%+2rem)] md:w-full"
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

                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2 leading-tight">
                                {currentVideo.title}
                            </h1>
                            <div className="flex items-center gap-4 text-sm text-gray-400">
                                <span className="px-2 py-1 bg-primary/10 text-primary rounded text-xs font-bold uppercase tracking-wider">
                                    {currentVideo.subCategory}
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <Clock size={14} />
                                    {currentVideo.duration ? `${Math.floor(currentVideo.duration / 60)} mins` : "Series Part"}
                                </span>
                            </div>
                            <p className="mt-4 text-gray-400 leading-relaxed text-sm md:text-base">
                                {currentVideo.description || `Part from the ${seriesName} series.`}
                            </p>
                        </div>
                    </div>

                    {/* Right/Bottom: Up Next Playlist */}
                    <div className="lg:col-span-1">
                        <div className="glass-panel p-4 md:p-6 rounded-xl md:rounded-2xl lg:h-full lg:max-h-[calc(100vh-150px)] overflow-y-auto">
                            <h3 className="text-base md:text-lg font-bold text-white mb-4 md:mb-6 flex items-center gap-2 sticky top-0 bg-background/80 backdrop-blur-sm py-2 -mt-2">
                                <LayoutList className="text-primary" size={18} />
                                Parts ({videos.length})
                            </h3>

                            {/* Horizontal scroll on mobile (Carousel), vertical list on desktop */}
                            <div className="flex lg:flex-col gap-3 lg:gap-4 overflow-x-auto lg:overflow-x-visible hide-scrollbar -mx-4 px-4 lg:mx-0 lg:px-0 snap-x snap-mandatory pb-4 lg:pb-0">
                                {videos.map((video, index) => {
                                    const isActive = currentVideo.$id === video.$id;
                                    const isWatched = watchedIds.includes(video.$id);
                                    return (
                                        <motion.button
                                            key={video.$id}
                                            onClick={() => setCurrentVideo(video)}
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            className={`text-left p-3 rounded-xl flex gap-3 transition-all duration-300 group flex-shrink-0 w-[85vw] sm:w-[350px] lg:w-full snap-center ${isActive
                                                ? "bg-primary/10 border border-primary/30"
                                                : isWatched
                                                    ? "bg-green-500/5 border border-green-500/20 hover:bg-green-500/10"
                                                    : "hover:bg-white/5 border border-transparent hover:border-white/5"
                                                }`}
                                        >
                                            {/* Tiny Thumbnail */}
                                            <div className="relative w-24 h-16 rounded-lg overflow-hidden shrink-0 bg-black/50">
                                                <img
                                                    src={video.thumbnailUrl}
                                                    alt=""
                                                    className={`w-full h-full object-cover transition-opacity ${isActive ? "opacity-100" : "opacity-60 group-hover:opacity-80"}`}
                                                />
                                                {isActive && (
                                                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-[2px]">
                                                        <div className="flex items-end gap-0.5 h-4">
                                                            <span className="w-1 bg-primary animate-pulse rounded-full" style={{ height: '60%', animationDelay: '0ms' }} />
                                                            <span className="w-1 bg-primary animate-pulse rounded-full" style={{ height: '100%', animationDelay: '150ms' }} />
                                                            <span className="w-1 bg-primary animate-pulse rounded-full" style={{ height: '40%', animationDelay: '300ms' }} />
                                                            <span className="w-1 bg-primary animate-pulse rounded-full" style={{ height: '80%', animationDelay: '450ms' }} />
                                                        </div>
                                                    </div>
                                                )}
                                                {isWatched && !isActive && (
                                                    <div className="absolute top-1 right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                                                        <CheckCircle size={12} className="text-white" />
                                                    </div>
                                                )}
                                            </div>

                                            {/* Text Info */}
                                            <div className="flex-1 min-w-0 py-1">
                                                <h4 className={`text-sm font-semibold truncate ${isActive ? "text-primary text-glow" : isWatched ? "text-green-400" : "text-gray-300 group-hover:text-white"}`}>
                                                    {video.title}
                                                </h4>
                                                <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                                    Part {index + 1}
                                                    {isWatched && <span className="text-green-400">• Done</span>}
                                                </p>
                                            </div>
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
