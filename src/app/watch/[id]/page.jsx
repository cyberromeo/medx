"use client";

import { useEffect, useState } from "react";
import { use } from "react";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import CustomPlayer from "@/components/CustomPlayer";
import XpToast from "@/components/XpToast";
import Link from "next/link";
import { ArrowLeft, MessageSquare, Star, Flame } from "lucide-react";
import { useChatX } from "@/components/ChatXProvider";
import { markVideoStarted, markVideoWatched } from "@/lib/progress";

export default function WatchPage({ params }) {
  const { id } = use(params);

  const [video, setVideo] = useState(null);
  const [initialTime, setInitialTime] = useState(0);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [toast, setToast] = useState({
    show: false,
    xp: 0,
    type: "start",
    streakBonus: 0,
    leveledUp: false,
    newLevel: null,
  });
  const router = useRouter();
  const { openChat } = useChatX();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUserId(currentUser.uid);
        await fetchVideo(id);
      } else {
        router.push("/login");
      }
    });

    // Check for saved progress
    try {
      const saved = localStorage.getItem("medx_last_active");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.videoId === id) {
          setInitialTime(parsed.timestamp);
        }
      }
    } catch (e) {
      console.error("Error loading progress", e);
    }

    return () => unsubscribe();
  }, [id, router]);

  const fetchVideo = async (videoId) => {
    try {
      const docRef = doc(db, "videos", videoId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setVideo({ $id: docSnap.id, ...docSnap.data() });
      } else {
        setVideo(null);
      }
    } catch (err) {
      console.error("Video not found", err);
    } finally {
      setLoading(false);
    }
  };

  // Award 10 XP when a video is played
  const handlePlay = async () => {
    if (userId && video) {
      const result = await markVideoStarted(video.$id, userId);
      if (result.awarded) {
        setToast({
          show: true,
          xp: result.xp,
          type: "start",
          streakBonus: 0,
          leveledUp: false,
          newLevel: null,
        });
      }
    }
  };

  // Award 100 XP when a video is finished
  const handleEnded = async () => {
    if (userId && video) {
      const result = await markVideoWatched(video.$id, userId);
      if (result.xpAwarded > 0) {
        setToast({
          show: true,
          xp: result.xpAwarded,
          type: "complete",
          streakBonus: result.streakBonus,
          leveledUp: result.leveledUp,
          newLevel: result.newLevel,
        });
      }
    }
  };

  const clearToast = () => {
    setToast((prev) => ({ ...prev, show: false }));
  };

  if (loading)
    return (
      <div className="min-h-screen">
        <div className="halo-bg" />
        <div className="grid-bg" />
        <div className="container mx-auto px-6 pt-32">
          <div className="mb-8 h-5 w-32 animate-pulse rounded bg-gray-200" />
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <div className="aspect-video animate-pulse rounded-2xl bg-gray-200" />
              <div className="space-y-3">
                <div className="h-6 w-24 animate-pulse rounded bg-gray-200" />
                <div className="h-8 w-3/4 animate-pulse rounded bg-gray-200" />
              </div>
            </div>
            <div className="panel h-fit space-y-4 rounded-2xl p-6">
              <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
              <div className="h-20 w-full animate-pulse rounded bg-gray-200" />
            </div>
          </div>
        </div>
      </div>
    );

  if (!video)
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-6 text-center">
        <h1 className="mb-4 text-2xl font-bold text-gray-900">
          Video Not Found
        </h1>
        <Link href="/dashboard" className="text-primary hover:underline">
          Back to Dashboard
        </Link>
      </div>
    );

  return (
    <div className="p-6 sm:p-10 relative h-full">
      <div className="halo-bg" />
      <div className="grid-bg" />

      <div className="container mx-auto">
        <Link
          href="/dashboard"
          className="text-muted mb-8 inline-flex items-center gap-2 transition-colors hover:text-gray-900"
        >
          <ArrowLeft size={18} />
          Back to Library
        </Link>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <div className="panel-glow overflow-hidden rounded-2xl shadow-[0_20px_60px_rgba(2,6,23,0.6)]">
              <CustomPlayer
                videoId={video.videoId}
                title={video.title}
                docId={video.$id}
                initialTime={initialTime}
                onPlay={handlePlay}
                onEnded={handleEnded}
              />
            </div>

            <div className="panel flex flex-wrap items-center gap-3 rounded-2xl p-4 sm:p-5">
              <span className="tag">{video.category}</span>
              <span className="text-muted text-sm">{video.duration}</span>
              <div className="ml-auto flex items-center gap-2">
                <div className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-100 px-3 py-1.5 text-xs">
                  <Star className="text-secondary" size={13} />
                  <span className="font-semibold text-gray-700">+10 start</span>
                  <span className="mx-1 text-gray-400">·</span>
                  <span className="font-semibold text-gray-700">
                    +100 finish
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h1 className="mb-3 text-2xl font-bold text-gray-900 sm:text-3xl">
                {video.title}
              </h1>
            </div>
          </div>

          <div className="panel h-fit rounded-2xl p-6">
            <h3 className="text-muted mb-4 text-xs font-bold tracking-widest uppercase">
              Description
            </h3>
            <p className="text-muted text-sm leading-relaxed whitespace-pre-wrap">
              {video.description}
            </p>
          </div>
        </div>
      </div>

      {/* XP Toast */}
      <XpToast
        show={toast.show}
        xp={toast.xp}
        type={toast.type}
        streakBonus={toast.streakBonus}
        leveledUp={toast.leveledUp}
        newLevel={toast.newLevel}
        onDone={clearToast}
      />

      <button
        onClick={openChat}
        className="grad-primary fixed right-6 bottom-6 z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all hover:scale-110 active:scale-95 md:hidden"
      >
        <MessageSquare size={24} className="text-white" />
      </button>
    </div>
  );
}
