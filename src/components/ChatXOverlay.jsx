"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import ChatXPanel from "@/components/ChatXPanel";

export default function ChatXOverlay({ open, onClose }) {
  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60]"
        >
          <button
            onClick={onClose}
            className="absolute inset-0 bg-gray-900/20 backdrop-blur-sm"
            aria-label="Close discuss overlay"
          />
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -50, opacity: 0 }}
            transition={{ type: "spring", stiffness: 240, damping: 26 }}
            className="absolute bottom-3 left-3 right-3 md:bottom-6 md:left-[130px] md:right-auto md:top-auto"
          >
            <ChatXPanel
              onClose={onClose}
              className="h-[72vh] w-full rounded-3xl md:h-[80vh] md:w-[420px]"
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
