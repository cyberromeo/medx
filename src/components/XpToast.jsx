"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Flame, TrendingUp, Award } from "lucide-react";

export default function XpToast({ show, xp, type = "start", streakBonus = 0, leveledUp = false, newLevel = null, onDone }) {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (show && xp > 0) {
            setVisible(true);
            const timer = setTimeout(() => {
                setVisible(false);
                setTimeout(() => onDone?.(), 400);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [show, xp]);

    const isComplete = type === "complete";

    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    initial={{ opacity: 0, y: 40, scale: 0.85 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.9 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    className="fixed bottom-24 left-1/2 z-[100] -translate-x-1/2"
                >
                    {/* Level Up Burst */}
                    {leveledUp && (
                        <motion.div
                            initial={{ scale: 0, opacity: 1 }}
                            animate={{ scale: 3, opacity: 0 }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className="absolute inset-0 rounded-full"
                            style={{ background: "radial-gradient(circle, rgba(45,212,191,0.4), transparent 70%)" }}
                        />
                    )}

                    <div className={`xp-toast ${isComplete ? "xp-toast-complete" : "xp-toast-start"}`}>
                        <div className="flex items-center gap-3">
                            {/* Icon */}
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isComplete ? "bg-secondary/20" : "bg-primary/20"}`}>
                                {leveledUp ? (
                                    <Award className="text-secondary" size={22} />
                                ) : isComplete ? (
                                    <Star className="text-secondary" size={20} />
                                ) : (
                                    <TrendingUp className="text-primary" size={20} />
                                )}
                            </div>

                            {/* Content */}
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className={`text-lg font-bold font-mono ${isComplete ? "text-secondary" : "text-primary"}`}>
                                        +{xp} XP
                                    </span>
                                    {streakBonus > 0 && (
                                        <span className="flex items-center gap-1 text-xs text-orange-400 font-semibold">
                                            <Flame size={12} />
                                            +{streakBonus}
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs text-white/60">
                                    {leveledUp
                                        ? `Level Up! You're now Level ${newLevel}`
                                        : isComplete
                                            ? "Video completed!"
                                            : "Started watching"
                                    }
                                </p>
                            </div>
                        </div>

                        {/* XP fill bar */}
                        <motion.div
                            initial={{ width: "100%" }}
                            animate={{ width: "0%" }}
                            transition={{ duration: 3, ease: "linear" }}
                            className={`absolute bottom-0 left-0 h-[2px] rounded-full ${isComplete ? "bg-secondary/60" : "bg-primary/60"}`}
                        />
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
