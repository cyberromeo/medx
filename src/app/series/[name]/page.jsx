"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { collection, query, where, limit, getDocs } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Play,
  Clock,
  LayoutList,
  CheckCircle,
  Star,
} from "lucide-react";
import CustomPlayer from "@/components/CustomPlayer";
import Header from "@/components/Header";
import {
  markVideoStarted,
  markVideoWatched,
  isVideoWatched,
  getProgress,
} from "@/lib/progress";

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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid);
        const progress = await getProgress(user.uid);
        setWatchedIds(progress.watched);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchSeriesVideos = async () => {
      try {
        const q = query(
          collection(db, "videos"),
          limit(1000)
        );
        const snapshot = await getDocs(q);
        const allDocs = snapshot.docs.map((doc) => ({
          $id: doc.id,
          ...doc.data(),
        }));

        // Filter case-insensitively client side
        const docs = allDocs.filter(
          (doc) =>
            doc.subCategory &&
            doc.subCategory.toLowerCase() === seriesName.toLowerCase()
        );

        const sortedDocs = docs.sort((a, b) => {
          return a.title.localeCompare(b.title, undefined, {
            numeric: true,
            sensitivity: "base",
          });
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
  }, [seriesName]);

  // Award 10 XP when a video starts playing
  const handleVideoStart = () => {
    if (currentVideo && userId) {
      markVideoStarted(currentVideo.$id, userId);
    }
  };

  const handleVideoComplete = async () => {
    if (currentVideo && userId) {
      const newProgress = await markVideoWatched(currentVideo.$id, userId);
      if (newProgress) {
        setWatchedIds(newProgress.watched);
        setEarnedXp(
          100 +
            (newProgress.streak > 1
              ? Math.min(newProgress.streak * 10, 100)
              : 0),
        );
        setShowXpToast(true);
        setTimeout(() => setShowXpToast(false), 3000);
      }
    }

    const currentIndex = videos.findIndex((v) => v.$id === currentVideo.$id);
    if (currentIndex < videos.length - 1) {
      setCurrentVideo(videos[currentIndex + 1]);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <div className="halo-bg" />
        <div className="grid-bg" />
        <div className="container mx-auto px-4 pt-24 md:px-6 md:pt-32">
          <div className="mb-6 h-5 w-32 animate-pulse rounded bg-white/5" />
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <div className="aspect-video w-full animate-pulse rounded-2xl bg-white/5" />
              <div className="mt-6 space-y-3">
                <div className="h-8 w-3/4 animate-pulse rounded bg-white/5" />
                <div className="h-4 w-1/2 animate-pulse rounded bg-white/5" />
              </div>
            </div>
            <div className="lg:col-span-1">
              <div className="panel space-y-4 rounded-2xl p-6">
                <div className="h-6 w-24 animate-pulse rounded bg-white/5" />
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="h-16 w-24 shrink-0 animate-pulse rounded-lg bg-white/5" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-full animate-pulse rounded bg-white/5" />
                      <div className="h-3 w-12 animate-pulse rounded bg-white/5" />
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
    <div className="min-h-screen bg-[#f0f0f0] pb-20 relative">
      <div className="absolute top-0 left-0 w-full h-[50vh] bg-gradient-to-b from-blue-100/50 to-transparent pointer-events-none" />
      
      {/* Glassmorphic Sticky Header */}
      <div className="sticky top-0 z-40 bg-white/60 backdrop-blur-md border-b border-[#898989]/10 shadow-sm mb-8">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="group flex items-center gap-2 text-[#898989] font-bold text-sm hover:text-[#303030] transition-colors"
          >
            <ArrowLeft
              size={18}
              className="transition-transform group-hover:-translate-x-1"
            />
            Back to Library
          </button>
          <div className="flex items-center gap-2">
            <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm">
              {seriesName}
            </span>
          </div>
        </div>
      </div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6">
        {/* Empty removal of the old back button because it is moved to the header */}

        <div className="grid grid-cols-1 items-start gap-4 md:gap-8 lg:grid-cols-3">
          <div className="space-y-4 md:space-y-6 lg:col-span-2">
            <div className="relative">
              <div className="absolute -inset-4 bg-blue-500/20 rounded-[2.5rem] blur-2xl pointer-events-none" />
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative aspect-video w-full rounded-[2rem] overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.15)] bg-black ring-1 ring-white/20"
              >
                <CustomPlayer
                  videoId={currentVideo.videoId}
                  thumbnail={currentVideo.thumbnailUrl}
                  onPlay={handleVideoStart}
                  onEnded={handleVideoComplete}
                />
              </motion.div>
            </div>

            <AnimatePresence>
              {showXpToast && (
                <motion.div
                  initial={{ opacity: 0, y: 20, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.9 }}
                  className="panel fixed bottom-20 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-xl px-4 py-3 md:right-8 md:bottom-8 md:left-auto md:translate-x-0 md:gap-4 md:rounded-2xl md:px-6 md:py-4"
                >
                  <div className="grad-primary flex h-10 w-10 items-center justify-center rounded-lg md:h-12 md:w-12 md:rounded-xl">
                    <Star className="text-white" size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900 md:text-base">
                      +{earnedXp} XP
                    </p>
                    <p className="text-muted text-[10px] md:text-xs">
                      Video completed
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="bg-white/60 backdrop-blur-md border border-[#898989]/20 shadow-sm flex flex-wrap items-center gap-3 rounded-[1.5rem] p-4 sm:p-5">
              <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm">{currentVideo.subCategory}</span>
              <span className="text-[#898989] font-medium flex items-center gap-1.5 text-xs md:text-sm">
                <Clock size={14} className="text-[#898989]" />
                {currentVideo.duration && !isNaN(currentVideo.duration)
                  ? `${Math.floor(currentVideo.duration / 60)} mins`
                  : currentVideo.title}
              </span>
            </div>

            <div className="space-y-3">
              <h1 className="text-2xl leading-snug font-bold text-[#303030] md:text-4xl">
                {currentVideo.title}
              </h1>
              {currentVideo.description && (
                <p className="text-[#5E6470] font-medium text-sm leading-relaxed md:text-base">
                  {currentVideo.description}
                </p>
              )}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white/60 backdrop-blur-md border border-[#898989]/20 shadow-sm max-h-[calc(100vh-150px)] overflow-y-auto rounded-[1.5rem] p-4 md:p-6 lg:sticky lg:top-28">
              <h3 className="sticky top-0 z-10 -mx-4 mb-4 flex items-center gap-2 border-b border-[#898989]/10 bg-white/80 px-4 py-3 text-sm font-bold text-[#303030] backdrop-blur-md md:mb-6 md:text-base">
                <LayoutList className="text-blue-600" size={18} />
                <span>Parts</span>
                <span className="text-[#898989] font-semibold">
                  ({videos.length})
                </span>
              </h3>

              <div className="flex flex-col gap-3">
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
                      className={`group relative flex items-center gap-4 overflow-hidden rounded-[1.25rem] p-3 text-left transition-all duration-300 ${
                        isActive
                          ? "bg-blue-50 border-blue-300 border shadow-sm ring-1 ring-blue-500/20"
                          : isWatched
                            ? "border border-[#898989]/20 bg-white shadow-sm hover:border-blue-200"
                            : "border border-transparent hover:bg-white hover:shadow-sm"
                      }`}
                    >
                      <div className="relative h-10 w-16 shrink-0 overflow-hidden rounded-md bg-gray-200 md:h-12 md:w-20">
                        <img
                          src={video.thumbnailUrl}
                          alt=""
                          className={`h-full w-full object-cover transition-all duration-200 ${isActive ? "scale-105 opacity-100" : "opacity-50 group-hover:opacity-75"}`}
                        />
                        {isActive && (
                          <div className="absolute inset-0 flex items-center justify-center bg-white/40">
                            <div className="flex h-3 items-end gap-[2px]">
                              <span
                                className="bg-primary w-[3px] animate-pulse rounded-full"
                                style={{ height: "50%", animationDelay: "0ms" }}
                              />
                              <span
                                className="bg-primary w-[3px] animate-pulse rounded-full"
                                style={{
                                  height: "100%",
                                  animationDelay: "150ms",
                                }}
                              />
                              <span
                                className="bg-primary w-[3px] animate-pulse rounded-full"
                                style={{
                                  height: "35%",
                                  animationDelay: "300ms",
                                }}
                              />
                            </div>
                          </div>
                        )}
                        {isWatched && !isActive && (
                          <div className="bg-secondary absolute top-0.5 right-0.5 flex h-4 w-4 items-center justify-center rounded-full shadow-sm">
                            <CheckCircle size={10} className="text-white" />
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <h4
                          className={`truncate text-xs leading-tight font-medium md:text-sm ${
                            isActive
                              ? "text-primary"
                              : isWatched
                                ? "text-white/80"
                                : "text-muted group-hover:text-white"
                          }`}
                        >
                          {video.title}
                        </h4>
                        <p className="text-muted mt-0.5 flex items-center gap-1.5 text-[10px] md:text-xs">
                          <span>Part {index + 1}</span>
                          {isWatched && (
                            <span className="text-secondary">- Done</span>
                          )}
                        </p>
                      </div>

                      {isActive && (
                        <div className="bg-primary-soft flex h-6 w-6 shrink-0 items-center justify-center rounded-full">
                          <Play
                            size={10}
                            className="text-primary ml-0.5"
                            fill="currentColor"
                          />
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
    </div>
  );
}
