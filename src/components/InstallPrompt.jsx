"use client";

import { useState, useEffect } from "react";
import { Download, Share, PlusSquare, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function InstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [isIOS, setIsIOS] = useState(false);
    const [isStandalone, setIsStandalone] = useState(false);
    const [showIOSPrompt, setShowIOSPrompt] = useState(false);

    useEffect(() => {
        // Check if already installed
        if (window.matchMedia("(display-mode: standalone)").matches) {
            setIsStandalone(true);
        }

        // Android/Chrome
        const handleBeforeInstallPrompt = (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
        };

        window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

        // iOS Detection
        const userAgent = window.navigator.userAgent.toLowerCase();
        const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
        setIsIOS(isIosDevice);

        return () => {
            window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
        };
    }, []);

    const handleInstallClick = async () => {
        if (isIOS) {
            setShowIOSPrompt(true);
        } else if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === "accepted") {
                setDeferredPrompt(null);
            }
        } else {
            // Fallback or instructions if no prompt available (uncommon on logic path but safe)
            alert("To install, tap your browser's menu and select 'Install App' or 'Add to Home Screen'.");
        }
    };

    // Don't show if already installed or if on non-installable desktop without prompt (optional refinment)
    if (isStandalone) return null;
    if (!deferredPrompt && !isIOS) return null; // Hide if browser doesn't support install prompt (unless iOS)

    return (
        <>
            <button
                onClick={handleInstallClick}
                className="btn-primary flex items-center gap-2 w-full sm:w-auto justify-center text-sm"
            >
                <Download size={18} />
                Install App
            </button>

            <AnimatePresence>
                {showIOSPrompt && (
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                        className="fixed inset-x-4 bottom-6 z-50 md:right-6 md:left-auto md:w-96"
                    >
                        <div className="panel-glow bg-[var(--surface)] border border-primary/20 rounded-2xl p-5 shadow-2xl">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex gap-3">
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg">
                                        <img src="/icon.png" alt="App Icon" className="w-8 h-8 object-contain" onError={(e) => e.target.style.display = 'none'} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white">Install MedX</h3>
                                        <p className="text-xs text-muted">Add to your home screen</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowIOSPrompt(false)}
                                    className="p-1 hover:bg-white/10 rounded-full transition"
                                >
                                    <X size={18} className="text-white/60" />
                                </button>
                            </div>

                            <div className="space-y-3 text-sm text-gray-300">
                                <div className="flex items-center gap-3">
                                    <span className="w-6 h-6 flex items-center justify-center bg-white/5 rounded-full text-xs font-bold text-primary">1</span>
                                    <span>Tap the <Share size={14} className="inline mx-1 text-blue-400" /> Share button</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="w-6 h-6 flex items-center justify-center bg-white/5 rounded-full text-xs font-bold text-primary">2</span>
                                    <span>Select <PlusSquare size={14} className="inline mx-1 text-gray-300" /> Add to Home Screen</span>
                                </div>
                            </div>

                            <div className="absolute -bottom-2 transform translate-x-1/2 left-1/2 w-4 h-4 bg-[var(--surface)] border-r border-b border-primary/20 rotate-45 md:hidden"></div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
