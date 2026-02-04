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
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            aria-label="Close chat overlay"
          />
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 30, opacity: 0 }}
            transition={{ type: "spring", stiffness: 240, damping: 26 }}
            className="absolute left-3 right-3 bottom-3 md:left-auto md:right-6 md:bottom-auto md:top-20"
          >
            <ChatXPanel
              onClose={onClose}
              className="h-[72vh] md:h-[70vh] w-full md:w-[420px] rounded-3xl"
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
