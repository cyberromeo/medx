"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { collection, query, limit, getDocs } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useParams, useRouter, useSearchParams } from "next/navigation";
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
import {
  markVideoStarted,
  markVideoWatched,
  getProgress,
} from "@/lib/progress";

export default function SeriesPlayerPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const seriesName = decodeURIComponent(params.name);
  const categoryParam = searchParams.get("category");

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
        const q = query(collection(db, "videos"), limit(1000));
        const snapshot = await getDocs(q);
        const allDocs = snapshot.docs.map((doc) => ({
          $id: doc.id,
          ...doc.data(),
        }));

        const docs = allDocs.filter((doc) => {
          const matchesCategory = categoryParam ? doc.category === categoryParam : true;
          const matchesSubCategory = doc.subCategory && doc.subCategory.toLowerCase() === seriesName.toLowerCase();
          return matchesCategory && matchesSubCategory;
        });

        const sortedDocs = docs.sort((a, b) =>
          a.title.localeCompare(b.title, undefined, {
            numeric: true,
            sensitivity: "base",
          }),
        );

        setVideos(sortedDocs);
        if (sortedDocs.length > 0) setCurrentVideo(sortedDocs[0]);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSeriesVideos();
  }, [seriesName]);

  const handleVideoStart = () => {
    if (currentVideo && userId) markVideoStarted(currentVideo.$id, userId);
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
    if (currentIndex < videos.length - 1)
      setCurrentVideo(videos[currentIndex + 1]);
  };

  if (loading) {
    return (
      <div className="p-6 md:p-10">
        <div className="mx-auto max-w-6xl">
          <div className="mb-6 h-5 w-32 animate-pulse rounded bg-gray-200/60" />
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <div className="aspect-video w-full animate-pulse rounded-[1.5rem] bg-gray-200/40" />
              <div className="mt-6 space-y-3">
                <div className="h-8 w-3/4 animate-pulse rounded bg-gray-200/40" />
                <div className="h-4 w-1/2 animate-pulse rounded bg-gray-200/40" />
              </div>
            </div>
            <div className="lg:col-span-1">
              <div className="space-y-4 rounded-[1.5rem] border border-[rgba(30,50,90,0.05)] bg-white p-6">
                <div className="h-6 w-24 animate-pulse rounded bg-gray-200/40" />
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="h-16 w-24 shrink-0 animate-pulse rounded-lg bg-gray-200/40" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-full animate-pulse rounded bg-gray-200/40" />
                      <div className="h-3 w-12 animate-pulse rounded bg-gray-200/40" />
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
    <div className="bg-[#f0f0f0] pb-20">
      {/* Sticky header */}
      <div className="sticky top-0 z-40 mb-6 border-b border-[rgba(30,50,90,0.06)] bg-white/90 shadow-sm backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <button
            onClick={() => router.back()}
            className="group flex items-center gap-2 text-sm font-semibold text-gray-500 transition-colors hover:text-gray-900"
          >
            <ArrowLeft
              size={18}
              className="transition-transform group-hover:-translate-x-1"
            />
            Back to Library
          </button>
          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold tracking-wider text-blue-600 uppercase">
            {seriesName}
          </span>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid grid-cols-1 items-start gap-4 md:gap-8 lg:grid-cols-3">
          <div className="space-y-4 md:space-y-6 lg:col-span-2">
            <div className="relative">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative aspect-video w-full overflow-hidden rounded-[1.5rem] border border-[rgba(30,50,90,0.05)] bg-black shadow-[0_8px_30px_rgba(0,0,0,0.08)] md:rounded-[2rem]"
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
                  className="fixed bottom-20 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-2xl border border-[rgba(30,50,90,0.05)] bg-white px-4 py-3 shadow-lg md:bottom-8 md:right-8 md:left-auto md:translate-x-0 md:px-6 md:py-4"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 md:h-12 md:w-12">
                    <Star className="text-white" size={20} />
                  </div>
                  <div>
                    <p className="text-base font-bold text-gray-900">
                      +{earnedXp} XP
                    </p>
                    <p className="text-xs text-gray-500">Video completed</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex flex-wrap items-center gap-3 rounded-[1.5rem] border border-[rgba(30,50,90,0.05)] bg-white p-4 shadow-sm md:p-5">
              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold tracking-wider text-blue-600 uppercase">
                {currentVideo.subCategory}
              </span>
              <span className="flex items-center gap-1.5 text-xs font-medium text-gray-500 md:text-sm">
                <Clock size={14} className="text-gray-400" />
                {currentVideo.duration && !isNaN(currentVideo.duration)
                  ? `${Math.floor(currentVideo.duration / 60)} mins`
                  : currentVideo.title}
              </span>
            </div>

            <div className="space-y-3">
              <h1 className="text-2xl font-bold leading-snug text-gray-900 md:text-4xl">
                {currentVideo.title}
              </h1>
              {currentVideo.description && (
                <p className="text-sm font-medium leading-relaxed text-gray-500 md:text-base">
                  {currentVideo.description}
                </p>
              )}
            </div>
          </div>

          {/* Parts sidebar */}
          <div className="lg:col-span-1">
            <div className="max-h-[calc(100vh-150px)] overflow-y-auto rounded-[1.5rem] border border-[rgba(30,50,90,0.05)] bg-white p-4 shadow-sm md:p-6 lg:sticky lg:top-20">
              <h3 className="sticky top-0 z-10 -mx-4 mb-4 flex items-center gap-2 border-b border-[rgba(30,50,90,0.06)] bg-white px-4 py-3 text-sm font-bold text-gray-900 backdrop-blur-md md:mb-6 md:text-base">
                <LayoutList className="text-blue-600" size={18} />
                <span>Parts</span>
                <span className="font-semibold text-gray-400">
                  ({videos.length})
                </span>
              </h3>

              <div className="flex flex-col gap-2.5">
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
                      className={`group relative flex items-center gap-4 overflow-hidden rounded-2xl border p-3 text-left transition-all duration-300 ${
                        isActive
                          ? "border-blue-200 bg-blue-50 shadow-sm"
                          : isWatched
                            ? "border-[rgba(30,50,90,0.05)] bg-white shadow-sm hover:border-gray-200"
                            : "border-transparent hover:bg-gray-50"
                      }`}
                    >
                      <div className="relative h-10 w-16 shrink-0 overflow-hidden rounded-md bg-gray-200 md:h-12 md:w-20">
                        <img
                          src={video.thumbnailUrl}
                          alt=""
                          className={`h-full w-full object-cover transition-all duration-200 ${isActive ? "scale-105 opacity-100" : "opacity-60 group-hover:opacity-90"}`}
                        />
                        {isActive && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                            <div className="flex h-3 items-end gap-[2px]">
                              <span
                                className="w-[3px] animate-pulse rounded-full bg-white"
                                style={{ height: "50%" }}
                              />
                              <span
                                className="w-[3px] animate-pulse rounded-full bg-white"
                                style={{ height: "100%", animationDelay: "150ms" }}
                              />
                              <span
                                className="w-[3px] animate-pulse rounded-full bg-white"
                                style={{ height: "35%", animationDelay: "300ms" }}
                              />
                            </div>
                          </div>
                        )}
                        {isWatched && !isActive && (
                          <div className="absolute top-0.5 right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 shadow-sm">
                            <CheckCircle size={10} className="text-white" />
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <h4
                          className={`truncate text-xs font-medium leading-tight md:text-sm ${
                            isActive
                              ? "text-blue-600"
                              : "text-gray-700 group-hover:text-gray-900"
                          }`}
                        >
                          {video.title}
                        </h4>
                        <p className="mt-0.5 flex items-center gap-1.5 text-[10px] text-gray-400 md:text-xs">
                          <span>Part {index + 1}</span>
                          {isWatched && (
                            <span className="text-blue-600">- Done</span>
                          )}
                        </p>
                      </div>

                      {isActive && (
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-600">
                          <Play
                            size={10}
                            className="ml-0.5 text-white"
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