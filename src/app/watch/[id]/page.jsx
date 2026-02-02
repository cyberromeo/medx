"use client";

import { useEffect, useState } from "react";
import { use } from "react"; // Next.js 15+ hook for params
import { client, account, databases } from "@/lib/appwrite";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import CustomPlayer from "@/components/CustomPlayer";
import Link from "next/link";
import { ArrowLeft, MessageSquare } from "lucide-react";

export default function WatchPage({ params }) {
    // Unwrap params in Next.js 15
    const { id } = use(params);

    const [user, setUser] = useState(null);
    const [video, setVideo] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const DB_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
    const COL_ID = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ID;

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const current = await account.get();
            setUser(current);
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
        <div className="min-h-screen bg-background">
            <Header />
            <div className="mesh-bg" />
            <div className="aurora-bg" />
            <div className="container mx-auto px-6 pt-32">
                <div className="h-5 w-32 bg-white/5 rounded shimmer mb-8" />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="aspect-video rounded-2xl bg-white/5 shimmer" />
                        <div className="space-y-3">
                            <div className="h-6 w-24 bg-white/5 rounded shimmer" />
                            <div className="h-8 w-3/4 bg-white/5 rounded shimmer" />
                        </div>
                    </div>
                    <div className="bg-surface/50 p-6 rounded-2xl border border-white/5 h-fit space-y-4">
                        <div className="h-4 w-24 bg-white/5 rounded shimmer" />
                        <div className="h-20 w-full bg-white/5 rounded shimmer" />
                    </div>
                </div>
            </div>
        </div>
    );

    if (!video) return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center text-center p-6">
            <h1 className="text-2xl font-bold mb-4">Video Not Found</h1>
            <Link href="/dashboard" className="text-primary hover:underline">Back to Dashboard</Link>
        </div>
    );

    return (
        <main className="min-h-screen bg-background pb-6 safe-bottom">
            <Header />
            <div className="mesh-bg" />
            <div className="aurora-bg" />

            <div className="container mx-auto px-6 pt-32">
                <Link href="/dashboard" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors">
                    <ArrowLeft size={18} />
                    Back to Library
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    <div className="lg:col-span-2 space-y-6">
                        {/* Video Player */}
                        <CustomPlayer videoId={video.videoId} />

                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                                    {video.category}
                                </span>
                                <span className="text-gray-500 text-sm">{video.duration}</span>
                            </div>
                            <h1 className="text-3xl font-bold text-white mb-4">{video.title}</h1>
                        </div>
                    </div>

                    <div className="glass-panel p-6 rounded-2xl h-fit">
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Description</h3>
                        <p className="text-gray-300 leading-relaxed whitespace-pre-wrap text-sm">
                            {video.description}
                        </p>
                    </div>
                </div>
            </div>

            {/* Floating Chat Button */}
            <Link
                href="/chatx"
                className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-primary to-blue-600 rounded-full flex items-center justify-center shadow-lg shadow-primary/30 hover:scale-110 active:scale-95 transition-all z-50 md:hidden"
            >
                <MessageSquare size={24} className="text-white" />
            </Link>
        </main>
    );
}
