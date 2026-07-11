"use client";

import { useEffect, useState } from "react";
import { use } from "react";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
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
  const [toast, setToast] = useState({ show: false, xp: 0, type: "start", streakBonus: 0, leveledUp: false, newLevel: null });
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
      const saved = localStorage.getItem('medx_last_active');
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
        setToast({ show: true, xp: result.xp, type: "start", streakBonus: 0, leveledUp: false, newLevel: null });
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
          newLevel: result.newLevel
        });
      }
    }
  };

  const clearToast = () => {
    setToast(prev => ({ ...prev, show: false }));
  };

  if (loading) return (
    <div className="min-h-screen">
      <Header />
      <div className="halo-bg" />
      <div className="grid-bg" />
      <div className="container mx-auto px-6 pt-32">
        <div className="h-5 w-32 bg-white/5 rounded animate-pulse mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-6">
            <div className="aspect-video rounded-2xl bg-white/5 animate-pulse" />
            <div className="space-y-3">
              <div className="h-6 w-24 bg-white/5 rounded animate-pulse" />
              <div className="h-8 w-3/4 bg-white/5 rounded animate-pulse" />
            </div>
          </div>
          <div className="panel p-6 rounded-2xl h-fit space-y-4">
            <div className="h-4 w-24 bg-white/5 rounded animate-pulse" />
            <div className="h-20 w-full bg-white/5 rounded animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );

  if (!video) return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center text-center p-6">
      <h1 className="text-2xl font-bold mb-4">Video Not Found</h1>
      <Link href="/dashboard" className="text-primary hover:underline">Back to Dashboard</Link>
    </div>
  );

  return (
    <main className="min-h-screen pb-6">
      <Header />
      <div className="halo-bg" />
      <div className="grid-bg" />

      <div className="container mx-auto px-6 pt-32">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-muted hover:text-white mb-8 transition-colors">
          <ArrowLeft size={18} />
          Back to Library
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-6">
            <div className="panel-glow rounded-2xl overflow-hidden shadow-[0_20px_60px_rgba(2,6,23,0.6)]">
              <CustomPlayer
                videoId={video.videoId}
                title={video.title}
                docId={video.$id}
                initialTime={initialTime}
                onPlay={handlePlay}
                onEnded={handleEnded}
              />
            </div>

            <div className="panel rounded-2xl p-4 sm:p-5 flex flex-wrap items-center gap-3">
              <span className="tag">{video.category}</span>
              <span className="text-sm text-muted">{video.duration}</span>
              <div className="ml-auto flex items-center gap-2">
                <div className="flex items-center gap-1.5 text-xs bg-white/5 rounded-lg px-3 py-1.5 border border-white/10">
                  <Star className="text-secondary" size={13} />
                  <span className="font-semibold text-white/80">+10 start</span>
                  <span className="text-white/30 mx-1">·</span>
                  <span className="font-semibold text-white/80">+100 finish</span>
                </div>
              </div>
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-3">{video.title}</h1>
            </div>
          </div>

          <div className="panel rounded-2xl p-6 h-fit">
            <h3 className="text-xs font-bold text-muted uppercase tracking-widest mb-4">Description</h3>
            <p className="text-muted leading-relaxed whitespace-pre-wrap text-sm">
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
        className="fixed bottom-6 right-6 w-14 h-14 grad-primary rounded-full flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all z-50 md:hidden"
      >
        <MessageSquare size={24} className="text-white" />
      </button>
    </main>
  );
}
