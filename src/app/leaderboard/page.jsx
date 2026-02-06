"use client";

import { useEffect, useState } from "react";
import { account } from "@/lib/appwrite";
import Header from "@/components/Header";
import { motion } from "framer-motion";
import { Trophy, Medal, Crown, Star, ArrowLeft, User } from "lucide-react";
import Link from "next/link";

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [currentUserRank, setCurrentUserRank] = useState(null);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const user = await account.get();
      setCurrentUserId(user.$id);

      const response = await fetch("/api/leaderboard");
      if (!response.ok) throw new Error("Failed to fetch leaderboard");

      const sortedUsers = await response.json();
      const userRankIndex = sortedUsers.findIndex(u => u.userId === user.$id);
      if (userRankIndex !== -1) {
        setCurrentUserRank(userRankIndex + 1);
      }

      setLeaderboard(sortedUsers);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return <Crown className="text-secondary" size={24} />;
      case 2:
        return <Medal className="text-primary" size={22} />;
      case 3:
        return <Medal className="text-white/70" size={22} />;
      default:
        return <span className="text-muted font-bold w-6 text-center">{rank}</span>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="halo-bg" />
        <div className="grid-bg" />
        <div className="container mx-auto px-6 pt-32">
          <div className="max-w-2xl mx-auto">
            <div className="h-8 w-48 bg-white/5 rounded animate-pulse mb-8" />
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-white/5 rounded-2xl animate-pulse mb-4" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const topThree = leaderboard.slice(0, 3);

  return (
    <main className="min-h-screen pb-32">
      <Header />
      <div className="halo-bg" />
      <div className="grid-bg" />

      <div className="container mx-auto px-4 sm:px-6 pt-24 sm:pt-32">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
            <Link
              href="/dashboard"
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
            >
              <ArrowLeft size={18} />
            </Link>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-2 sm:gap-3">
                <Trophy className="text-secondary" size={24} />
                Leaderboard
              </h1>
              <p className="text-muted text-sm">Top learners by XP</p>
            </div>
          </div>

          {topThree.length > 0 && (
            <div className="grid grid-cols-3 gap-3 mb-8">
              {topThree.map((user, index) => {
                const rank = index + 1;
                return (
                  <div key={user.userId} className="panel rounded-2xl p-4 text-center">
                    <div className="flex justify-center mb-2">{getRankIcon(rank)}</div>
                    <div className="w-10 h-10 rounded-xl bg-white/10 mx-auto flex items-center justify-center text-sm font-bold">
                      {user.displayName.charAt(0).toUpperCase()}
                    </div>
                    <p className="text-xs text-muted mt-2 truncate">{user.displayName}</p>
                    <div className="flex items-center justify-center gap-1 mt-1">
                      <Star className="text-secondary" size={12} />
                      <span className="text-xs font-semibold text-white">{user.xp.toLocaleString()}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {currentUserRank && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="panel rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8 border border-primary-soft"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-primary-soft flex items-center justify-center">
                    <User className="text-primary" size={20} />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-muted">Your Rank</p>
                    <p className="text-xl sm:text-2xl font-bold text-white">#{currentUserRank}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs sm:text-sm text-muted">Your XP</p>
                  <p className="text-xl sm:text-2xl font-bold text-primary">
                    {leaderboard.find(u => u.userId === currentUserId)?.xp || 0}
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          <div className="space-y-2 sm:space-y-3">
            {leaderboard.map((user, index) => {
              const rank = index + 1;
              const isCurrentUser = user.userId === currentUserId;

              const lastActive = new Date(user.lastActive).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric"
              });

              return (
                <motion.div
                  key={user.userId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className={`panel rounded-2xl p-3 sm:p-4 border transition-all ${isCurrentUser ? "border-primary-soft" : "border-white/10"}`}
                >
                  <div className="flex items-center gap-2 sm:gap-4">
                    <div className="w-8 sm:w-10 flex justify-center">
                      {getRankIcon(rank)}
                    </div>

                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center text-base sm:text-lg font-bold bg-white/10 text-white">
                      {user.displayName.charAt(0).toUpperCase()}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={`font-semibold text-sm sm:text-base truncate ${isCurrentUser ? "text-primary" : "text-white"}`}>
                          {isCurrentUser ? "You" : user.displayName}
                        </p>
                        {isCurrentUser && <span className="text-[10px] bg-primary-soft text-primary px-1.5 py-0.5 rounded">Me</span>}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] sm:text-xs text-muted">
                        <span>Lvl {user.level}</span>
                        <span>-</span>
                        <span>Active {lastActive}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="flex items-center gap-1 justify-end">
                        <Star className="text-secondary" size={14} />
                        <span className="font-bold text-white text-sm sm:text-base">{user.xp.toLocaleString()}</span>
                      </div>
                      <p className="text-[10px] sm:text-xs text-muted">XP</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}

            {leaderboard.length === 0 && (
              <div className="text-center py-16 text-muted">
                <Trophy size={48} className="mx-auto mb-4 opacity-20" />
                <p>No rankings yet. Be the first to earn XP.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
