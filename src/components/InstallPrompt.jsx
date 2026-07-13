"use client";

import { useState, useEffect } from "react";
import { Download, Share, PlusSquare, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function InstallPrompt({ children, className }) {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showIOSPrompt, setShowIOSPrompt] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsStandalone(true);
    }

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
    };
  }, []);

  const handleInstallClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isIOS) {
      setShowIOSPrompt(true);
    } else if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(({ outcome }) => {
        if (outcome === "accepted") {
          setDeferredPrompt(null);
        }
      });
    } else {
      alert(
        "To install, tap your browser's menu and select 'Install App' or 'Add to Home Screen'.",
      );
    }
  };

  if (isStandalone) return null;
  if (!deferredPrompt && !isIOS) return null;

  return (
    <>
      {children ? (
        <div
          onClick={handleInstallClick}
          className={className || "cursor-pointer"}
        >
          {children}
        </div>
      ) : (
        <button
          onClick={handleInstallClick}
          className={`btn-primary flex w-full items-center justify-center gap-2 text-sm sm:w-auto ${className || ""}`}
        >
          <Download size={18} />
          Install App
        </button>
      )}

      <AnimatePresence>
        {showIOSPrompt && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed inset-x-4 bottom-6 z-50 md:right-6 md:left-auto md:w-96"
          >
            <div className="panel-glow border-primary/20 rounded-2xl border bg-[var(--surface)] p-5 shadow-2xl">
              <div className="mb-4 flex items-start justify-between">
                <div className="flex gap-3">
                  <div className="bg-primary flex h-12 w-12 items-center justify-center rounded-xl shadow-lg">
                    <img
                      src="/icon.png"
                      alt="App Icon"
                      className="h-8 w-8 object-contain"
                      onError={(e) => (e.target.style.display = "none")}
                    />
                  </div>
                  <div>
                    <h3 className="font-bold text-white">Install MedX</h3>
                    <p className="text-muted text-xs">
                      Add to your home screen
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowIOSPrompt(false)}
                  className="rounded-full p-1 transition hover:bg-white/10"
                >
                  <X size={18} className="text-white/60" />
                </button>
              </div>

              <div className="space-y-3 text-sm text-gray-300">
                <div className="flex items-center gap-3">
                  <span className="text-primary flex h-6 w-6 items-center justify-center rounded-full bg-white/5 text-xs font-bold">
                    1
                  </span>
                  <span>
                    Tap the{" "}
                    <Share size={14} className="mx-1 inline text-blue-400" />{" "}
                    Share button
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-primary flex h-6 w-6 items-center justify-center rounded-full bg-white/5 text-xs font-bold">
                    2
                  </span>
                  <span>
                    Select{" "}
                    <PlusSquare
                      size={14}
                      className="mx-1 inline text-gray-300"
                    />{" "}
                    Add to Home Screen
                  </span>
                </div>
              </div>

              <div className="border-primary/20 absolute -bottom-2 left-1/2 h-4 w-4 translate-x-1/2 rotate-45 transform border-r border-b bg-[var(--surface)] md:hidden"></div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
