"use client";

import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Medal, Crown, Star, ArrowLeft, TrendingUp } from "lucide-react";
import Link from "next/link";

const drName = (name) => (name?.startsWith("Dr.") ? name : `Dr. ${name}`);

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
        const userRankIndex = sortedUsers.findIndex((u) => u.userId === userId);
        if (userRankIndex !== -1) {
          setCurrentUserRank(userRankIndex + 1);
        }
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
      <div className="p-6 sm:p-10 min-h-screen bg-[#f0f0f0]">
        <div className="container mx-auto">
          <div className="mx-auto max-w-2xl">
            <div className="mb-8 h-8 w-48 animate-pulse rounded-lg bg-[#898989]/20" />
            <div className="flex justify-center items-end gap-4 mb-12 h-40">
              <div className="w-24 h-24 bg-[#898989]/10 rounded-full animate-pulse" />
              <div className="w-32 h-32 bg-[#898989]/20 rounded-full animate-pulse mb-4" />
              <div className="w-24 h-24 bg-[#898989]/10 rounded-full animate-pulse" />
            </div>
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="mb-3 h-20 animate-pulse rounded-2xl bg-white/40"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Split Top 3 and the rest
  const hasPodium = leaderboard.length >= 3;
  const listUsers = hasPodium ? leaderboard.slice(3) : leaderboard;

  return (
    <div className="min-h-screen bg-[#f0f0f0] p-6 sm:p-10 pb-40">
      <div className="container mx-auto">
        <div className="mx-auto max-w-3xl relative">
          
          {/* Header */}
          <div className="mb-10 flex items-center gap-4">
            <Link
              href="/dashboard"
              className="rounded-xl bg-white/60 shadow-sm border border-[#898989]/20 p-2.5 transition-colors hover:bg-white"
            >
              <ArrowLeft size={20} className="text-[#303030]" />
            </Link>
            <div>
              <h1 className="flex items-center gap-2 text-3xl font-extrabold text-[#303030] tracking-tight">
                <Trophy className="text-amber-500" size={28} />
                Global Rankings
              </h1>
              <p className="text-[#898989] text-sm font-medium mt-1">Compete with doctors nationwide</p>
            </div>
          </div>

          {/* Podium (Top 3) */}
          {hasPodium && (
            <div className="mb-14 flex items-end justify-center gap-2 sm:gap-6 px-2 mt-12">
              {/* Rank 2 - Left */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="w-1/3 max-w-[140px] flex flex-col items-center pb-4"
              >
                <div className="mb-2">
                  <Medal className="text-gray-400 drop-shadow-sm" size={28} />
                </div>
                <div className="relative w-16 h-16 sm:w-20 sm:h-20 mb-3 group cursor-default">
                  <div className="absolute inset-0 bg-gradient-to-tr from-gray-300 to-gray-100 rounded-full blur-md opacity-50 group-hover:opacity-80 transition-opacity"></div>
                  <img src={leaderboard[1].photoURL || `https://api.dicebear.com/10.x/glyphs/svg?seed=${leaderboard[1].userId}`} alt="Rank 2" className="relative w-full h-full rounded-full object-cover border-4 border-white z-10 shadow-sm" />
                  <div className="absolute -bottom-2 -right-2 bg-gray-200 text-gray-700 w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm border-2 border-white z-20 shadow-sm">2</div>
                </div>
                <p className="text-[#303030] font-bold text-xs sm:text-sm text-center truncate w-full px-1">{drName(leaderboard[1].displayName)}</p>
                <div className="flex items-center gap-1 mt-1.5 bg-white/60 backdrop-blur-md px-2.5 py-1 rounded-full shadow-sm border border-[#898989]/10">
                  <Star className="text-amber-500" size={12} />
                  <span className="text-xs font-bold text-[#5E6470]">{leaderboard[1].xp.toLocaleString()}</span>
                </div>
              </motion.div>

              {/* Rank 1 - Center (Highest) */}
              <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className="w-1/3 max-w-[160px] flex flex-col items-center z-10"
              >
                <div className="mb-2">
                  <Crown className="text-amber-400 drop-shadow-md" size={40} />
                </div>
                <div className="relative w-20 h-20 sm:w-28 sm:h-28 mb-3 group cursor-default">
                  <div className="absolute inset-0 bg-gradient-to-tr from-amber-400 to-yellow-200 rounded-full blur-lg opacity-60 animate-pulse group-hover:opacity-100 transition-opacity"></div>
                  <img src={leaderboard[0].photoURL || `https://api.dicebear.com/10.x/glyphs/svg?seed=${leaderboard[0].userId}`} alt="Rank 1" className="relative w-full h-full rounded-full object-cover border-4 border-white z-10 shadow-md" />
                  <div className="absolute -bottom-2 -right-2 bg-gradient-to-br from-amber-300 to-amber-500 text-white w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-extrabold text-sm sm:text-lg border-2 border-white z-20 shadow-md">1</div>
                </div>
                <p className="text-[#303030] font-extrabold text-sm sm:text-base text-center truncate w-full px-1">{drName(leaderboard[0].displayName)}</p>
                <div className="flex items-center gap-1.5 mt-1.5 bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 px-3.5 py-1 rounded-full shadow-sm">
                  <Star className="text-amber-500" size={14} />
                  <span className="text-sm font-extrabold text-amber-700">{leaderboard[0].xp.toLocaleString()} XP</span>
                </div>
              </motion.div>

              {/* Rank 3 - Right */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="w-1/3 max-w-[140px] flex flex-col items-center pb-6"
              >
                <div className="mb-2">
                  <Medal className="text-orange-400 drop-shadow-sm" size={28} />
                </div>
                <div className="relative w-16 h-16 sm:w-20 sm:h-20 mb-3 group cursor-default">
                  <div className="absolute inset-0 bg-gradient-to-tr from-orange-300 to-orange-100 rounded-full blur-md opacity-50 group-hover:opacity-80 transition-opacity"></div>
                  <img src={leaderboard[2].photoURL || `https://api.dicebear.com/10.x/glyphs/svg?seed=${leaderboard[2].userId}`} alt="Rank 3" className="relative w-full h-full rounded-full object-cover border-4 border-white z-10 shadow-sm" />
                  <div className="absolute -bottom-2 -right-2 bg-orange-300 text-orange-900 w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm border-2 border-white z-20 shadow-sm">3</div>
                </div>
                <p className="text-[#303030] font-bold text-xs sm:text-sm text-center truncate w-full px-1">{drName(leaderboard[2].displayName)}</p>
                <div className="flex items-center gap-1 mt-1.5 bg-white/60 backdrop-blur-md px-2.5 py-1 rounded-full shadow-sm border border-[#898989]/10">
                  <Star className="text-amber-500" size={12} />
                  <span className="text-xs font-bold text-[#5E6470]">{leaderboard[2].xp.toLocaleString()}</span>
                </div>
              </motion.div>
            </div>
          )}

          {/* List for 4th and below */}
          <div className="space-y-3">
            {listUsers.map((user, index) => {
              const rank = hasPodium ? index + 4 : index + 1;
              const isCurrentUser = user.userId === currentUserId;

              return (
                <motion.div
                  key={user.userId}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`relative overflow-hidden bg-white/60 backdrop-blur-md rounded-2xl border p-4 transition-all duration-300 shadow-sm hover:shadow-md hover:scale-[1.01] ${
                    isCurrentUser ? "border-blue-400 bg-white ring-1 ring-blue-400/50" : "border-[#898989]/20 hover:bg-white"
                  }`}
                >
                  {isCurrentUser && (
                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-blue-500" />
                  )}
                  
                  <div className="flex items-center gap-4">
                    <div className="w-8 sm:w-10 text-center font-extrabold text-[#898989] text-lg sm:text-xl shrink-0">
                      #{rank}
                    </div>

                    <div className={`flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl border-2 shrink-0 ${
                      isCurrentUser ? "border-blue-400 shadow-sm" : "border-white shadow-sm"
                    }`}>
                      <img src={user.photoURL || `https://api.dicebear.com/10.x/glyphs/svg?seed=${user.userId}`} alt="Avatar" className="w-full h-full object-cover bg-pink-50" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className={`truncate text-base font-bold ${isCurrentUser ? "text-blue-700" : "text-[#303030]"}`}>
                          {drName(user.displayName)}
                        </p>
                        {isCurrentUser && (
                          <span className="bg-blue-100 text-blue-700 rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                            You
                          </span>
                        )}
                      </div>
                      <div className="text-[#898989] font-medium flex items-center gap-1.5 text-xs mt-0.5">
                        <TrendingUp size={12} />
                        <span>Level {user.level}</span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="flex items-center justify-end gap-1.5 bg-[#898989]/5 px-3 py-1.5 rounded-xl border border-[#898989]/10">
                        <Star className="text-amber-500" size={16} />
                        <span className="text-base font-extrabold text-[#303030]">
                          {user.xp.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}

            {leaderboard.length === 0 && (
              <div className="text-[#898989] py-20 text-center bg-white/40 rounded-3xl border border-dashed border-[#898989]/30">
                <Trophy size={48} className="mx-auto mb-4 opacity-20" />
                <p className="font-bold text-lg text-[#303030]">No rankings yet.</p>
                <p className="font-medium text-sm mt-1">Be the first to complete a video and earn XP.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sticky Footer for Current User */}
      <AnimatePresence>
        {currentUserRank && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed bottom-0 left-0 right-0 z-40 p-4 sm:p-6 pb-[5.5rem] md:pb-8 pointer-events-none"
          >
            <div className="container mx-auto">
              <div className="mx-auto max-w-3xl bg-white/90 backdrop-blur-xl border border-blue-200 shadow-[0_-10px_40px_rgba(37,99,235,0.15)] rounded-[2rem] p-4 sm:p-5 pointer-events-auto flex items-center justify-between">
                
                <div className="flex items-center gap-4">
                  <div className="bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow-lg flex h-14 w-14 items-center justify-center rounded-[1.2rem] font-extrabold text-2xl border-2 border-blue-100">
                    #{currentUserRank}
                  </div>
                  <div>
                    <p className="text-[#303030] font-extrabold text-lg">Your Rank</p>
                    <p className="text-blue-600 text-xs font-bold uppercase tracking-widest mt-0.5">Keep pushing!</p>
                  </div>
                </div>

                <div className="text-right flex flex-col items-end">
                  <div className="flex items-center justify-end gap-1.5 bg-amber-50 px-4 py-2 rounded-2xl border border-amber-200 shadow-sm">
                    <Star className="text-amber-500" size={20} />
                    <span className="text-amber-700 font-extrabold text-xl">
                      {leaderboard.find((u) => u.userId === currentUserId)?.xp.toLocaleString() || 0}
                    </span>
                  </div>
                </div>

              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
