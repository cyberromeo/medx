"use client";

import { useEffect, useState } from "react";
import { use } from "react";
import { account, databases } from "@/lib/appwrite";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import CustomPlayer from "@/components/CustomPlayer";
import Link from "next/link";
import { ArrowLeft, MessageSquare } from "lucide-react";
import { useChatX } from "@/components/ChatXProvider";

export default function WatchPage({ params }) {
  const { id } = use(params);

  const [video, setVideo] = useState(null);
  const [initialTime, setInitialTime] = useState(0);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { openChat } = useChatX();

  const DB_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
  const COL_ID = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ID;

  useEffect(() => {
    checkAuth();

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
  }, []);

  const checkAuth = async () => {
    try {
      await account.get();
      await fetchVideo(id);
    } catch {
      router.push("/login");
    }
  };

  const fetchVideo = async (videoId) => {
    if (!DB_ID || !COL_ID) return;
    try {
      const doc = await databases.getDocument(DB_ID, COL_ID, videoId);
      setVideo(doc);
    } catch (err) {
      console.error("Video not found", err);
    } finally {
      setLoading(false);
    }
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
              />
            </div>

            <div className="panel rounded-2xl p-4 sm:p-5 flex flex-wrap items-center gap-3">
              <span className="tag">{video.category}</span>
              <span className="text-sm text-muted">{video.duration}</span>
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

      <button
        onClick={openChat}
        className="fixed bottom-6 right-6 w-14 h-14 grad-primary rounded-full flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all z-50 md:hidden"
      >
        <MessageSquare size={24} className="text-white" />
      </button>
    </main>
  );
}
