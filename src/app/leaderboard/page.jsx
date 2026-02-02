"use client";

import { useEffect, useState } from "react";
import { account, databases } from "@/lib/appwrite";
import { Query } from "appwrite";
import Header from "@/components/Header";
import { motion } from "framer-motion";
import { Trophy, Medal, Crown, Star, ArrowLeft, User } from "lucide-react";
import Link from "next/link";
import { calculateLevel } from "@/lib/progress";

export default function LeaderboardPage() {
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentUserId, setCurrentUserId] = useState(null);
    const [currentUserRank, setCurrentUserRank] = useState(null);

    const DB_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
    const PROGRESS_COL_ID = process.env.NEXT_PUBLIC_APPWRITE_PROGRESS_COLLECTION_ID;

    useEffect(() => {
        fetchLeaderboard();
    }, []);

    const fetchLeaderboard = async () => {
        try {
            // Get current user
            const user = await account.get();
            setCurrentUserId(user.$id);

            // Fetch leaderboard from server API (bypasses RLS)
            const response = await fetch('/api/leaderboard');
            if (!response.ok) throw new Error('Failed to fetch leaderboard');

            const sortedUsers = await response.json();

            // Find current user's rank
            const userRankIndex = sortedUsers.findIndex(u => u.userId === user.$id);
            if (userRankIndex !== -1) {
                setCurrentUserRank(userRankIndex + 1);
            }

            setLeaderboard(sortedUsers);
        } catch (error) {
            console.error('Error fetching leaderboard:', error);
        } finally {
            setLoading(false);
        }
    };

    const getRankIcon = (rank) => {
        switch (rank) {
            case 1:
                return <Crown className="text-yellow-400" size={24} />;
            case 2:
                return <Medal className="text-gray-300" size={22} />;
            case 3:
                return <Medal className="text-amber-600" size={22} />;
            default:
                return <span className="text-gray-500 font-bold w-6 text-center">{rank}</span>;
        }
    };

    const getRankStyle = (rank) => {
        switch (rank) {
            case 1:
                return "bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-500/50";
            case 2:
                return "bg-gradient-to-r from-gray-400/20 to-gray-500/20 border-gray-400/50";
            case 3:
                return "bg-gradient-to-r from-amber-600/20 to-amber-700/20 border-amber-600/50";
            default:
                return "bg-white/5 border-white/10 hover:border-white/20";
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background">
                <Header />
                <div className="aurora-bg" />
                <div className="container mx-auto px-6 pt-32">
                    <div className="max-w-2xl mx-auto">
                        <div className="h-8 w-48 bg-white/5 rounded shimmer mb-8" />
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="h-20 bg-white/5 rounded-2xl shimmer mb-4" />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-background pb-32 safe-bottom">
            <Header />
            <div className="aurora-bg" />

            <div className="container mx-auto px-4 sm:px-6 pt-24 sm:pt-32">
                <div className="max-w-2xl mx-auto">
                    {/* Header */}
                    <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
                        <Link
                            href="/dashboard"
                            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                        >
                            <ArrowLeft size={18} />
                        </Link>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-2 sm:gap-3">
                                <Trophy className="text-yellow-400" size={24} />
                                Leaderboard
                            </h1>
                            <p className="text-gray-500 text-sm">Top learners by XP</p>
                        </div>
                    </div>

                    {/* Current User Rank Card */}
                    {currentUserRank && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="glass-panel p-4 sm:p-6 rounded-xl sm:rounded-2xl mb-6 sm:mb-8 border-primary/30"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3 sm:gap-4">
                                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-primary/20 flex items-center justify-center">
                                        <User className="text-primary" size={20} />
                                    </div>
                                    <div>
                                        <p className="text-xs sm:text-sm text-gray-400">Your Rank</p>
                                        <p className="text-xl sm:text-2xl font-bold text-white">#{currentUserRank}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs sm:text-sm text-gray-400">Your XP</p>
                                    <p className="text-xl sm:text-2xl font-bold text-primary">
                                        {leaderboard.find(u => u.userId === currentUserId)?.xp || 0}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Leaderboard List */}
                    <div className="space-y-2 sm:space-y-3">
                        {leaderboard.map((user, index) => {
                            const rank = index + 1;
                            const isCurrentUser = user.userId === currentUserId;

                            // Format last active date
                            const lastActive = new Date(user.lastActive).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric'
                            });

                            return (
                                <motion.div
                                    key={user.userId}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.03 }}
                                    className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl border transition-all ${getRankStyle(rank)} ${isCurrentUser ? 'ring-2 ring-primary/50' : ''}`}
                                >
                                    <div className="flex items-center gap-2 sm:gap-4">
                                        {/* Rank */}
                                        <div className="w-8 sm:w-10 flex justify-center">
                                            {getRankIcon(rank)}
                                        </div>

                                        {/* Avatar */}
                                        <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center text-base sm:text-lg font-bold ${rank === 1 ? 'bg-yellow-500 text-black' :
                                            rank === 2 ? 'bg-gray-400 text-black' :
                                                rank === 3 ? 'bg-amber-600 text-black' :
                                                    'bg-white/10 text-white'
                                            }`}>
                                            {user.displayName.charAt(4).toUpperCase()}
                                        </div>

                                        {/* Name & Level & Last Active */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <p className={`font-semibold text-sm sm:text-base truncate ${isCurrentUser ? 'text-primary' : 'text-white'}`}>
                                                    {isCurrentUser ? 'You' : user.displayName}
                                                </p>
                                                {isCurrentUser && <span className="text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded">Me</span>}
                                            </div>
                                            <div className="flex items-center gap-2 text-[10px] sm:text-xs text-gray-500">
                                                <span>Lvl {user.level}</span>
                                                <span>•</span>
                                                <span>Active {lastActive}</span>
                                            </div>
                                        </div>

                                        {/* XP */}
                                        <div className="text-right">
                                            <div className="flex items-center gap-1 justify-end">
                                                <Star className="text-yellow-400" size={14} />
                                                <span className="font-bold text-white text-sm sm:text-base">{user.xp.toLocaleString()}</span>
                                            </div>
                                            <p className="text-[10px] sm:text-xs text-gray-500">XP</p>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}

                        {leaderboard.length === 0 && (
                            <div className="text-center py-16 text-gray-500">
                                <Trophy size={48} className="mx-auto mb-4 opacity-20" />
                                <p>No rankings yet. Be the first to earn XP!</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}
