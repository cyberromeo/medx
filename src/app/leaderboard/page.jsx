"use client";

import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Medal, Crown, Star, ArrowLeft, TrendingUp, Clock } from "lucide-react";
import Link from "next/link";

const drName = (name) => (name?.startsWith("Dr.") ? name : `Dr. ${name}`);

const timeAgo = (ms) => {
  if (!ms) return "Active recently";
  const seconds = Math.floor((new Date() - new Date(ms)) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + "y ago";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + "mo ago";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + "d ago";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + "h ago";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + "m ago";
  return "Just now";
};

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [currentUserRank, setCurrentUserRank] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUserId(user.uid);
        await fetchLeaderboard(user.uid);
      } else {
        await fetchLeaderboard(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchLeaderboard = async (userId) => {
    try {
      const response = await fetch("/api/leaderboard");
      if (!response.ok) throw new Error("Failed to fetch leaderboard");
      const sortedUsers = await response.json();

      if (userId) {
        const idx = sortedUsers.findIndex((u) => u.userId === userId);
        if (idx !== -1) setCurrentUserRank(idx + 1);
      }
      setLeaderboard(sortedUsers);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl p-6 pt-20 md:p-10">
        <div className="mb-12 flex h-40 items-end justify-center gap-4">
          <div className="h-24 w-24 animate-pulse rounded-full bg-gray-200/60" />
          <div className="mb-4 h-32 w-32 animate-pulse rounded-full bg-gray-200/80" />
          <div className="h-24 w-24 animate-pulse rounded-full bg-gray-200/60" />
        </div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="mb-3 h-20 animate-pulse rounded-2xl bg-gray-200/40" />
        ))}
      </div>
    );
  }

  const hasPodium = leaderboard.length >= 3;
  const listUsers = hasPodium ? leaderboard.slice(3) : leaderboard;

  return (
    <div className="p-4 pb-40 md:p-10 md:pb-40">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <Link
            href="/dashboard"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-[rgba(30,50,90,0.05)] bg-white shadow-sm transition-colors hover:bg-gray-50"
          >
            <ArrowLeft size={20} className="text-gray-700" />
          </Link>
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-gray-900 md:text-3xl">
              <Trophy className="text-amber-500" size={26} />
              Global Rankings
            </h1>
            <p className="mt-1 text-sm font-medium text-gray-500">
              Compete with doctors nationwide
            </p>
          </div>
        </div>

        {/* Podium */}
        {hasPodium && (
          <div className="mb-14 mt-12 flex items-end justify-center gap-2 px-2 sm:gap-6">
            {/* Rank 2 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex w-1/3 max-w-[140px] flex-col items-center pb-4"
            >
              <Medal className="mb-2 drop-shadow-sm text-gray-400" size={28} />
              <div className="group relative mb-3 h-16 w-16 sm:h-20 sm:w-20">
                <img
                  src={
                    leaderboard[1].photoURL ||
                    `https://api.dicebear.com/10.x/glyphs/svg?seed=${leaderboard[1].userId}`
                  }
                  alt="Rank 2"
                  className="h-full w-full rounded-full border-4 border-white object-cover shadow-sm"
                />
                <div className="absolute -bottom-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-gray-200 text-xs font-bold text-gray-700 shadow-sm sm:h-8 sm:w-8">
                  2
                </div>
              </div>
              <p className="w-full truncate px-1 text-center text-xs font-bold text-gray-900 sm:text-sm">
                {drName(leaderboard[1].displayName)}
              </p>
              <div className="mt-1.5 flex items-center gap-1 rounded-full border border-[rgba(30,50,90,0.05)] bg-white px-2.5 py-1 shadow-sm">
                <Star className="text-amber-500" size={12} />
                <span className="text-xs font-bold text-gray-700">
                  {leaderboard[1].xp.toLocaleString()}
                </span>
              </div>
            </motion.div>

            {/* Rank 1 */}
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className="z-10 flex w-1/3 max-w-[160px] flex-col items-center"
            >
              <Crown className="mb-2 text-amber-400 drop-shadow-md" size={40} />
              <div className="group relative mb-3 h-20 w-20 sm:h-28 sm:w-28">
                <div className="absolute inset-0 animate-pulse rounded-full bg-gradient-to-tr from-amber-300 to-yellow-100 opacity-50 blur-md" />
                <img
                  src={
                    leaderboard[0].photoURL ||
                    `https://api.dicebear.com/10.x/glyphs/svg?seed=${leaderboard[0].userId}`
                  }
                  alt="Rank 1"
                  className="relative h-full w-full rounded-full border-4 border-white object-cover shadow-md"
                />
                <div className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-gradient-to-br from-amber-300 to-amber-500 text-sm font-bold text-white shadow-md sm:h-10 sm:w-10 sm:text-lg">
                  1
                </div>
              </div>
              <p className="w-full truncate px-1 text-center text-sm font-bold text-gray-900 sm:text-base">
                {drName(leaderboard[0].displayName)}
              </p>
              <div className="mt-1.5 flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3.5 py-1 shadow-sm">
                <Star className="text-amber-500" size={14} />
                <span className="text-sm font-bold text-amber-700">
                  {leaderboard[0].xp.toLocaleString()} XP
                </span>
              </div>
            </motion.div>

            {/* Rank 3 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex w-1/3 max-w-[140px] flex-col items-center pb-6"
            >
              <Medal className="mb-2 text-orange-400 drop-shadow-sm" size={28} />
              <div className="group relative mb-3 h-16 w-16 sm:h-20 sm:w-20">
                <img
                  src={
                    leaderboard[2].photoURL ||
                    `https://api.dicebear.com/10.x/glyphs/svg?seed=${leaderboard[2].userId}`
                  }
                  alt="Rank 3"
                  className="h-full w-full rounded-full border-4 border-white object-cover shadow-sm"
                />
                <div className="absolute -bottom-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-orange-300 text-xs font-bold text-orange-900 shadow-sm sm:h-8 sm:w-8">
                  3
                </div>
              </div>
              <p className="w-full truncate px-1 text-center text-xs font-bold text-gray-900 sm:text-sm">
                {drName(leaderboard[2].displayName)}
              </p>
              <div className="mt-1.5 flex items-center gap-1 rounded-full border border-[rgba(30,50,90,0.05)] bg-white px-2.5 py-1 shadow-sm">
                <Star className="text-amber-500" size={12} />
                <span className="text-xs font-bold text-gray-700">
                  {leaderboard[2].xp.toLocaleString()}
                </span>
              </div>
            </motion.div>
          </div>
        )}

        {/* List */}
        <div className="space-y-3">
          {listUsers.map((user, index) => {
            const rank = hasPodium ? index + 4 : index + 1;
            const isCurrentUser = user.userId === currentUserId;

            return (
              <motion.div
                key={user.userId}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.04 }}
                className={`relative flex items-center gap-3 overflow-hidden rounded-2xl border p-3 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md sm:gap-4 sm:p-4 ${
                  isCurrentUser
                    ? "border-blue-300 bg-blue-50/60"
                    : "border-[rgba(30,50,90,0.05)] bg-white hover:border-gray-200"
                }`}
              >
                {isCurrentUser && (
                  <div className="absolute bottom-0 left-0 top-0 w-1.5 bg-blue-600" />
                )}
                <div className="w-8 shrink-0 text-center text-base font-bold text-gray-400 sm:w-10 sm:text-xl">
                  #{rank}
                </div>

                <div
                  className={`h-11 w-11 shrink-0 overflow-hidden rounded-2xl border-2 sm:h-12 sm:w-12 ${
                    isCurrentUser ? "border-blue-300" : "border-white"
                  } shadow-sm`}
                >
                  <img
                    src={
                      user.photoURL ||
                      `https://api.dicebear.com/10.x/glyphs/svg?seed=${user.userId}`
                    }
                    alt="Avatar"
                    className="h-full w-full bg-gray-50 object-cover"
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p
                      className={`truncate text-base font-bold ${
                        isCurrentUser ? "text-blue-700" : "text-gray-900"
                      }`}
                    >
                      {drName(user.displayName)}
                    </p>
                    {isCurrentUser && (
                      <span className="rounded bg-blue-100 px-2 py-0.5 text-[10px] font-bold tracking-wider text-blue-700 uppercase">
                        You
                      </span>
                    )}
                  </div>
                  <div className="mt-0.5 flex items-center gap-3 text-xs font-medium text-gray-500">
                    <div className="flex items-center gap-1">
                      <TrendingUp size={12} />
                      <span>Level {user.level}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock size={12} />
                      <span>{timeAgo(user.lastActive)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex shrink-0 items-center justify-end gap-1.5 rounded-xl border border-[rgba(30,50,90,0.05)] bg-gray-50 px-2.5 py-1.5 sm:px-3">
                  <Star className="text-amber-500" size={16} />
                  <span className="text-sm font-bold text-gray-900 sm:text-base">
                    {user.xp.toLocaleString()}
                  </span>
                </div>
              </motion.div>
            );
          })}

          {leaderboard.length === 0 && (
            <div className="rounded-3xl border border-dashed border-[rgba(30,50,90,0.15)] bg-gray-50 py-20 text-center">
              <Trophy size={48} className="mx-auto mb-4 opacity-20" />
              <p className="text-lg font-bold text-gray-900">No rankings yet.</p>
              <p className="mt-1 text-sm font-medium text-gray-500">
                Be the first to complete a video and earn XP.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Sticky current user rank */}
      <AnimatePresence>
        {currentUserRank && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="pointer-events-none fixed inset-x-0 bottom-0 z-40 p-4 pb-[calc(env(safe-area-inset-bottom)+5.5rem)] md:pb-8"
          >
            <div className="mx-auto max-w-3xl">
              <div className="pointer-events-auto flex items-center justify-between rounded-[1.5rem] border border-blue-200 bg-white/95 p-4 shadow-[0_-8px_30px_rgba(37,99,235,0.12)] backdrop-blur-xl md:rounded-[2rem] md:p-5">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-blue-100 bg-gradient-to-br from-blue-500 to-blue-700 text-2xl font-bold text-white shadow-lg">
                    #{currentUserRank}
                  </div>
                  <div>
                    <p className="text-lg font-bold text-gray-900">Your Rank</p>
                    <p className="text-xs font-semibold tracking-widest text-blue-600 uppercase">
                      Keep pushing!
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-end gap-1.5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-2 shadow-sm">
                  <Star className="text-amber-500" size={20} />
                  <span className="text-xl font-bold text-amber-700">
                    {leaderboard.find((u) => u.userId === currentUserId)?.xp.toLocaleString() || 0}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}